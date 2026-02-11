'use client'

export async function requestNotificationPermission(): Promise<NotificationPermission | 'denied'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch (e) {
    console.error('Notification permission error', e);
    return 'denied';
  }
}

export function notifyUser(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  try {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  } catch (e) {
    console.error('Failed to show notification', e);
  }
}
