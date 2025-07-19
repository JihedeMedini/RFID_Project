import { useState, useEffect } from 'react';
import type { MovementLog, Item } from '../mockServices';
import { 
  MovementService, 
  TagService, 
  AlertService,
  Zone, 
  MovementType,
  MOCK_ITEMS,
  AlertType,
  AlertSeverity
} from '../mockServices';

const MovementLogPage = () => {
  const [tagId, setTagId] = useState('');
  const [selectedZone, setSelectedZone] = useState<Zone>(Zone.ENTRY);
  const [selectedType, setSelectedType] = useState<MovementType>(MovementType.IN);
  const [logs, setLogs] = useState<MovementLog[]>([]);
  const [zoneFilter, setZoneFilter] = useState<Zone | ''>('');
  const [typeFilter, setTypeFilter] = useState<MovementType | ''>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonAnimating, setIsButtonAnimating] = useState(false);

  useEffect(() => {
    // Load existing movement logs
    setLogs(MovementService.getAllMovements());
  }, []);

  const handleTagIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagId(e.target.value);
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedZone(e.target.value as Zone);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as MovementType);
  };

  const handleZoneFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setZoneFilter(e.target.value as Zone | '');
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value as MovementType | '');
  };

  const handleSimulateScan = () => {
    // Generate a random tag ID to simulate scanning
    const randomTag = `TAG${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    setTagId(randomTag);
  };

  const handleRecordMovement = () => {
    if (!tagId.trim()) {
      alert('Please enter a tag ID');
      return;
    }

    setIsLoading(true);
    setIsButtonAnimating(true);
    
    setTimeout(() => {
      setIsButtonAnimating(false);
    }, 500);

    // Check if the tag is assigned to an item (if not, trigger an alert)
    const isAssigned = TagService.isTagAssigned(tagId);

    if (!isAssigned) {
      AlertService.triggerAlert(
        tagId,
        AlertType.UNASSIGNED_TAG,
        AlertSeverity.HIGH,
        'Unassigned tag movement detected'
      );
    }

    // Record the movement
    const movement = MovementService.logMovement(tagId, selectedZone, selectedType);
    
    // Update local state
    setLogs([movement, ...logs]);
    
    // Show success message
    const itemName = getItemName(tagId);
    setSuccessMessage(`Movement recorded: ${itemName ? itemName : 'Unknown item'} (${tagId}) ${selectedType} ${selectedZone}`);
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    
    // Reset form
    setTagId('');
    setIsLoading(false);
  };

  // Get item name by tag ID
  const getItemName = (tagId: string): string | null => {
    const item = TagService.getItemByTagId(tagId, MOCK_ITEMS);
    return item ? item.name : null;
  };

  // Filter logs based on selected filters
  const filteredLogs = logs.filter(log => {
    if (zoneFilter && log.zone !== zoneFilter) return false;
    if (typeFilter && log.movementType !== typeFilter) return false;
    return true;
  });

  // Get color for zone badge
  const getZoneColor = (zone: Zone): string => {
    switch (zone) {
      case Zone.ENTRY: return 'bg-green-100 text-green-800';
      case Zone.EXIT: return 'bg-red-100 text-red-800';
      case Zone.WAREHOUSE: return 'bg-blue-100 text-blue-800';
      case Zone.SHIPPING: return 'bg-purple-100 text-purple-800';
      case Zone.RECEIVING: return 'bg-yellow-100 text-yellow-800';
      case Zone.QUALITY_CHECK: return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get color for movement type badge
  const getMovementTypeColor = (type: MovementType): string => {
    switch (type) {
      case MovementType.IN: return 'bg-green-100 text-green-800';
      case MovementType.OUT: return 'bg-red-100 text-red-800';
      case MovementType.TRANSFER: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 animate-slide-in-left">Movement Log</h1>
        <div className="text-sm text-gray-500 animate-slide-in-right">
          {filteredLogs.length} movements found
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 animate-slide-up">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Record Movement
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
                <label htmlFor="tagId" className="block text-sm font-medium text-gray-700 mb-1">
                  RFID Tag ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="tagId"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={tagId}
                    onChange={handleTagIdChange}
                    placeholder="Enter tag ID"
                  />
                  <button
                    onClick={handleSimulateScan}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-md border border-gray-300 transition-all duration-300 flex items-center hover:shadow-md active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zm-2 7a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zm8-12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2V5h1v1h-1zm-2 7a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm2 2v-1h1v1h-1z" clipRule="evenodd" />
                    </svg>
                    Scan
                  </button>
                </div>
              </div>
              
              <div className="transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
                <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1">
                  Zone
                </label>
                <select
                  id="zone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={selectedZone}
                  onChange={handleZoneChange}
                >
                  {Object.values(Zone).map(zone => (
                    <option key={zone} value={zone}>
                      {zone.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Movement Type
                </label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={selectedType}
                  onChange={handleTypeChange}
                >
                  {Object.values(MovementType).map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleRecordMovement}
                disabled={isLoading || !tagId.trim()}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center hover:shadow-lg ${isButtonAnimating ? 'animate-wiggle' : ''} ${isLoading || !tagId.trim() ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Record Movement
                  </>
                )}
              </button>
              
              {successMessage && (
                <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 animate-scale-in">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        {successMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Movement History
              </h2>
            </div>
            
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
                  <label htmlFor="zoneFilter" className="block text-xs font-medium text-gray-500 mb-1">
                    Filter by Zone
                  </label>
                  <select
                    id="zoneFilter"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={zoneFilter}
                    onChange={handleZoneFilterChange}
                  >
                    <option value="">All Zones</option>
                    {Object.values(Zone).map(zone => (
                      <option key={zone} value={zone}>
                        {zone.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1 transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
                  <label htmlFor="typeFilter" className="block text-xs font-medium text-gray-500 mb-1">
                    Filter by Type
                  </label>
                  <select
                    id="typeFilter"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={typeFilter}
                    onChange={handleTypeFilterChange}
                  >
                    <option value="">All Types</option>
                    {Object.values(MovementType).map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 text-lg">No movement logs found.</p>
                <p className="text-gray-400 text-sm mt-1">Try changing your filters or record a new movement.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log, index) => {
                      const itemName = getItemName(log.tagId);
                      return (
                        <tr 
                          key={index} 
                          className={`${index === 0 ? "bg-blue-50" : ""} hover:bg-gray-50 transition-colors duration-150`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{log.tagId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{itemName || 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getZoneColor(log.zone)}`}>
                              {log.zone.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMovementTypeColor(log.movementType)}`}>
                              {log.movementType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementLogPage; 