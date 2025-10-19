import { Platform, PermissionsAndroid, Alert } from 'react-native';

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  wavFile: string;
}

export interface AudioState {
  isRecording: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  duration: number;
  currentTime: number;
  audioFile: string;
  hasPermission: boolean;
}

export class AudioUtils {
  private static instance: AudioUtils;
  private state: AudioState = {
    isRecording: false,
    isPlaying: false,
    isPaused: false,
    duration: 0,
    currentTime: 0,
    audioFile: '',
    hasPermission: false,
  };

  private listeners: ((state: AudioState) => void)[] = [];

  private constructor() {
  }

  public static getInstance(): AudioUtils {
    if (!AudioUtils.instance) {
      AudioUtils.instance = new AudioUtils();
    }
    return AudioUtils.instance;
  }

  /**
   * Запрос разрешений на запись аудио
   */
  public async requestAudioPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Разрешение на запись аудио',
            message: 'Приложению нужно разрешение на запись аудио для голосовых сообщений',
            buttonNeutral: 'Спросить позже',
            buttonNegative: 'Отмена',
            buttonPositive: 'OK',
          }
        );
        
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        this.updateState({ hasPermission });
        return hasPermission;
      } else {
        this.updateState({ hasPermission: true });
        return true;
      }
    } catch (error) {
      console.error('Ошибка запроса разрешений:', error);
      this.updateState({ hasPermission: false });
      return false;
    }
  }

  /**
   * Проверка текущего статуса разрешений
   */
  public async checkAudioPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        this.updateState({ hasPermission: granted });
        return granted;
      } else {
        this.updateState({ hasPermission: true });
        return true;
      }
    } catch (error) {
      console.error('Ошибка проверки разрешений:', error);
      return false;
    }
  }

  /**
   * Начать запись аудио (заглушка)
   */
  public async startRecording(): Promise<string> {
    try {
      if (!this.state.hasPermission) {
        const hasPermission = await this.requestAudioPermission();
        if (!hasPermission) {
          throw new Error('Нет разрешения на запись аудио');
        }
      }

      const fileName = `voice_${Date.now()}.wav`;
      const filePath = `file:///tmp/${fileName}`;
      
      this.updateState({
        isRecording: true,
        audioFile: filePath,
        currentTime: 0,
      });

      console.log('Recording started (mock):', filePath);
      return filePath;
    } catch (error) {
      console.error('Ошибка начала записи:', error);
      throw error;
    }
  }

  /**
   * Остановить запись аудио (заглушка)
   */
  public async stopRecording(): Promise<string> {
    try {
      if (!this.state.isRecording) {
        throw new Error('Запись не активна');
      }

      const filePath = this.state.audioFile;
      
      this.updateState({
        isRecording: false,
        audioFile: filePath,
      });

      console.log('Recording stopped (mock):', filePath);
      return filePath;
    } catch (error) {
      console.error('Ошибка остановки записи:', error);
      throw error;
    }
  }

  /**
   * Воспроизвести аудио файл (заглушка)
   */
  public async playAudio(filePath: string): Promise<void> {
    try {
      console.log('Playing audio from (mock):', filePath);
      
      this.updateState({
        isPlaying: true,
        isPaused: false,
        duration: 0,
      });

      // Простая имитация воспроизведения
      setTimeout(() => {
        this.updateState({
          isPlaying: false,
          isPaused: false,
          currentTime: 0,
        });
      }, 2000); // 2 секунды
    } catch (error) {
      console.error('Ошибка воспроизведения:', error);
      throw error;
    }
  }

  /**
   * Приостановить воспроизведение
   */
  public pauseAudio(): void {
    if (this.state.isPlaying) {
      this.updateState({
        isPlaying: false,
        isPaused: true,
      });
    }
  }

  /**
   * Возобновить воспроизведение
   */
  public resumeAudio(): void {
    if (this.state.isPaused) {
      this.updateState({
        isPlaying: true,
        isPaused: false,
      });
    }
  }

  /**
   * Остановить воспроизведение
   */
  public stopAudio(): void {
    this.updateState({
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
    });
  }

  /**
   * Установить позицию воспроизведения
   */
  public seekTo(position: number): void {
    this.updateState({ currentTime: position });
  }

  /**
   * Получить текущее состояние аудио
   */
  public getState(): AudioState {
    return { ...this.state };
  }

  /**
   * Подписаться на изменения состояния
   */
  public subscribe(listener: (state: AudioState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Обновить состояние и уведомить подписчиков
   */
  private updateState(newState: Partial<AudioState>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Очистить ресурсы
   */
  public cleanup(): void {
    this.updateState({
      isRecording: false,
      isPlaying: false,
      isPaused: false,
      audioFile: '',
    });
  }

  /**
   * Форматировать время в MM:SS
   */
  public formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Получить размер аудио файла
   */
  public async getAudioFileSize(filePath: string): Promise<number> {
    try {
      return 0;
    } catch (error) {
      console.error('Ошибка получения размера файла:', error);
      return 0;
    }
  }

  /**
   * Проверить, поддерживается ли аудио на устройстве
   */
  public isAudioSupported(): boolean {
    return true;
  }

  /**
   * Получить доступные аудио форматы
   */
  public getSupportedFormats(): string[] {
    return ['wav', 'mp3', 'aac', 'm4a'];
  }
}

export const audioUtils = AudioUtils.getInstance();

export const PermissionUtils = {
  /**
   * Запросить все необходимые разрешения для аудио
   */
  async requestAllAudioPermissions(): Promise<boolean> {
    const audioPermission = await audioUtils.requestAudioPermission();
    return audioPermission;
  },

  /**
   * Проверить все разрешения
   */
  async checkAllPermissions(): Promise<{
    audio: boolean;
    camera: boolean;
    gallery: boolean;
  }> {
    const audio = await audioUtils.checkAudioPermission();
    
    return {
      audio,
      camera: false,
      gallery: false,
    };
  },

  /**
   * Показать диалог с объяснением необходимости разрешений
   */
  showPermissionDialog(title: string, message: string): void {
    Alert.alert(title, message, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Настройки', onPress: () => {
        console.log('Открыть настройки');
      }},
    ]);
  },
};

export const AudioConstants = {
  SAMPLE_RATES: [8000, 16000, 22050, 44100, 48000],
  CHANNELS: [1, 2],
  BIT_DEPTHS: [8, 16, 24, 32],
  FORMATS: ['wav', 'mp3', 'aac', 'm4a'],
  MAX_RECORDING_DURATION: 300,
  MIN_RECORDING_DURATION: 1,
};

export default AudioUtils;