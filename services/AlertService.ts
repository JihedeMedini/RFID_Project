import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, AlertType, AlertSeverity } from './types';
import { generateId } from './mockData';

const STORAGE_KEY = 'rfid_alerts';

// Alert acknowledgement interface
export interface AlertAcknowledgement {
  alertId: string;
  acknowledgedBy: string;
  acknowledgedAt: string;
  notes?: string;
}

// Alert notification settings
export interface AlertNotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifySupervisor: boolean;
  escalateHighSeverity: boolean;
}

class AlertService {
  // Default notification settings
  private notificationSettings: AlertNotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    notifySupervisor: true,
    escalateHighSeverity: true
  };
  
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
    
    // Handle notifications based on severity
    if (this.notificationSettings.escalateHighSeverity && 
        (severity === AlertSeverity.HIGH || severity === AlertSeverity.CRITICAL)) {
      this.sendNotification(alert);
    }
    
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
   * Acknowledge an alert (mark as seen but not necessarily resolved)
   */
  async acknowledgeAlert(alertId: string, userId: string, notes?: string): Promise<boolean> {
    const alerts = await this.getAllAlerts();
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) return false;
    
    const acknowledgement: AlertAcknowledgement = {
      alertId,
      acknowledgedBy: userId,
      acknowledgedAt: new Date().toISOString(),
      notes
    };
    
    alerts[alertIndex].acknowledged = true;
    alerts[alertIndex].acknowledgement = acknowledgement;
    
    await this.saveAlerts(alerts);
    return true;
  }
  
  /**
   * Escalate an alert to a supervisor
   */
  async escalateAlert(alertId: string, userId: string, notes?: string): Promise<boolean> {
    const alerts = await this.getAllAlerts();
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) return false;
    
    // Update severity if not already CRITICAL
    if (alerts[alertIndex].severity !== AlertSeverity.CRITICAL) {
      // Increase severity by one level
      const severityLevels = Object.values(AlertSeverity);
      const currentIndex = severityLevels.indexOf(alerts[alertIndex].severity);
      if (currentIndex < severityLevels.length - 1) {
        alerts[alertIndex].severity = severityLevels[currentIndex + 1];
      }
    }
    
    // Mark as escalated
    alerts[alertIndex].escalated = true;
    alerts[alertIndex].escalatedBy = userId;
    alerts[alertIndex].escalatedAt = new Date().toISOString();
    alerts[alertIndex].escalationNotes = notes;
    
    await this.saveAlerts(alerts);
    
    // Simulate notifying supervisor
    if (this.notificationSettings.notifySupervisor) {
      this.notifySupervisor(alerts[alertIndex]);
    }
    
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
   * Get alert by ID
   */
  async getAlertById(alertId: string): Promise<Alert | null> {
    const alerts = await this.getAllAlerts();
    const alert = alerts.find(a => a.id === alertId);
    return alert || null;
  }
  
  /**
   * Get alerts by severity level
   */
  async getAlertsBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    const alerts = await this.getAllAlerts();
    return alerts.filter(alert => alert.severity === severity);
  }
  
  /**
   * Get alerts by type
   */
  async getAlertsByType(type: AlertType): Promise<Alert[]> {
    const alerts = await this.getAllAlerts();
    return alerts.filter(alert => alert.type === type);
  }
  
  /**
   * Get alerts for a specific tag
   */
  async getAlertsForTag(tagId: string): Promise<Alert[]> {
    const alerts = await this.getAllAlerts();
    return alerts.filter(alert => alert.tagId === tagId);
  }
  
  /**
   * Get alerts for a specific zone
   */
  async getAlertsForZone(zoneId: string): Promise<Alert[]> {
    const alerts = await this.getAllAlerts();
    return alerts.filter(alert => alert.zoneId === zoneId);
  }
  
  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<AlertNotificationSettings>): Promise<AlertNotificationSettings> {
    this.notificationSettings = {
      ...this.notificationSettings,
      ...settings
    };
    
    return this.notificationSettings;
  }
  
  /**
   * Get notification settings
   */
  getNotificationSettings(): AlertNotificationSettings {
    return this.notificationSettings;
  }
  
  /**
   * Get alert severity level description
   */
  getSeverityDescription(severity: AlertSeverity): {
    label: string;
    description: string;
    color: string;
  } {
    switch (severity) {
      case AlertSeverity.LOW:
        return {
          label: 'Low',
          description: 'Information only, no immediate action required',
          color: '#3b82f6' // blue
        };
      case AlertSeverity.MEDIUM:
        return {
          label: 'Medium',
          description: 'Attention required, but not time-sensitive',
          color: '#f59e0b' // amber
        };
      case AlertSeverity.HIGH:
        return {
          label: 'High',
          description: 'Urgent attention required, potential issue',
          color: '#f97316' // orange
        };
      case AlertSeverity.CRITICAL:
        return {
          label: 'Critical',
          description: 'Immediate action required, serious issue',
          color: '#ef4444' // red
        };
      default:
        return {
          label: 'Unknown',
          description: 'Unknown severity level',
          color: '#6b7280' // gray
        };
    }
  }
  
  /**
   * Get alert type description
   */
  getTypeDescription(type: AlertType): {
    label: string;
    description: string;
    icon: string;
  } {
    switch (type) {
      case AlertType.UNAUTHORIZED_EXIT:
        return {
          label: 'Unauthorized Exit',
          description: 'An item has been moved without proper authorization',
          icon: 'https://img.icons8.com/ios-filled/100/ef4444/exit--v1.png'
        };
      case AlertType.UNASSIGNED_TAG:
        return {
          label: 'Unassigned Tag',
          description: 'A tag without proper assignment has been detected',
          icon: 'https://img.icons8.com/ios-filled/100/f97316/help--v1.png'
        };
      case AlertType.UNAUTHORIZED_ZONE:
        return {
          label: 'Unauthorized Zone',
          description: 'An item has been detected in a restricted or incorrect zone',
          icon: 'https://img.icons8.com/ios-filled/100/f59e0b/do-not-enter--v1.png'
        };
      case AlertType.MISSING_SCAN:
        return {
          label: 'Missing Scan',
          description: 'An expected scan event was not recorded',
          icon: 'https://img.icons8.com/ios-filled/100/3b82f6/search--v1.png'
        };
      default:
        return {
          label: 'Unknown',
          description: 'Unknown alert type',
          icon: 'https://img.icons8.com/ios-filled/100/6b7280/info--v1.png'
        };
    }
  }
  
  /**
   * Generate a random alert for testing
   */
  async generateRandomAlert(): Promise<Alert> {
    const alertTypes = Object.values(AlertType);
    const alertSeverities = Object.values(AlertSeverity);
    
    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const randomSeverity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
    
    const messages = [
      'Unexpected tag movement detected',
      'Unassigned tag detected in shipping area',
      'Item moved to unauthorized zone',
      'Missing scan for warehouse entry',
      'Multiple unauthorized movements detected'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.createAlert(
      randomType,
      randomMessage,
      randomSeverity,
      `TAG${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
    );
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
  
  /**
   * Simulate sending a notification
   * In a real app, this would integrate with a notification service
   */
  private sendNotification(alert: Alert): void {
    console.log('Notification sent for alert:', alert.id, alert.message);
    // In a real app, this would send push notifications, emails, etc.
  }
  
  /**
   * Simulate notifying a supervisor
   * In a real app, this would integrate with a notification service
   */
  private notifySupervisor(alert: Alert): void {
    console.log('Supervisor notified for escalated alert:', alert.id, alert.message);
    // In a real app, this would send notifications to supervisors
  }
}

export default new AlertService(); 