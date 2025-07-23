import { Alert, AlertType, AlertSeverity, AlertStatus } from './types';
import { generateId } from './mockData';

const LOCAL_STORAGE_KEY = 'rfid_alerts';

class AlertService {
  /**
   * Trigger a new alert
   */
  triggerAlert(
    tagId: string, 
    type: AlertType, 
    severity: AlertSeverity = AlertSeverity.MEDIUM,
    message?: string
  ): Alert {
    const alert: Alert = {
      id: generateId(),
      tagId,
      type,
      severity,
      timestamp: new Date().toISOString(),
      resolved: false,
      message,
      comment: '',
      status: AlertStatus.NEW
    };
    
    const alerts = this.getAllAlerts();
    alerts.push(alert);
    
    this.saveAlerts(alerts);
    return alert;
  }
  
  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): Alert | undefined {
    const alerts = this.getAllAlerts();
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) return undefined;
    
    alerts[alertIndex].status = AlertStatus.ACKNOWLEDGED;
    this.saveAlerts(alerts);
    
    return alerts[alertIndex];
  }
  
  /**
   * Add a comment to an alert
   */
  commentAlert(alertId: string, comment: string): Alert | undefined {
    const alerts = this.getAllAlerts();
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) return undefined;
    
    alerts[alertIndex].comment = comment;
    alerts[alertIndex].status = AlertStatus.COMMENTED;
    this.saveAlerts(alerts);
    
    return alerts[alertIndex];
  }
  
  /**
   * Mark an alert as resolved
   */
  resolveAlert(alertId: string): Alert | undefined {
    const alerts = this.getAllAlerts();
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) return undefined;
    
    alerts[alertIndex].resolved = true;
    alerts[alertIndex].status = AlertStatus.RESOLVED;
    this.saveAlerts(alerts);
    
    return alerts[alertIndex];
  }
  
  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving alerts', error);
      return [];
    }
  }
  
  /**
   * Get active (unresolved) alerts
   */
  getActiveAlerts(): Alert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => !alert.resolved);
  }
  
  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.severity === severity);
  }
  
  /**
   * Get alerts by type
   */
  getAlertsByType(type: AlertType): Alert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.type === type);
  }
  
  /**
   * Get alerts by tag ID
   */
  getAlertsByTagId(tagId: string): Alert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.tagId === tagId);
  }
  
  /**
   * Get alerts by status
   */
  getAlertsByStatus(status: AlertStatus): Alert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.status === status);
  }
  
  /**
   * Check for unauthorized movement
   */
  checkUnauthorizedMovement(tagId: string): boolean {
    // Implementation would depend on business rules
    // This is a placeholder
    const shouldTriggerAlert = Math.random() > 0.7;
    
    if (shouldTriggerAlert) {
      this.triggerAlert(
        tagId,
        AlertType.UNAUTHORIZED_MOVEMENT,
        AlertSeverity.HIGH,
        'Unauthorized movement detected'
      );
      return true;
    }
    return false;
  }
  
  /**
   * Save alerts to localStorage
   */
  private saveAlerts(alerts: Alert[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving alerts', error);
    }
  }
  
  /**
   * Dismiss all alerts (legacy method - kept for backwards compatibility)
   */
  dismissAllAlerts(): void {
    const alerts = this.getAllAlerts();
    alerts.forEach(alert => {
      alert.resolved = true;
      alert.status = AlertStatus.RESOLVED;
    });
    this.saveAlerts(alerts);
  }
  
  /**
   * Dismiss an alert (legacy method - kept for backwards compatibility)
   */
  dismissAlert(alertId: string): Alert | undefined {
    return this.resolveAlert(alertId);
  }
}

// Create singleton instance
const alertService = new AlertService();
export default alertService; 