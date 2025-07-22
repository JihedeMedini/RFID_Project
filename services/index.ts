// Export all services and types
export * from './types';
export * from './mockData';

// Export services
export { default as TagService } from './TagService';
export { default as MovementService } from './MovementService';
export { default as AlertService } from './AlertService';
export { default as AIService } from './AIService'; 
export { default as UserService } from './UserService';
export { default as PrinterService } from './PrinterService';
export { default as OrderService } from './OrderService';

// Export types from services
export { UserRole, UserStatus, type User } from './UserService';
export { 
  PrinterConnectionType, 
  PrinterStatus, 
  type PrinterDevice,
  type PrintJob,
  type LabelTemplate,
  LABEL_TEMPLATES
} from './PrinterService';
export {
  OrderType,
  OrderStatus,
  VerificationStatus,
  type Order,
  type OrderLine,
  type VerificationResult
} from './OrderService'; 