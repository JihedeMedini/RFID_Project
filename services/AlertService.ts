import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, AlertType, AlertSeverity } from './types';
import { generateId } from './mockData';

const STORAGE_KEY = 'rfid_alerts';

class AlertService {
  /**
   * Create a new alert
   */
  async createAlert(type: AlertType, message: string, severity: AlertSeverity, tagId?: string, zoneId?: string): Promise<Alert> {
    const alert: Alert = {
      id: generateId(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      resolved: false,
      tagId,
      zoneId
    };
    
    const alerts = await this.getAllAlerts();
    alerts.push(alert);
    
    await this.saveAlerts(alerts);
    return alert;
  }
  
  /**
   * Dismiss an alert by ID
   */
  async dismissAlert(alertId: string): Promise<boolean> {
    const alerts = await this.getAllAlerts();
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) return false;
    
    alerts[alertIndex].resolved = true;
    alerts[alertIndex].resolvedAt = new Date().toISOString();
    
    await this.saveAlerts(alerts);
    return true;
  }
  
  /**
   * Dismiss all alerts
   */
  async dismissAllAlerts(): Promise<void> {
    const alerts = await this.getAllAlerts();
    const updatedAlerts = alerts.map(alert => ({
      ...alert,
      resolved: true,
      resolvedAt: new Date().toISOString()
    }));
    
    await this.saveAlerts(updatedAlerts);
  }
  
  /**
   * Get all alerts
   */
  async getAllAlerts(): Promise<Alert[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving alerts', error);
      return [];
    }
  }
  
  /**
   * Get active (unresolved) alerts
   */
  async getActiveAlerts(): Promise<Alert[]> {
    const alerts = await this.getAllAlerts();
    return alerts.filter(alert => !alert.resolved);
  }
  
  /**
   * Save alerts to storage
   */
  private async saveAlerts(alerts: Alert[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving alerts', error);
    }
  }
}

export default new AlertService(); 