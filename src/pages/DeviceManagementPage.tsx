import { useState, useEffect } from 'react';
import {  
  PlusIcon, 
  CubeIcon,
  PencilIcon, 
  TrashIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

import DeviceStatusMonitor from '../components/DeviceStatusMonitor';
import AntennaMapping from '../components/AntennaMapping';
import ReaderRegistration from '../components/ReaderRegistration';

// Define types to match DeviceStatusMonitor component
type DeviceStatus = 'online' | 'offline' | 'warning';

type DeviceMetrics = {
  cpuUsage: number;
  memoryUsage: number;
  temperature: number;
  uptime: string;
  readRate: number;
  signalStrength: number;
  lastPing: string;
};

type DeviceType = {
  id: number;
  name: string;
  status: DeviceStatus;
  ipAddress: string;
  location: string;
  lastSeen: string;
  metrics?: DeviceMetrics;
  antennas?: number;
  activeAntennas?: number;
};

// Mock data for RFID readers
const mockReaders: DeviceType[] = [
  { 
    id: 1, 
    name: 'Reader-001', 
    location: 'Warehouse Zone A', 
    status: 'online', 
    lastSeen: '2023-05-15 14:32:45',
    ipAddress: '192.168.1.101',
    antennas: 4,
    activeAntennas: 4,
    metrics: {
      cpuUsage: 32,
      memoryUsage: 45,
      temperature: 42,
      uptime: '5d 12h 32m',
      readRate: 120,
      signalStrength: 85,
      lastPing: '2 seconds ago'
    }
  },
  { 
    id: 2, 
    name: 'Reader-002', 
    location: 'Shipping Area', 
    status: 'online', 
    lastSeen: '2023-05-15 14:30:12',
    ipAddress: '192.168.1.102',
    antennas: 4,
    activeAntennas: 3,
    metrics: {
      cpuUsage: 28,
      memoryUsage: 38,
      temperature: 40,
      uptime: '3d 8h 15m',
      readRate: 95,
      signalStrength: 78,
      lastPing: '3 seconds ago'
    }
  },
  { 
    id: 3, 
    name: 'Reader-003', 
    location: 'Receiving Area', 
    status: 'offline', 
    lastSeen: '2023-05-15 13:45:22',
    ipAddress: '192.168.1.103',
    antennas: 2,
    activeAntennas: 0
  },
  { 
    id: 4, 
    name: 'Reader-004', 
    location: 'Warehouse Zone B', 
    status: 'online', 
    lastSeen: '2023-05-15 14:25:33',
    ipAddress: '192.168.1.104',
    antennas: 4,
    activeAntennas: 4,
    metrics: {
      cpuUsage: 45,
      memoryUsage: 52,
      temperature: 44,
      uptime: '2d 4h 18m',
      readRate: 110,
      signalStrength: 90,
      lastPing: '1 second ago'
    }
  },
  { 
    id: 5, 
    name: 'Reader-005', 
    location: 'Restricted Zone', 
    status: 'warning', 
    lastSeen: '2023-05-15 14:22:01',
    ipAddress: '192.168.1.105',
    antennas: 2,
    activeAntennas: 2,
    metrics: {
      cpuUsage: 78,
      memoryUsage: 82,
      temperature: 68,
      uptime: '7d 22h 43m',
      readRate: 65,
      signalStrength: 45,
      lastPing: '5 seconds ago'
    }
  },
];

// Mock antenna data
const mockAntennas = [
  {
    id: 1,
    name: 'Antenna 1',
    status: 'active',
    power: 27,
    gain: 6.5,
    polarization: 'Circular',
    coverage: '5m x 5m area, 120-degree coverage',
    zoneId: 1,
    zoneName: 'Warehouse Zone A'
  },
  {
    id: 2,
    name: 'Antenna 2',
    status: 'active',
    power: 25,
    gain: 6.0,
    polarization: 'Linear',
    coverage: '4m x 6m area, 90-degree coverage',
    zoneId: 1,
    zoneName: 'Warehouse Zone A'
  },
  {
    id: 3,
    name: 'Antenna 3',
    status: 'active',
    power: 26,
    gain: 6.0,
    polarization: 'Circular',
    coverage: '5m x 5m area, 120-degree coverage',
    zoneId: 2,
    zoneName: 'Warehouse Zone B'
  },
  {
    id: 4,
    name: 'Antenna 4',
    status: 'inactive',
    power: 20,
    gain: 5.5,
    polarization: 'Linear',
    coverage: '3m x 4m area, 90-degree coverage'
  }
];

const DeviceManagementPage = () => {
  const [readers, setReaders] = useState(mockReaders);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReader, setSelectedReader] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'status' | 'antennas' | 'register'>('table');
  
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const filteredReaders = readers.filter(reader => 
    reader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reader.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddReader = () => {
    setViewMode('register');
  };
  
  const handleEditReader = (reader: any) => {
    setSelectedReader(reader);
    setShowEditModal(true);
  };
  
  const handleDeleteReader = (id: number) => {
    if (confirm('Are you sure you want to delete this reader?')) {
      setReaders(readers.filter(reader => reader.id !== id));
    }
  };
  
  const handleConfigureAntennas = (reader: any) => {
    setSelectedReader({
      ...reader,
      antennas: mockAntennas // In a real app, you would fetch the antennas for this specific reader
    });
    setViewMode('antennas');
  };
  
  const handleSaveAntennaConfig = (updatedReader: any) => {
    // In a real app, you would save this to the backend
    console.log('Saving antenna configuration:', updatedReader);
    setSelectedReader(null);
    setViewMode('table');
  };
  
  const handleRegisterReader = (readerData: any) => {
    // In a real app, you would save this to the backend
    console.log('Registering reader:', readerData);
    
    // Add the new reader to the list
    const newReader: DeviceType = {
      id: readers.length + 1,
      name: readerData.name,
      location: readerData.location,
      status: 'offline' as DeviceStatus,
      lastSeen: new Date().toLocaleString(),
      ipAddress: readerData.ipAddress,
      antennas: readerData.model.antennaCount,
      activeAntennas: 0
    };
    
    setReaders([...readers, newReader]);
    setViewMode('table');
  };
  
  const handleCancelRegistration = () => {
    setViewMode('table');
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Device Management</h1>
        <div className="flex space-x-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 flex items-center ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <TableCellsIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">List</span>
            </button>
            <button 
              onClick={() => setViewMode('status')}
              className={`px-3 py-2 flex items-center ${viewMode === 'status' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Squares2X2Icon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Status</span>
            </button>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleAddReader}
            className="flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Reader
          </button>
        </div>
      </div>
      
      {viewMode !== 'register' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative max-w-xs w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search readers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Online
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  Offline
                </button>
                <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Warning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {viewMode === 'register' ? (
        <ReaderRegistration 
          onRegisterReader={handleRegisterReader}
          onCancel={handleCancelRegistration}
        />
      ) : viewMode === 'antennas' && selectedReader ? (
        <AntennaMapping 
          reader={selectedReader} 
          onSave={handleSaveAntennaConfig} 
        />
      ) : viewMode === 'status' ? (
        <DeviceStatusMonitor 
          devices={filteredReaders} 
          onRefresh={handleRefresh} 
        />
      ) : (
        /* Readers Table */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reader
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Antennas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReaders.map((reader) => (
                  <tr key={reader.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <CubeIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{reader.name}</div>
                          <div className="text-sm text-gray-500">ID: {reader.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reader.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reader.status === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : reader.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {reader.status === 'online' ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Online
                          </>
                        ) : reader.status === 'warning' ? (
                          <>
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            Warning
                          </>
                        ) : (
                          <>
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            Offline
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reader.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500">{reader.activeAntennas} / {reader.antennas}</span>
                        <button 
                          onClick={() => handleConfigureAntennas(reader)}
                          className="ml-2 text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                        >
                          <SignalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reader.lastSeen}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditReader(reader)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteReader(reader.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Edit Reader Modal */}
      {showEditModal && selectedReader && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CubeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit RFID Reader</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="edit-reader-name" className="block text-sm font-medium text-gray-700">Reader Name</label>
                        <input
                          type="text"
                          id="edit-reader-name"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          defaultValue={selectedReader.name}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-reader-location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                          type="text"
                          id="edit-reader-location"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          defaultValue={selectedReader.location}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-reader-ip" className="block text-sm font-medium text-gray-700">IP Address</label>
                        <input
                          type="text"
                          id="edit-reader-ip"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          defaultValue={selectedReader.ipAddress}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-reader-status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          id="edit-reader-status"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          defaultValue={selectedReader.status}
                        >
                          <option value="online">Online</option>
                          <option value="warning">Warning</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditModal(false);
                            handleConfigureAntennas(selectedReader);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <SignalIcon className="h-4 w-4 mr-2" />
                          Configure Antennas
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagementPage;