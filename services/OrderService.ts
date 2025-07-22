import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item } from './types';
import { MOCK_ITEMS } from './mockData';

// Order types
export enum OrderType {
  SHIPPING = 'SHIPPING',
  TRANSFER = 'TRANSFER',
  RETURN = 'RETURN',
  INCOMING = 'INCOMING'
}

// Order status
export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Order verification status
export enum VerificationStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED'
}

// Order line item interface
export interface OrderLine {
  id: string;
  itemId: string;
  sku: string;
  name: string;
  oracleId?: string;
  quantity: number;
  verifiedQuantity: number;
  scannedTags: string[];
}

// Order interface
export interface Order {
  id: string;
  oracleOrderId: string;
  type: OrderType;
  status: OrderStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  destination?: string;
  source?: string;
  requestedBy?: string;
  approvedBy?: string;
  lines: OrderLine[];
}

// Item verification result
export interface VerificationResult {
  tagId: string;
  itemId: string;
  isValid: boolean;
  message: string;
  status: 'valid' | 'invalid' | 'warning' | 'duplicate';
  orderLine?: OrderLine;
}

// Storage keys
const STORAGE_ORDERS = 'rfid_oracle_orders';
const STORAGE_VERIFIED_ORDERS = 'rfid_verified_orders';

// Mock Oracle orders
const MOCK_ORDERS: Order[] = [
  {
    id: 'order-001',
    oracleOrderId: 'ORC-SHP-10045',
    type: OrderType.SHIPPING,
    status: OrderStatus.APPROVED,
    verificationStatus: VerificationStatus.NOT_STARTED,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    destination: 'Amazon Fulfillment Center',
    requestedBy: 'Jane Smith',
    approvedBy: 'John Manager',
    lines: [
      {
        id: 'line-001-1',
        itemId: '1', // iPhone 15
        sku: 'IPH15-128',
        name: 'iPhone 15',
        oracleId: 'ORC-10045782',
        quantity: 5,
        verifiedQuantity: 0,
        scannedTags: []
      },
      {
        id: 'line-001-2',
        itemId: '5', // AirPods Pro
        sku: 'APP-2',
        name: 'AirPods Pro',
        oracleId: 'ORC-10029873',
        quantity: 10,
        verifiedQuantity: 0,
        scannedTags: []
      }
    ]
  },
  {
    id: 'order-002',
    oracleOrderId: 'ORC-TRF-22876',
    type: OrderType.TRANSFER,
    status: OrderStatus.PENDING,
    verificationStatus: VerificationStatus.NOT_STARTED,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    destination: 'Store #137',
    source: 'Main Warehouse',
    requestedBy: 'Store Manager',
    lines: [
      {
        id: 'line-002-1',
        itemId: '3', // MacBook Pro
        sku: 'MBP14-1TB',
        name: 'MacBook Pro 14"',
        oracleId: 'ORC-10038921',
        quantity: 3,
        verifiedQuantity: 0,
        scannedTags: []
      },
      {
        id: 'line-002-2',
        itemId: '6', // Apple Watch
        sku: 'AWS9-GPS',
        name: 'Apple Watch Series 9',
        oracleId: 'ORC-10047821',
        quantity: 8,
        verifiedQuantity: 0,
        scannedTags: []
      },
      {
        id: 'line-002-3',
        itemId: '4', // iPad Air
        sku: 'IPAD-AIR-256',
        name: 'iPad Air',
        oracleId: 'ORC-10032456',
        quantity: 5,
        verifiedQuantity: 0,
        scannedTags: []
      }
    ]
  },
  {
    id: 'order-003',
    oracleOrderId: 'ORC-RET-77341',
    type: OrderType.RETURN,
    status: OrderStatus.APPROVED,
    verificationStatus: VerificationStatus.NOT_STARTED,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    source: 'Customer Returns',
    requestedBy: 'Returns Department',
    approvedBy: 'Sarah Supervisor',
    lines: [
      {
        id: 'line-003-1',
        itemId: '2', // iPhone 15 Pro
        sku: 'IPH15P-256',
        name: 'iPhone 15 Pro',
        oracleId: 'ORC-10045793',
        quantity: 2,
        verifiedQuantity: 0,
        scannedTags: []
      }
    ]
  }
];

