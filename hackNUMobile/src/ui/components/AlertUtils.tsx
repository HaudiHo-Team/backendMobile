import { Alert } from 'react-native';

export const showAlert = (
  title: string,
  message: string,
  onPress?: () => void,
) => {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: onPress,
    },
  ]);
};

export const showConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  Alert.alert(title, message, [
    {
      text: 'Отмена',
      onPress: onCancel,
      style: 'cancel',
    },
    {
      text: 'Подтвердить',
      onPress: onConfirm,
      style: 'destructive',
    },
  ]);
};
