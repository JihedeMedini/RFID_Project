// Common types for the RFID warehouse management system

export interface Item {
  id: string;
  name: string;
  sku: string;
  description?: string;
}

export interface TagAssignment {
  tagId: string;
  itemId: string;
  assignedAt: string;
  assignedBy?: string;
  homeZone: Zone;
}

export interface MovementLog {
  id: string;
  tagId: string;
  zone: Zone;
  movementType: MovementType;
  timestamp: string;
  verified: boolean;
}

export interface Alert {
  id: string;
  tagId: string;
  type: AlertType;
  severity: AlertSeverity;
  timestamp: string;
  resolved: boolean;
  message?: string;
  status: AlertStatus;
  comment?: string;
}

export enum Zone {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  WAREHOUSE = 'WAREHOUSE',
  SHIPPING = 'SHIPPING',
  RECEIVING = 'RECEIVING',
  QUALITY_CHECK = 'QUALITY_CHECK'
}

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER'
}

export enum AlertType {
  UNAUTHORIZED_MOVEMENT = 'UNAUTHORIZED_MOVEMENT',
  WRONG_ZONE = 'WRONG_ZONE',
  QUANTITY_MISMATCH = 'QUANTITY_MISMATCH'
}
 
export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}
 
export enum AlertStatus {
  NEW = 'NEW',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  COMMENTED = "COMMENTED"
}