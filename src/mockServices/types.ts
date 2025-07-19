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
  UNAUTHORIZED_EXIT = 'UNAUTHORIZED_EXIT',
  UNASSIGNED_TAG = 'UNASSIGNED_TAG',
  UNAUTHORIZED_ZONE = 'UNAUTHORIZED_ZONE',
  MISSING_SCAN = 'MISSING_SCAN'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
} 