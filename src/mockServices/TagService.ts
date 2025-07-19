import { Item, TagAssignment } from './types';
import { generateId } from './mockData';

const LOCAL_STORAGE_KEY = 'rfid_tag_assignments';

class TagService {
  /**
   * Assign an RFID tag to an item
   */
  assignTag(tagId: string, itemId: string): TagAssignment {
    const assignment: TagAssignment = {
      tagId,
      itemId,
      assignedAt: new Date().toISOString()
    };
    
    const assignments = this.getAllAssignments();
    assignments.push(assignment);
    
    this.saveAssignments(assignments);
    return assignment;
  }
  
  /**
   * Get all tag assignments
   */
  getAllAssignments(): TagAssignment[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving tag assignments', error);
      return [];
    }
  }
  
  /**
   * Find an item by tag ID
   */
  getItemByTagId(tagId: string, items: Item[]): Item | undefined {
    const assignment = this.getAssignmentByTagId(tagId);
    if (!assignment) return undefined;
    
    return items.find(item => item.id === assignment.itemId);
  }
  
  /**
   * Find a tag assignment by tag ID
   */
  getAssignmentByTagId(tagId: string): TagAssignment | undefined {
    const assignments = this.getAllAssignments();
    return assignments.find(a => a.tagId === tagId);
  }
  
  /**
   * Check if a tag is already assigned
   */
  isTagAssigned(tagId: string): boolean {
    return this.getAssignmentByTagId(tagId) !== undefined;
  }
  
  /**
   * Remove a tag assignment
   */
  removeAssignment(tagId: string): boolean {
    const assignments = this.getAllAssignments();
    const initialLength = assignments.length;
    
    const filteredAssignments = assignments.filter(a => a.tagId !== tagId);
    this.saveAssignments(filteredAssignments);
    
    return filteredAssignments.length !== initialLength;
  }
  
  /**
   * Save assignments to localStorage
   */
  private saveAssignments(assignments: TagAssignment[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.error('Error saving tag assignments', error);
    }
  }
}

// Create singleton instance
const tagService = new TagService();
export default tagService; 