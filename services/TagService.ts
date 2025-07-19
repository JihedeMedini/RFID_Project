import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item, TagAssignment } from './types';
import { generateId } from './mockData';

const STORAGE_KEY = 'rfid_tag_assignments';

class TagService {
  /**
   * Assign an RFID tag to an item
   */
  async assignTag(tagId: string, itemId: string): Promise<TagAssignment> {
    const assignment: TagAssignment = {
      tagId,
      itemId,
      assignedAt: new Date().toISOString()
    };
    
    const assignments = await this.getAllAssignments();
    assignments.push(assignment);
    
    await this.saveAssignments(assignments);
    return assignment;
  }
  
  /**
   * Get all tag assignments
   */
  async getAllAssignments(): Promise<TagAssignment[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving tag assignments', error);
      return [];
    }
  }
  
  /**
   * Find an item by tag ID
   */
  async getItemByTagId(tagId: string, items: Item[]): Promise<Item | undefined> {
    const assignment = await this.getAssignmentByTagId(tagId);
    if (!assignment) return undefined;
    
    return items.find(item => item.id === assignment.itemId);
  }
  
  /**
   * Find a tag assignment by tag ID
   */
  async getAssignmentByTagId(tagId: string): Promise<TagAssignment | undefined> {
    const assignments = await this.getAllAssignments();
    return assignments.find(a => a.tagId === tagId);
  }
  
  /**
   * Check if a tag is already assigned
   */
  async isTagAssigned(tagId: string): Promise<boolean> {
    const assignment = await this.getAssignmentByTagId(tagId);
    return assignment !== undefined;
  }
  
  /**
   * Remove a tag assignment
   */
  async removeAssignment(tagId: string): Promise<boolean> {
    const assignments = await this.getAllAssignments();
    const initialLength = assignments.length;
    
    const filteredAssignments = assignments.filter(a => a.tagId !== tagId);
    await this.saveAssignments(filteredAssignments);
    
    return filteredAssignments.length !== initialLength;
  }
  
  /**
   * Save assignments to AsyncStorage
   */
  private async saveAssignments(assignments: TagAssignment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.error('Error saving tag assignments', error);
    }
  }
}

// Create singleton instance
const tagService = new TagService();
export default tagService; 