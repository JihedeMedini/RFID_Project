import { Item, Zone, MovementType, AlertType, AlertSeverity } from './types';

// Pre-defined items for the warehouse
export const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    name: 'iPhone 15',
    sku: 'IPH15-128',
    description: 'iPhone 15 128GB Black',
    oracleId: 'ORC-10045782',
    quantity: 24,
    homeZone: Zone.WAREHOUSE,
    category: 'Smartphone',
    lastMovement: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    sku: 'IPH15P-256',
    description: 'iPhone 15 Pro 256GB Titanium',
    oracleId: 'ORC-10045793',
    quantity: 12,
    homeZone: Zone.WAREHOUSE,
    category: 'Smartphone',
    lastMovement: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
  },
  {
    id: '3',
    name: 'MacBook Pro 14"',
    sku: 'MBP14-1TB',
    description: 'MacBook Pro 14-inch M3 Pro 1TB',
    oracleId: 'ORC-10038921',
    quantity: 8,
    homeZone: Zone.QUALITY_CHECK,
    category: 'Laptop',
    lastMovement: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: '4',
    name: 'iPad Air',
    sku: 'IPAD-AIR-256',
    description: 'iPad Air 256GB WiFi Space Gray',
    oracleId: 'ORC-10032456',
    quantity: 16,
    homeZone: Zone.WAREHOUSE,
    category: 'Tablet',
    lastMovement: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
  },
  {
    id: '5',
    name: 'AirPods Pro',
    sku: 'APP-2',
    description: 'AirPods Pro 2nd Generation',
    oracleId: 'ORC-10029873',
    quantity: 32,
    homeZone: Zone.RECEIVING,
    category: 'Audio',
    lastMovement: new Date().toISOString() // Today
  },
  {
    id: '6',
    name: 'Apple Watch Series 9',
    sku: 'AWS9-GPS',
    description: 'Apple Watch Series 9 GPS 45mm',
    oracleId: 'ORC-10047821',
    quantity: 18,
    homeZone: Zone.WAREHOUSE,
    category: 'Wearable',
    lastMovement: new Date(Date.now() - 86400000 * 7).toISOString() // 7 days ago
  },
  {
    id: '7',
    name: 'iMac 24"',
    sku: 'IMAC-24-M3',
    description: 'iMac 24-inch M3 16GB RAM 512GB',
    oracleId: 'ORC-10043762',
    quantity: 5,
    homeZone: Zone.SHIPPING,
    category: 'Desktop',
    lastMovement: new Date(Date.now() - 86400000 * 4).toISOString() // 4 days ago
  },
  {
    id: '8',
    name: 'Mac mini',
    sku: 'MM-M2-512',
    description: 'Mac mini M2 512GB',
    oracleId: 'ORC-10042183',
    quantity: 10,
    homeZone: Zone.WAREHOUSE,
    category: 'Desktop',
    lastMovement: new Date(Date.now() - 86400000 * 6).toISOString() // 6 days ago
  }
];

// Generate a ZPL label for a tag and item
export function generateZPLLabel(tagId: string, item: Item): string {
  return `^XA
^FO50,50^FDItem: ${item.name}^FS
^FO50,100^FDTag ID: ${tagId}^FS
^FO50,150^FDSKU: ${item.sku}^FS
^FO50,200^BC^FD${tagId}^FS
^XZ`;
}

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Find an item by Oracle ID
export function findItemByOracleId(oracleId: string): Item | undefined {
  return MOCK_ITEMS.find(item => item.oracleId === oracleId);
}

// Find an item by SKU
export function findItemBySku(sku: string): Item | undefined {
  return MOCK_ITEMS.find(item => item.sku.toLowerCase() === sku.toLowerCase());
} 