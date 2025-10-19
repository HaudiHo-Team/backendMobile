import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { useVoiceRecording } from '../../hooks';
import { audioUtils } from '../../utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string) => void;
  onCancel: () => void;
}

const { width } = Dimensions.get('window');

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
}) => {
  const [showRecorder, setShowRecorder] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnimations = useRef<Animated.Value[]>([]).current;
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    hasPermission,
    isRecording,
    recordingTime,
    audioUri,
    isPlaying,
    startRecording,
    stopRecording,
    playRecording,
    cancelRecording,
    requestAudioPermission,
  } = useVoiceRecording();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanup = () => {
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
  };

  useEffect(() => {
    for (let i = 0; i < 20; i++) {
      waveAnimations[i] = new Animated.Value(0.3);
    }

    return () => {
      if (waveIntervalRef.current) {
        clearInterval(waveIntervalRef.current);
      }
      cleanup();
    };
  }, []);

  const startWaveAnimation = () => {
    waveIntervalRef.current = setInterval(() => {
      waveAnimations.forEach((anim, index) => {
        const randomHeight = Math.random() * 0.7 + 0.3;
        Animated.timing(anim, {
          toValue: randomHeight,
          duration: 100 + Math.random() * 200,
          useNativeDriver: false,
        }).start();
      });
    }, 150);
  };

  const stopWaveAnimation = () => {
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
    waveAnimations.forEach(anim => {
      Animated.timing(anim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleStartRecording = async () => {
    try {
      if (!hasPermission) {
        const granted = await requestAudioPermission();
        if (!granted) {
          return;
        }
      }

      await startRecording();

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();
    } catch (error) {
      console.error('Ошибка начала записи:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    } catch (error) {
      console.error('Ошибка остановки записи:', error);
    }
  };

  const handlePlayRecording = async () => {
    if (audioUri) {
      try {
        await audioUtils.playAudio(audioUri);
      } catch (error) {
        console.error('Ошибка воспроизведения:', error);
        Alert.alert('Ошибка', 'Не удалось воспроизвести запись');
      }
    }
  };

  const handleSendRecording = () => {
    if (audioUri) {
      onRecordingComplete(audioUri);
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
    cleanup();
    onCancel();
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Разрешение на запись</Text>
          <Text style={styles.subtitle}>
            Для записи голосовых сообщений нужно разрешение на доступ к
            микрофону
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestAudioPermission}
          >
            <Text style={styles.permissionText}>Предоставить разрешение</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelRecording}
          >
            <Text style={styles.cancelText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {!isRecording && !audioUri && (
          <>
            <Text style={styles.title}>Запись голосового сообщения</Text>
            <Text style={styles.subtitle}>
              Нажмите и удерживайте кнопку для записи
            </Text>

            <TouchableOpacity
              style={styles.recordButton}
              onPressIn={handleStartRecording}
              onPressOut={handleStopRecording}
              activeOpacity={0.8}
            >
              <Text style={styles.recordIcon}>🎤</Text>
            </TouchableOpacity>

            <Text style={styles.recordHint}>
              Нажмите и удерживайте для записи
            </Text>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRecording}
            >
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
          </>
        )}

        {isRecording && (
          <TouchableOpacity
            style={styles.recordingScreen}
            onPress={handleStopRecording}
            activeOpacity={0.9}
          >
            <Animated.View
              style={[
                styles.recordingContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.recordingIcon}>🔴</Text>
            </Animated.View>

            <Text style={styles.recordingText}>Запись...</Text>
            <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>

            {/* Волны звука */}
            <View style={styles.waveContainer}>
              {waveAnimations.map((anim, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height: anim.interpolate({
                        inputRange: [0.3, 1.0],
                        outputRange: [10, 40],
                      }),
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={styles.stopHint}>
              Нажмите в любом месте для остановки
            </Text>

            <View style={styles.stopButton}>
              <Text style={styles.stopText}>⏹️ Остановить</Text>
            </View>
          </TouchableOpacity>
        )}

        {audioUri && !isRecording && (
          <>
            <Text style={styles.title}>Запись завершена</Text>
            <Text style={styles.subtitle}>
              Длительность: {formatTime(recordingTime)}
            </Text>

            <View style={styles.playbackContainer}>
              <TouchableOpacity
                style={[
                  styles.playButton,
                  isPlaying && styles.playButtonActive,
                ]}
                onPress={handlePlayRecording}
                disabled={isPlaying}
              >
                <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </TouchableOpacity>
              <Text style={styles.playbackText}>
                {isPlaying ? 'Воспроизведение...' : 'Прослушать'}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendRecording}
              >
                <Text style={styles.sendText}>Отправить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleCancelRecording}
              >
                <Text style={styles.retryText}>Записать заново</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: '#7f8c8d',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.error,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recordIcon: {
    fontSize: 32,
  },
  recordHint: {
    fontSize: FONT_SIZES.sm,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  recordingContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  recordingIcon: {
    fontSize: 32,
  },
  recordingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  timerText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: SPACING.lg,
  },
  recordingScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  stopButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: 25,
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stopText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  stopHint: {
    fontSize: FONT_SIZES.sm,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  playIcon: {
    fontSize: 20,
  },
  playbackText: {
    fontSize: FONT_SIZES.md,
    color: '#2c3e50',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
  },
  sendText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  retryText: {
    color: '#2c3e50',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  cancelText: {
    color: '#2c3e50',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginVertical: SPACING.lg,
    gap: 2,
  },
  waveBar: {
    width: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  playButtonActive: {
    backgroundColor: '#4CAF50',
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: 25,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  permissionText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export { VoiceRecorder };
