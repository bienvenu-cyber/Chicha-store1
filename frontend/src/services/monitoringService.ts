import axios from 'axios';

export interface DeviceInfo {
  browser: string;
  os: string;
  screenResolution: string;
  language: string;
  timezone: string;
}

export interface LoginAttempt {
  timestamp: number;
  success: boolean;
  ipAddress?: string;
  location?: string;
}

class MonitoringService {
  private API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/monitoring';

  async captureDeviceInfo(): Promise<DeviceInfo> {
    return {
      browser: this.detectBrowser(),
      os: this.detectOS(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  async logLoginAttempt(attempt: LoginAttempt): Promise<void> {
    try {
      await axios.post(`${this.API_URL}/login-attempts`, {
        ...attempt,
        deviceInfo: await this.captureDeviceInfo()
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la tentative de connexion', error);
    }
  }

  async reportPerformance(metrics: {
    pageLoad: number;
    apiCalls: { url: string; duration: number }[];
  }): Promise<void> {
    try {
      await axios.post(`${this.API_URL}/performance`, metrics);
    } catch (error) {
      console.error('Erreur lors du rapport de performance', error);
    }
  }

  private detectBrowser(): string {
    const agent = window.navigator.userAgent.toLowerCase();
    switch (true) {
      case agent.includes('edge'): return 'Microsoft Edge';
      case agent.includes('opr'): return 'Opera';
      case agent.includes('chrome'): return 'Google Chrome';
      case agent.includes('trident'): return 'Internet Explorer';
      case agent.includes('firefox'): return 'Mozilla Firefox';
      case agent.includes('safari'): return 'Safari';
      default: return 'Unknown';
    }
  }

  private detectOS(): string {
    const platform = window.navigator.platform.toLowerCase();
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (platform.includes('win')) return 'Windows';
    if (platform.includes('mac')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';

    return 'Unknown';
  }

  async trackUserActivity(activity: {
    type: 'page_view' | 'interaction' | 'error';
    details: any;
  }): Promise<void> {
    try {
      await axios.post(`${this.API_URL}/user-activity`, {
        ...activity,
        timestamp: Date.now(),
        deviceInfo: await this.captureDeviceInfo()
      });
    } catch (error) {
      console.error('Erreur lors du suivi de l\'activité utilisateur', error);
    }
  }

  setupPerformanceMonitoring() {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.reportPerformance({
              pageLoad: entry.duration,
              apiCalls: []  // Vous pouvez étendre cette logique
            });
          }
        }
      });

      observer.observe({ entryType: 'measure' });
    }
  }
}

export const monitoringService = new MonitoringService();
