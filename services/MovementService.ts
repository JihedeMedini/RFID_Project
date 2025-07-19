import AsyncStorage from '@react-native-async-storage/async-storage';
import { MovementLog, MovementType, Zone } from './types';
import { generateId } from './mockData';

const STORAGE_KEY = 'rfid_movement_logs';
const OFFLINE_QUEUE_KEY = 'rfid_movement_offline_queue';

class MovementService {
  /**
   * Log a movement for an RFID tag
   */
  async logMovement(tagId: string, zone: Zone, movementType: MovementType, offline = false): Promise<MovementLog> {
    const log: MovementLog = {
      id: generateId(),
      tagId,
      zone,
      movementType,
      timestamp: new Date().toISOString(),
      // Randomly verify movement (simulating real-world verification process)
      verified: Math.random() > 0.2,
      offline,
      synced: !offline
    };
    
    const logs = await this.getAllMovements();
    logs.push(log);
    
    await this.saveMovements(logs);
    
    // If offline, also save to offline queue
    if (offline) {
      await this.addToOfflineQueue(log);
    }
    
    return log;
  }
  
  /**
   * Get all movement logs
   */
  async getAllMovements(): Promise<MovementLog[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving movement logs', error);
      return [];
    }
  }
  
  /**
   * Get movement logs by tag ID
   */
  async getMovementsByTagId(tagId: string): Promise<MovementLog[]> {
    const movements = await this.getAllMovements();
    return movements.filter(log => log.tagId === tagId);
  }
  
  /**
   * Get offline queue movements
   */
  async getOfflineQueue(): Promise<MovementLog[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving offline queue', error);
      return [];
    }
  }
  
  /**
   * Add movement to offline queue
   */
  private async addToOfflineQueue(log: MovementLog): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      queue.push(log);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to offline queue', error);
    }
  }
  
  /**
   * Sync offline movements (simulated)
   * In a real app, this would send data to a server
   */
  async syncOfflineMovements(): Promise<{ success: boolean, syncedCount: number }> {
    try {
      // Get offline queue
      const offlineQueue = await this.getOfflineQueue();
      
      if (offlineQueue.length === 0) {
        return { success: true, syncedCount: 0 };
      }
      
      // Get all movements
      const movements = await this.getAllMovements();
      
      // Mark movements as synced
      const updatedMovements = movements.map(movement => {
        const offlineMovement = offlineQueue.find(m => m.id === movement.id);
        if (offlineMovement) {
          return { ...movement, synced: true };
        }
        return movement;
      });
      
      // Save updated movements
      await this.saveMovements(updatedMovements);
      
      // Clear offline queue
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([]));
      
      return { success: true, syncedCount: offlineQueue.length };
    } catch (error) {
      console.error('Error syncing offline movements', error);
      return { success: false, syncedCount: 0 };
    }
  }
  
  /**
   * Save movements to AsyncStorage
   */
  private async saveMovements(movements: MovementLog[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(movements));
    } catch (error) {
      console.error('Error saving movement logs', error);
    }
  }
}

// Create singleton instance
const movementService = new MovementService();
export default movementService; 