class OrderService {
  /**
   * Initialize the service with mock data
   */
  async initMockData(): Promise<void> {
    try {
      // Check if mock data already exists
      const existingOrders = await AsyncStorage.getItem(STORAGE_ORDERS);
      if (!existingOrders) {
        await AsyncStorage.setItem(STORAGE_ORDERS, JSON.stringify(MOCK_ORDERS));
      }
    } catch (error) {
      console.error('Error initializing mock order data:', error);
    }
  }
  
  /**
   * Get all orders
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_ORDERS);
      return data ? JSON.parse(data) : MOCK_ORDERS;
    } catch (error) {
      console.error('Error retrieving orders:', error);
      return MOCK_ORDERS;
    }
  }
  
  /**
   * Get an order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orders = await this.getAllOrders();
      const order = orders.find(o => o.id === orderId);
      return order || null;
    } catch (error) {
      console.error('Error retrieving order by ID:', error);
      return null;
    }
  }
  
  /**
   * Get an order by Oracle Order ID
   */
  async getOrderByOracleId(oracleOrderId: string): Promise<Order | null> {
    try {
      const orders = await this.getAllOrders();
      const order = orders.find(o => o.oracleOrderId === oracleOrderId);
      return order || null;
    } catch (error) {
      console.error('Error retrieving order by Oracle ID:', error);
      return null;
    }
  }
  
  /**
   * Verify a tag against an order
   */
  async verifyTag(orderId: string, tagId: string, tagService: any): Promise<VerificationResult> {
    try {
      // Get the order
      const order = await this.getOrderById(orderId);
      if (!order) {
        return {
          tagId,
          itemId: '',
          isValid: false,
          message: 'Order not found',
          status: 'invalid'
        };
      }
      
      // Find the item linked to this tag
      const item = await this.getItemForTag(tagId, tagService);
      if (!item) {
        return {
          tagId,
          itemId: '',
          isValid: false,
          message: 'Tag is not assigned to any item',
          status: 'invalid'
        };
      }
      
      // Find the order line for this item
      const orderLine = order.lines.find(line => line.itemId === item.id);
      if (!orderLine) {
        return {
          tagId,
          itemId: item.id,
          isValid: false,
          message: `Item ${item.name} (${item.sku}) is not on this order`,
          status: 'invalid',
        };
      }
      
      // Check if tag already scanned
      if (orderLine.scannedTags.includes(tagId)) {
        return {
          tagId,
          itemId: item.id,
          isValid: false,
          message: `Item ${item.name} (${item.sku}) already scanned`,
          status: 'duplicate',
          orderLine
        };
      }
      
      // Check quantity
      if (orderLine.verifiedQuantity >= orderLine.quantity) {
        return {
          tagId,
          itemId: item.id,
          isValid: false,
          message: `Exceeded quantity for ${item.name} (${item.sku})`,
          status: 'warning',
          orderLine
        };
      }
      
      // Tag is valid - update the order
      const updatedOrders = await this.updateOrderWithTag(order, orderLine, tagId);
      
      return {
        tagId,
        itemId: item.id,
        isValid: true,
        message: `Valid item: ${item.name} (${item.sku})`,
        status: 'valid',
        orderLine: updatedOrders.find(o => o.id === order.id)?.lines.find(l => l.id === orderLine.id)
      };
      
    } catch (error) {
      console.error('Error verifying tag:', error);
      return {
        tagId,
        itemId: '',
        isValid: false,
        message: 'Error verifying tag',
        status: 'invalid'
      };
    }
  }
  
