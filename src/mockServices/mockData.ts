import { Item, Zone } from './types';

// Pre-defined items for the warehouse
export const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    name: 'iPhone 15',
    sku: 'IPH15-128',
    description: 'iPhone 15 128GB Black'
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    sku: 'IPH15P-256',
    description: 'iPhone 15 Pro 256GB Titanium'
  },
  {
    id: '3',
    name: 'MacBook Pro 14"',
    sku: 'MBP14-1TB',
    description: 'MacBook Pro 14-inch M3 Pro 1TB'
  },
  {
    id: '4',
    name: 'iPad Air',
    sku: 'IPAD-AIR-256',
    description: 'iPad Air 256GB WiFi Space Gray'
  },
  {
    id: '5',
    name: 'AirPods Pro',
    sku: 'APP-2',
    description: 'AirPods Pro 2nd Generation'
  }
];

// Generate a ZPL label for a tag and item
export function generateZPLLabel(tagId: string, item: Item, homeZone: Zone): string {
  return `^XA
^FO50,50^FDItem: ${item.name}^FS
^FO50,100^FDTag ID: ${tagId}^FS
^FO50,150^FDSKU: ${item.sku}^FS
^FO50,200^FDHome Zone: ${homeZone.replace('_', ' ')}^FS
^FO50,250^BC^FD${tagId}^FS
^XZ`;
}

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
} 