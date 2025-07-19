import { Alert, AlertType, AlertSeverity } from './types';
import { generateId } from './mockData';
import TagService from './TagService';

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
      message
    };
    
    const alerts = this.getAllAlerts();
    alerts.push(alert);
    
    this.saveAlerts(alerts);
    return alert;
  }
  
  /**
   * Mark an alert as resolved
   */
  resolveAlert(alertId: string): Alert | undefined {
    const alerts = this.getAllAlerts();
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) return undefined;
    
    alerts[alertIndex].resolved = true;
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
   * Check if an unassigned tag is being moved and trigger alert if needed
   */
  checkUnassignedTagMovement(tagId: string): boolean {
    if (!TagService.isTagAssigned(tagId)) {
      this.triggerAlert(
        tagId,
        AlertType.UNASSIGNED_TAG,
        AlertSeverity.HIGH,
        'Unassigned tag detected in movement'
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
}

// Create singleton instance
const alertService = new AlertService();
export default alertService; 