  /**
   * Update order with a scanned tag
   */
  private async updateOrderWithTag(order: Order, orderLine: OrderLine, tagId: string): Promise<Order[]> {
    try {
      // Get all orders
      const orders = await this.getAllOrders();
      
      // Update the specific order
      const updatedOrders = orders.map(o => {
        if (o.id === order.id) {
          // Update verification status if this is the first scan
          let updatedStatus = o.verificationStatus;
          if (updatedStatus === VerificationStatus.NOT_STARTED) {
            updatedStatus = VerificationStatus.IN_PROGRESS;
          }
          
          // Update the order lines
          const updatedLines = o.lines.map(line => {
            if (line.id === orderLine.id) {
              // Add tag to scanned tags and increment verified quantity
              return {
                ...line,
                verifiedQuantity: line.verifiedQuantity + 1,
                scannedTags: [...line.scannedTags, tagId]
              };
            }
            return line;
          });
          
          // Check if all items are now verified
          const allVerified = updatedLines.every(line => line.verifiedQuantity >= line.quantity);
          if (allVerified && updatedStatus === VerificationStatus.IN_PROGRESS) {
            updatedStatus = VerificationStatus.COMPLETE;
          }
          
          return {
            ...o,
            verificationStatus: updatedStatus,
            lines: updatedLines,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      });
      
      // Save updated orders
      await AsyncStorage.setItem(STORAGE_ORDERS, JSON.stringify(updatedOrders));
      
      return updatedOrders;
    } catch (error) {
      console.error('Error updating order with tag:', error);
      return [];
    }
  }
  
  /**
   * Get item for a tag
   */
  private async getItemForTag(tagId: string, tagService: any): Promise<Item | undefined> {
    try {
      return await tagService.getItemByTagId(tagId, MOCK_ITEMS);
    } catch (error) {
      console.error('Error getting item for tag:', error);
      return undefined;
    }
  }
  
  /**
   * Submit an order verification
   */
  async submitVerification(orderId: string): Promise<boolean> {
    try {
      // Get the order
      const orders = await this.getAllOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);
      
      if (orderIndex === -1) {
        return false;
      }
      
      const order = orders[orderIndex];
      
      // Check if all items are verified
      const allLinesComplete = order.lines.every(line => line.verifiedQuantity >= line.quantity);
      
      // Update order status
      const updatedOrder: Order = {
        ...order,
        verificationStatus: allLinesComplete ? VerificationStatus.COMPLETE : VerificationStatus.FAILED,
        updatedAt: new Date().toISOString()
      };
      
      // Update orders array
      orders[orderIndex] = updatedOrder;
      
      // Save updated orders
      await AsyncStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
      
      // Add to verified orders
      const verifiedOrdersData = await AsyncStorage.getItem(STORAGE_VERIFIED_ORDERS);
      const verifiedOrders: Order[] = verifiedOrdersData ? JSON.parse(verifiedOrdersData) : [];
      verifiedOrders.push(updatedOrder);
      await AsyncStorage.setItem(STORAGE_VERIFIED_ORDERS, JSON.stringify(verifiedOrders));
      
      return true;
    } catch (error) {
      console.error('Error submitting verification:', error);
      return false;
    }
  }
  
  /**
   * Reset an order verification
   */
  async resetVerification(orderId: string): Promise<boolean> {
    try {
      // Get all orders
      const orders = await this.getAllOrders();
      
      // Update the specific order
      const updatedOrders = orders.map(o => {
        if (o.id === orderId) {
          // Reset all lines
          const resetLines = o.lines.map(line => ({
            ...line,
            verifiedQuantity: 0,
            scannedTags: []
          }));
          
          return {
            ...o,
            verificationStatus: VerificationStatus.NOT_STARTED,
            lines: resetLines,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      });
      
      // Save updated orders
      await AsyncStorage.setItem(STORAGE_ORDERS, JSON.stringify(updatedOrders));
      
      return true;
    } catch (error) {
      console.error('Error resetting verification:', error);
      return false;
    }
  }
  
  /**
   * Get verification status summary for an order
   */
  async getVerificationSummary(orderId: string): Promise<{
    totalItems: number;
    verifiedItems: number;
    progress: number;
    isComplete: boolean;
  }> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        return { totalItems: 0, verifiedItems: 0, progress: 0, isComplete: false };
      }
      
      // Calculate totals
      const totalItems = order.lines.reduce((sum, line) => sum + line.quantity, 0);
      const verifiedItems = order.lines.reduce((sum, line) => sum + line.verifiedQuantity, 0);
      
      // Calculate progress
      const progress = totalItems > 0 ? (verifiedItems / totalItems) : 0;
      
      // Check if verification is complete
      const isComplete = order.verificationStatus === VerificationStatus.COMPLETE;
      
      return {
        totalItems,
        verifiedItems,
        progress,
        isComplete
      };
    } catch (error) {
      console.error('Error getting verification summary:', error);
      return { totalItems: 0, verifiedItems: 0, progress: 0, isComplete: false };
    }
  }
}

// Create singleton instance
const orderService = new OrderService();

// Initialize mock data
orderService.initMockData();

export default orderService; 