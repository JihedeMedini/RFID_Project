import { useState, useEffect } from 'react';
import LogsViewer, { LogEntry } from '../components/LogsViewer';

// Mock data for movement logs
const mockLogs: LogEntry[] = [
  {
    id: 1,
    tagId: 'T001',
    tagName: 'Pallet 001',
    timestamp: '2023-05-15 14:32:45',
    sourceZone: 'Warehouse Zone A',
    destinationZone: 'Shipping Area',
    reader: 'Reader-002',
    eventType: 'movement',
    user: 'John Doe'
  },
  {
    id: 2,
    tagId: 'T002',
    tagName: 'Pallet 002',
    timestamp: '2023-05-15 14:30:12',
    sourceZone: null,
    destinationZone: 'Warehouse Zone A',
    reader: 'Reader-001',
    eventType: 'entry',
    user: 'Jane Smith'
  },
  {
    id: 3,
    tagId: 'T003',
    tagName: 'Container A',
    timestamp: '2023-05-15 13:45:22',
    sourceZone: 'Receiving Area',
    destinationZone: 'Warehouse Zone B',
    reader: 'Reader-004',
    eventType: 'movement',
    user: 'Robert Johnson'
  },
  {
    id: 4,
    tagId: 'T004',
    tagName: 'Container B',
    timestamp: '2023-05-15 13:22:18',
    sourceZone: 'Warehouse Zone B',
    destinationZone: 'Shipping Area',
    reader: 'Reader-002',
    eventType: 'movement',
    user: 'Emily Davis'
  },
  {
    id: 5,
    tagId: 'T005',
    tagName: 'Equipment X',
    timestamp: '2023-05-15 12:15:33',
    sourceZone: 'Restricted Zone',
    destinationZone: 'Warehouse Zone A',
    reader: 'Reader-001',
    eventType: 'movement',
    user: 'John Doe'
  },
  {
    id: 6,
    tagId: 'T001',
    tagName: 'Pallet 001',
    timestamp: '2023-05-15 11:42:05',
    sourceZone: 'Shipping Area',
    destinationZone: 'Outside',
    reader: 'Reader-002',
    eventType: 'exit',
    user: 'Jane Smith',
    details: 'Shipped to Customer ABC'
  },
  {
    id: 7,
    tagId: 'T006',
    tagName: 'New Equipment',
    timestamp: '2023-05-15 10:30:00',
    sourceZone: null,
    destinationZone: 'Receiving Area',
    reader: 'Reader-003',
    eventType: 'entry',
    user: 'Robert Johnson',
    details: 'Received from Supplier XYZ'
  },
  {
    id: 8,
    tagId: 'T003',
    tagName: 'Container A',
    timestamp: '2023-05-15 09:15:22',
    sourceZone: null,
    destinationZone: 'Receiving Area',
    reader: 'Reader-003',
    eventType: 'entry',
    user: 'Emily Davis'
  },
  {
    id: 9,
    tagId: 'T004',
    tagName: 'Container B',
    timestamp: '2023-05-15 09:12:45',
    sourceZone: null,
    destinationZone: 'Receiving Area',
    reader: 'Reader-003',
    eventType: 'entry',
    user: 'Emily Davis'
  },
  {
    id: 10,
    tagId: 'T007',
    tagName: 'Special Equipment',
    timestamp: '2023-05-15 08:30:15',
    sourceZone: null,
    destinationZone: 'Restricted Zone',
    reader: 'Reader-005',
    eventType: 'entry',
    user: 'John Doe',
    details: 'Authorized access granted'
  }
];

const MovementLogPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data from an API
    console.log('Refreshing logs...');
    
    // For demo purposes, we'll just randomize the order of the logs
    setLogs([...mockLogs].sort(() => Math.random() - 0.5));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Movement Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and monitor the movement of RFID tags across different zones.
        </p>
      </div>
      
      <LogsViewer initialLogs={logs} onRefresh={handleRefresh} />
    </div>
  );
};

export default MovementLogPage; 