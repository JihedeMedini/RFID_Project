import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './mockData';

// User roles for the RFID system
export enum UserRole {
  WAREHOUSE_WORKER = 'Warehouse Worker',
  TAGGING_STAFF = 'Tagging Staff',
  EXIT_GATE_AGENT = 'Exit Gate Agent',
  SUPERVISOR = 'Supervisor'
}

// User status
export enum UserStatus {
  ACTIVE = 'active',
  OFFLINE = 'offline',
  AWAY = 'away'
}

// User interface
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string;
  lastActive: string;
  permissions: string[];
}

// Storage key
const STORAGE_KEY = 'rfid_current_user';
const MOCK_USERS_KEY = 'rfid_mock_users';

// Mock users data
const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    username: 'jsmith',
    fullName: 'John Smith',
    role: UserRole.WAREHOUSE_WORKER,
    status: UserStatus.ACTIVE,
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastActive: new Date().toISOString(),
    permissions: ['scan_tags', 'view_inventory', 'record_movements']
  },
  {
    id: 'usr-002',
    username: 'mwilson',
    fullName: 'Maria Wilson',
    role: UserRole.TAGGING_STAFF,
    status: UserStatus.ACTIVE,
    profileImage: 'https://randomuser.me/api/portraits/women/25.jpg',
    lastActive: new Date().toISOString(),
    permissions: ['assign_tags', 'print_tags', 'view_inventory']
  },
  {
    id: 'usr-003',
    username: 'pjohnson',
    fullName: 'Paul Johnson',
    role: UserRole.EXIT_GATE_AGENT,
    status: UserStatus.ACTIVE,
    profileImage: 'https://randomuser.me/api/portraits/men/41.jpg',
    lastActive: new Date().toISOString(),
    permissions: ['verify_movements', 'view_inventory', 'scan_tags']
  },
  {
    id: 'usr-004',
    username: 'agarcia',
    fullName: 'Anna Garcia',
    role: UserRole.SUPERVISOR,
    status: UserStatus.ACTIVE,
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    lastActive: new Date().toISOString(),
    permissions: ['assign_tags', 'print_tags', 'view_inventory', 'verify_movements', 'manage_users']
  }
];

class UserService {
  /**
   * Initialize with mock data
   */
  async initMockData(): Promise<void> {
    try {
      // Check if mock data already exists
      const existingData = await AsyncStorage.getItem(MOCK_USERS_KEY);
      if (!existingData) {
        await AsyncStorage.setItem(MOCK_USERS_KEY, JSON.stringify(MOCK_USERS));
      }
      
      // Set a default current user (first mock user)
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        await this.setCurrentUser(MOCK_USERS[0]);
      }
    } catch (error) {
      console.error('Error initializing mock user data:', error);
    }
  }
  
  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const data = await AsyncStorage.getItem(MOCK_USERS_KEY);
      return data ? JSON.parse(data) : MOCK_USERS;
    } catch (error) {
      console.error('Error retrieving users:', error);
      return MOCK_USERS;
    }
  }
  
  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving current user:', error);
      return null;
    }
  }
  
  /**
   * Set current user
   */
  async setCurrentUser(user: User): Promise<void> {
    try {
      // Update last active timestamp
      user.lastActive = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }
  
  /**
   * Switch to another user
   */
  async switchUser(userId: string): Promise<User | null> {
    try {
      const users = await this.getAllUsers();
      const user = users.find(u => u.id === userId);
      
      if (user) {
        await this.setCurrentUser(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error switching user:', error);
      return null;
    }
  }
  
  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, status };
        }
        return user;
      });
      
      await AsyncStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedUsers));
      
      // If this is the current user, update that too
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        await this.setCurrentUser({ ...currentUser, status });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }
  
  /**
   * Check if user has a specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) return false;
      
      return currentUser.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }
}

// Create singleton instance
const userService = new UserService();

// Initialize mock data
userService.initMockData();

export default userService; 