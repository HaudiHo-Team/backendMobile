import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { audioUtils } from '../utils';

export const usePermissions = () => {
  const [hasPermission, setHasPermission] = useState(false);

  const requestAudioPermission = useCallback(async () => {
    try {
      const granted = await audioUtils.requestAudioPermission();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Ошибка запроса разрешений:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  useEffect(() => {
    requestAudioPermission();
  }, [requestAudioPermission]);

  return { hasPermission, requestAudioPermission };
};

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioPath, setCurrentAudioPath] = useState<string | null>(null);

  const playRecording = useCallback(async (path: string) => {
    if (isPlaying) {
      audioUtils.stopAudio();
      setIsPlaying(false);
    }
    setCurrentAudioPath(path);
    setIsPlaying(true);
    try {
      await audioUtils.playAudio(path);
      setIsPlaying(false);
      setCurrentAudioPath(null);
    } catch (error) {
      console.error('Ошибка воспроизведения аудио:', error);
      Alert.alert('Ошибка', 'Не удалось воспроизвести аудио');
      setIsPlaying(false);
      setCurrentAudioPath(null);
    }
  }, [isPlaying]);

  const stopPlaying = useCallback(() => {
    audioUtils.stopAudio();
    setIsPlaying(false);
    setCurrentAudioPath(null);
  }, []);

  return { isPlaying, currentAudioPath, playRecording, stopPlaying };
};

export const useVoiceRecording = () => {
  const { hasPermission, requestAudioPermission } = usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { isPlaying, playRecording, stopPlaying } = useAudio();

  const startRecording = useCallback(async () => {
    if (!hasPermission) {
      Alert.alert('Ошибка', 'Нет разрешения на запись аудио');
      return;
    }
    setIsRecording(true);
    setRecordingTime(0);
    setAudioUri(null);
    stopPlaying(); // Stop any ongoing playback

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    try {
      const path = await audioUtils.startRecording();
      if (path) {
        setAudioUri(path);
      }
    } catch (error) {
      console.error('Ошибка начала записи:', error);
      Alert.alert('Ошибка', 'Не удалось начать запись');
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [hasPermission, stopPlaying]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      const result = await audioUtils.stopRecording();
      if (result) {
        setAudioUri(result);
      }
    } catch (error) {
      console.error('Ошибка остановки записи:', error);
      Alert.alert('Ошибка', 'Не удалось остановить запись');
    }
  }, []);

  const cancelRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingTime(0);
    setAudioUri(null);
    stopPlaying();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    audioUtils.stopAudio(); // Ensure any playing audio is stopped
  }, [stopPlaying]);

  return {
    isRecording,
    recordingTime,
    audioUri,
    isPlaying,
    hasPermission,
    startRecording,
    stopRecording,
    playRecording,
    cancelRecording,
    requestAudioPermission,
  };
};