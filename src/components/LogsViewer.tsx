import { useState, useEffect } from 'react';
import { 
  ArrowPathIcon,
  FunnelIcon,
  CalendarIcon,
  TagIcon,
  MapIcon,
  ArrowRightIcon,
  ClockIcon,
  UserIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

export type LogEntry = {
  id: number;
  tagId: string;
  tagName: string;
  timestamp: string;
  sourceZone: string | null;
  destinationZone: string;
  reader: string;
  eventType: 'entry' | 'exit' | 'movement';
  user?: string;
  details?: string;
};

type LogsViewerProps = {
  initialLogs?: LogEntry[];
  onRefresh?: () => void;
};

const LogsViewer = ({ initialLogs = [], onRefresh }: LogsViewerProps) => {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(initialLogs);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    eventType: '',
    zone: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    // Apply filters and search
    let result = logs;
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.tagId.toLowerCase().includes(term) ||
        log.tagName.toLowerCase().includes(term) ||
        log.reader.toLowerCase().includes(term) ||
        (log.destinationZone && log.destinationZone.toLowerCase().includes(term)) ||
        (log.sourceZone && log.sourceZone.toLowerCase().includes(term))
      );
    }
    
    // Apply filters
    if (filters.eventType) {
      result = result.filter(log => log.eventType === filters.eventType);
    }
    
    if (filters.zone) {
      result = result.filter(log => 
        (log.sourceZone && log.sourceZone === filters.zone) || 
        (log.destinationZone && log.destinationZone === filters.zone)
      );
    }
    
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      result = result.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    setFilteredLogs(result);
  }, [logs, searchTerm, filters]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    
    if (onRefresh) {
      onRefresh();
    }
    
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };
  
  const clearFilters = () => {
    setFilters({
      eventType: '',
      zone: '',
      startDate: '',
      endDate: '',
    });
    setSearchTerm('');
  };
  
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'entry': return 'Entry';
      case 'exit': return 'Exit';
      case 'movement': return 'Movement';
      default: return type;
    }
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'exit': return 'bg-red-100 text-red-800';
      case 'movement': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const exportCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Tag ID', 'Tag Name', 'Timestamp', 'Source Zone', 'Destination Zone', 'Reader', 'Event Type', 'User', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.tagId,
        `"${log.tagName}"`, // Quotes to handle commas in names
        log.timestamp,
        log.sourceZone || '',
        log.destinationZone,
        `"${log.reader}"`,
        log.eventType,
        log.user || '',
        log.details ? `"${log.details}"` : ''
      ].join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rfid_movement_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Extract unique zones for filter dropdown
  const zones = Array.from(new Set([
    ...logs.map(log => log.sourceZone).filter(Boolean),
    ...logs.map(log => log.destinationZone).filter(Boolean)
  ]));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Movement Logs</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              className="block w-full pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div>
              <label htmlFor="filter-event-type" className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                id="filter-event-type"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
              >
                <option value="">All Events</option>
                <option value="entry">Entry</option>
                <option value="exit">Exit</option>
                <option value="movement">Movement</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="filter-zone" className="block text-sm font-medium text-gray-700 mb-1">
                Zone
              </label>
              <select
                id="filter-zone"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.zone}
                onChange={(e) => handleFilterChange('zone', e.target.value)}
              >
                <option value="">All Zones</option>
                {zones.map((zone, index) => (
                  <option key={index} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="filter-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="filter-start-date"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="filter-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="filter-end-date"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tag
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reader
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No logs found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <TagIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{log.tagName}</div>
                        <div className="text-xs text-gray-500">{log.tagId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventTypeColor(log.eventType)}`}>
                      {getEventTypeLabel(log.eventType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {log.sourceZone ? (
                        <>
                          <div className="flex items-center">
                            <MapIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">{log.sourceZone}</span>
                          </div>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                        </>
                      ) : null}
                      <div className="flex items-center">
                        <MapIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{log.destinationZone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.reader}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.user ? (
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">{log.user}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {filteredLogs.length} results
        </div>
        <div className="flex space-x-2">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={true}
          >
            Previous
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={true}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogsViewer; 