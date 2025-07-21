import { useState } from 'react';
import { 
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  BellAlertIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

type AnomalyType = 'unauthorized_movement' | 'unexpected_entry' | 'device_failure' | 'suspicious_pattern' | 'zone_overcapacity';

type Anomaly = {
  id: number;
  type: AnomalyType;
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved';
  location?: string;
  tagId?: string;
  deviceId?: string;
};

type AnomalyDetectionProps = {
  onRefresh?: () => void;
};

const AnomalyDetection = ({ onRefresh }: AnomalyDetectionProps) => {
  // Mock anomalies data
  const mockAnomalies: Anomaly[] = [
    {
      id: 1,
      type: 'unauthorized_movement',
      title: 'Unauthorized Movement Detected',
      description: 'Tag T007 moved from Restricted Zone to Warehouse Zone A without authorization.',
      timestamp: '2023-05-15 14:32:45',
      severity: 'high',
      status: 'new',
      location: 'Warehouse Zone A',
      tagId: 'T007'
    },
    {
      id: 2,
      type: 'device_failure',
      title: 'Reader Offline',
      description: 'Reader-003 in Receiving Area has gone offline unexpectedly.',
      timestamp: '2023-05-15 13:45:22',
      severity: 'medium',
      status: 'investigating',
      location: 'Receiving Area',
      deviceId: 'Reader-003'
    },
    {
      id: 3,
      type: 'suspicious_pattern',
      title: 'Suspicious Movement Pattern',
      description: 'Tag T004 has moved between Shipping Area and Warehouse Zone B 5 times in the last hour.',
      timestamp: '2023-05-15 12:15:33',
      severity: 'medium',
      status: 'new',
      location: 'Shipping Area',
      tagId: 'T004'
    },
    {
      id: 4,
      type: 'zone_overcapacity',
      title: 'Zone Overcapacity',
      description: 'Warehouse Zone A has exceeded its maximum capacity of 500 tags.',
      timestamp: '2023-05-15 11:30:10',
      severity: 'low',
      status: 'resolved',
      location: 'Warehouse Zone A'
    },
    {
      id: 5,
      type: 'unexpected_entry',
      title: 'Unexpected Entry After Hours',
      description: 'Tag T002 entered Restricted Zone outside of business hours.',
      timestamp: '2023-05-15 02:45:18',
      severity: 'critical',
      status: 'investigating',
      location: 'Restricted Zone',
      tagId: 'T002'
    }
  ];
  
  const [anomalies, setAnomalies] = useState<Anomaly[]>(mockAnomalies);
  const [expandedAnomalyId, setExpandedAnomalyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
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
  
  const handleExpandAnomaly = (id: number) => {
    setExpandedAnomalyId(expandedAnomalyId === id ? null : id);
  };
  
  const handleUpdateStatus = (id: number, status: 'new' | 'investigating' | 'resolved') => {
    setAnomalies(anomalies.map(anomaly => 
      anomaly.id === id ? { ...anomaly, status } : anomaly
    ));
  };
  
  // Apply filters
  const filteredAnomalies = anomalies.filter(anomaly => {
    if (statusFilter !== 'all' && anomaly.status !== statusFilter) return false;
    if (severityFilter !== 'all' && anomaly.severity !== severityFilter) return false;
    return true;
  });
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getAnomalyIcon = (type: AnomalyType) => {
    switch (type) {
      case 'unauthorized_movement':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'unexpected_entry':
        return <BellAlertIcon className="h-5 w-5 text-red-500" />;
      case 'device_failure':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'suspicious_pattern':
        return <ExclamationTriangleIcon className="h-5 w-5 text-purple-500" />;
      case 'zone_overcapacity':
        return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Anomaly Detection</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="text-sm text-gray-500">Status:</label>
            <select
              id="status-filter"
              className="text-sm border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="severity-filter" className="text-sm text-gray-500">Severity:</label>
            <select
              id="severity-filter"
              className="text-sm border-gray-300 rounded-md"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden">
        {filteredAnomalies.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No anomalies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No anomalies match your current filter criteria.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredAnomalies.map((anomaly) => (
              <li key={anomaly.id} className="hover:bg-gray-50">
                <div 
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleExpandAnomaly(anomaly.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getAnomalyIcon(anomaly.type)}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{anomaly.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{anomaly.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(anomaly.status)}`}>
                        {anomaly.status.charAt(0).toUpperCase() + anomaly.status.slice(1)}
                      </span>
                      <ChevronRightIcon 
                        className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${expandedAnomalyId === anomaly.id ? 'rotate-90' : ''}`} 
                      />
                    </div>
                  </div>
                </div>
                
                {expandedAnomalyId === anomaly.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">{anomaly.timestamp}</span>
                          </div>
                          {anomaly.location && (
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-700">{anomaly.location}</span>
                            </div>
                          )}
                          {anomaly.tagId && (
                            <div className="flex items-center">
                              <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-700">{anomaly.tagId}</span>
                            </div>
                          )}
                          {anomaly.deviceId && (
                            <div className="flex items-center">
                              <CubeIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-700">{anomaly.deviceId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {anomaly.status !== 'investigating' && (
                            <button
                              onClick={() => handleUpdateStatus(anomaly.id, 'investigating')}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Mark as Investigating
                            </button>
                          )}
                          {anomaly.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateStatus(anomaly.id, 'resolved')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Mark as Resolved
                            </button>
                          )}
                          {anomaly.tagId && (
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Tag Details
                            </button>
                          )}
                          {anomaly.location && (
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Zone
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AnomalyDetection; 