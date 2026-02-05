import Expo, { ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  pushToken: string,
  notification: NotificationData
): Promise<boolean> {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.warn(`Invalid push token: ${pushToken}`);
    return false;
  }

  const message: ExpoPushMessage = {
    to: pushToken,
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data,
    priority: 'high',
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of ticketChunk) {
        if (ticket.status === 'error') {
          console.error('Push notification error:', ticket.message);
        }
      }
    }
    return true;
  } catch (err) {
    console.error('Send push notification error:', err);
    return false;
  }
}

export async function sendBulkNotifications(
  tokens: string[],
  notification: NotificationData
): Promise<void> {
  const messages: ExpoPushMessage[] = tokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: 'default' as const,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      priority: 'high' as const,
    }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error('Bulk notification error:', err);
    }
  }
}
