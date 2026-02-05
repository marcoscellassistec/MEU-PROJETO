import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  // Save to backend
  try {
    await api.put('/auth/profile', { pushToken: token });
  } catch (err) {
    console.error('Failed to save push token:', err);
  }

  return token;
}

export async function scheduleBillReminder(billId: string, billName: string, amount: number, dueDate: Date) {
  const trigger = new Date(dueDate);
  trigger.setDate(trigger.getDate() - 1); // 1 day before
  trigger.setHours(9, 0, 0, 0);

  if (trigger > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Conta a vencer amanha!',
        body: `${billName} - R$ ${amount.toFixed(2)}`,
        data: { type: 'bill_reminder', billId },
      },
      trigger,
    });
  }
}
