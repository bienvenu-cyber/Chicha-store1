import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

class PushNotificationService {
  private messaging: any;

  constructor() {
    try {
      const app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(app);
    } catch (error) {
      console.error('Firebase initialization error', error);
    }
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });

        if (token) {
          // Envoyer le token au backend pour stocker
          await this.sendTokenToBackend(token);
        }
      }
    } catch (error) {
      console.error('Permission error', error);
    }
  }

  private async sendTokenToBackend(token: string) {
    try {
      await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Token registration error', error);
    }
  }

  listenToNotifications() {
    onMessage(this.messaging, (payload) => {
      // Gérer les notifications reçues
      new Notification(payload.notification?.title || 'Notification', {
        body: payload.notification?.body,
        icon: payload.notification?.icon
      });
    });
  }

  async subscribeToTopics(topics: string[]) {
    try {
      const token = await getToken(this.messaging);
      
      for (const topic of topics) {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          body: JSON.stringify({ token, topic })
        });
      }
    } catch (error) {
      console.error('Topic subscription error', error);
    }
  }
}

export default new PushNotificationService();
