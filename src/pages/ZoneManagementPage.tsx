import { useState } from 'react';
import { 
  CubeIcon,
  MapIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import ZoneCreationForm, { ZoneType, RuleType } from '../components/ZoneCreationForm';

// Mock data for zones
const mockZones: ZoneType[] = [
  {
    id: 1,
    name: 'EXIT ZONE',
    description: 'Main storage area for finished products',
    type: 'EXIT',
    color: '#3B82F6', // Blue
    readers: [1, 4],
    rules: [
      {
        id: 1,
        name: 'Unauthorized Entry Alert',
        type: 'entry',
        condition: 'Tag without warehouse access enters zone',
        action: 'Send alert to security team',
        enabled: true
      },
      {
        id: 2,
        name: 'Extended Duration Alert',
        type: 'duration',
        condition: 'Tag remains in zone for more than 8 hours',
        action: 'Send notification to supervisor',
        enabled: true
      }
    ]
  },
  {
    id: 2,
    name: 'Shipping Area',
    description: 'Area for outbound shipments and loading',
    type: 'shipping',
    color: '#10B981', // Green
    readers: [2],
    rules: [
      {
        id: 1,
        name: 'Shipping Verification',
        type: 'exit',
        condition: 'Tagged item exits zone without shipping approval',
        action: 'Trigger alarm and block exit gate',
        enabled: true
      }
    ]
  },
  {
    id: 3,
    name: 'Receiving Area',
    description: 'Area for inbound deliveries and unloading',
    type: 'receiving',
    color: '#F59E0B', // Amber
    readers: [3],
    rules: []
  },
  {
    id: 4,
    name: 'Warehouse Zone',
    description: 'High-security area with limited access',
    type: 'warehouse',
    color: '#EF4444', // Red
    readers: [5],
    rules: [
      {
        id: 1,
        name: 'Unauthorized Access',
        type: 'entry',
        condition: 'Any tag without explicit authorization enters zone',
        action: 'Trigger security alarm and lock doors',
        enabled: true
      },
      {
        id: 2,
        name: 'After Hours Access',
        type: 'entry',
        condition: 'Any tag enters zone outside business hours (8am-6pm)',
        action: 'Record video and send alert to security',
        enabled: true
      }
    ]
  }
];

// Mock data for readers (simplified version)
const mockReaders = [
  { id: 1, name: 'Reader-001' },
  { id: 2, name: 'Reader-002' },
  { id: 3, name: 'Reader-003' },
  { id: 4, name: 'Reader-004' },
  { id: 5, name: 'Reader-005' }
];

const ZoneManagementPage = () => {
  const [zones, setZones] = useState<ZoneType[]>(mockZones);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateZone = () => {
    setIsCreating(true);
  };
  
  const handleEditZone = (zone: ZoneType) => {
    setSelectedZone(zone);
    setIsEditing(true);
  };
  
  const handleDeleteZone = (zoneId: number) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      setZones(zones.filter(zone => zone.id !== zoneId));
    }
  };
  
  const handleSaveZone = (zone: ZoneType) => {
    if (isEditing) {
      setZones(zones.map(z => z.id === zone.id ? zone : z));
      setIsEditing(false);
    } else {
      setZones([...zones, zone]);
      setIsCreating(false);
    }
    setSelectedZone(null);
  };
  
  const handleCancelZoneForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedZone(null);
  };
  
  const getZoneTypeLabel = (type: ZoneType['type']) => {
    switch (type) {
      case 'warehouse': return 'Warehouse';
      case 'shipping': return 'Shipping';
      case 'receiving': return 'Receiving';
      case 'restricted': return 'Restricted';
      case 'custom': return 'Custom';
      default: return type;
    }
  };
  
  const getAssignedReaderNames = (readerIds: number[]) => {
    return readerIds
      .map(id => mockReaders.find(reader => reader.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };
  
  if (isCreating || isEditing) {
    return (
      <ZoneCreationForm 
        zone={selectedZone || undefined}
        onSave={handleSaveZone}
        onCancel={handleCancelZoneForm}
        availableReaders={mockReaders}
      />
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Zone Management</h1>
        <div className="flex space-x-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex items-center ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="text-sm font-medium">Grid</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium">List</span>
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
            onClick={handleCreateZone}
            className="flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Zone
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Type:</span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Warehouse
              </button>
              <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Shipping
              </button>
              <button className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                Receiving
              </button>
              <button className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                Restricted
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {filteredZones.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No zones found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new zone.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCreateZone}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Zone
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredZones.map((zone) => (
            <div 
              key={zone.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center" style={{ backgroundColor: `${zone.color}10` }}>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: `${zone.color}20` }}>
                    <MapIcon className="h-6 w-6" style={{ color: zone.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{zone.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${zone.color}20`, color: zone.color }}>
                      {getZoneTypeLabel(zone.type)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditZone(zone)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                {zone.description && (
                  <p className="text-sm text-gray-500 mb-4">{zone.description}</p>
                )}
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Assigned Readers
                    </div>
                    <div className="flex items-center">
                      <CubeIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-700">
                        {zone.readers.length > 0 
                          ? getAssignedReaderNames(zone.readers)
                          : 'No readers assigned'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Rules
                    </div>
                    <div className="flex items-center">
                      {zone.rules.length > 0 ? (
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-gray-700">
                            {zone.rules.length} rule{zone.rules.length !== 1 ? 's' : ''} configured
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <ShieldExclamationIcon className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-sm text-gray-700">No rules configured</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => handleEditZone(zone)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit Zone
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Readers
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rules
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredZones.map((zone) => (
                <tr key={zone.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${zone.color}20` }}>
                        <MapIcon className="h-6 w-6" style={{ color: zone.color }} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                        <div className="text-sm text-gray-500">{zone.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${zone.color}20`, color: zone.color }}>
                      {getZoneTypeLabel(zone.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {zone.readers.length > 0 
                      ? getAssignedReaderNames(zone.readers)
                      : 'No readers assigned'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {zone.rules.length > 0 ? (
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-700">
                          {zone.rules.length} rule{zone.rules.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ShieldExclamationIcon className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-sm text-gray-700">No rules</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEditZone(zone)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteZone(zone.id)}
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
      )}
    </div>
  );
};

export default ZoneManagementPage; 