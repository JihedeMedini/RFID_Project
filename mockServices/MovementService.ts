import { MovementLog, MovementType, Zone } from './types';
import { generateId } from './mockData';
import TagService from './TagService';

const LOCAL_STORAGE_KEY = 'rfid_movement_logs';

class MovementService {
  /**
   * Log a movement for an RFID tag
   */
  logMovement(tagId: string, zone: Zone, movementType: MovementType): MovementLog {
    const log: MovementLog = {
      id: generateId(),
      tagId,
      zone,
      movementType,
      timestamp: new Date().toISOString(),
      // Randomly verify movement (simulating real-world verification process)
      verified: Math.random() > 0.2
    };
    
    const logs = this.getAllMovements();
    logs.push(log);
    
    this.saveMovements(logs);
    return log;
  }
  
  /**
   * Get all movement logs
   */
  getAllMovements(): MovementLog[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving movement logs', error);
      return [];
    }
  }
  
  /**
   * Get movement logs by tag ID
   */
  getMovementsByTagId(tagId: string): MovementLog[] {
    const movements = this.getAllMovements();
    return movements.filter(log => log.tagId === tagId);
  }
  
  /**
   * Get movement logs by zone
   */
  getMovementsByZone(zone: Zone): MovementLog[] {
    const movements = this.getAllMovements();
    return movements.filter(log => log.zone === zone);
  }
  
  /**
   * Get movement logs by movement type
   */
  getMovementsByType(type: MovementType): MovementLog[] {
    const movements = this.getAllMovements();
    return movements.filter(log => log.movementType === type);
  }
  
  /**
   * Get movement logs within a time range
   */
  getMovementsByTimeRange(startDate: Date, endDate: Date): MovementLog[] {
    const movements = this.getAllMovements();
    return movements.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }
  
  /**
   * Save movements to localStorage
   */
  private saveMovements(movements: MovementLog[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(movements));
    } catch (error) {
      console.error('Error saving movement logs', error);
    }
  }
}

// Create singleton instance
const movementService = new MovementService();
export default movementService; 