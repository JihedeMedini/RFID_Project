import { useState, useEffect } from 'react';
import { 
  SignalIcon, 
  BoltIcon, 
  WifiIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

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
};

type DeviceStatusMonitorProps = {
  devices: DeviceType[];
  onRefresh: () => void;
};

const DeviceStatusMonitor = ({ devices, onRefresh }: DeviceStatusMonitorProps) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  useEffect(() => {
    let intervalId: number | undefined = undefined;
    
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const getStatusColor = (status: DeviceStatus) => {
    switch(status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: DeviceStatus) => {
    switch(status) {
      case 'online':
        return <CheckCircleIcon className="h-4 w-4 mr-1" />;
      case 'offline':
        return <ExclamationCircleIcon className="h-4 w-4 mr-1" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  const getMetricColor = (value: number, thresholds: [number, number]) => {
    const [warning, critical] = thresholds;
    if (value >= critical) return 'text-red-600';
    if (value >= warning) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Device Status Monitor</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              id="auto-refresh"
              name="auto-refresh"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={autoRefresh}
              onChange={() => setAutoRefresh(!autoRefresh)}
            />
            <label htmlFor="auto-refresh" className="ml-2 block text-sm text-gray-900">
              Auto-refresh
            </label>
            {autoRefresh && (
              <select
                className="ml-2 block w-20 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
              >
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">1m</option>
                <option value="300">5m</option>
              </select>
            )}
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
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
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
            {devices.map((device) => (
              <tr key={device.id} className={device === selectedDevice ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CubeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{device.name}</div>
                      <div className="text-sm text-gray-500">ID: {device.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(device.status)}`}>
                    {getStatusIcon(device.status)}
                    {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {device.ipAddress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {device.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {device.lastSeen}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedDevice(selectedDevice === device ? null : device)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {selectedDevice === device ? 'Hide Details' : 'View Details'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Device Details Panel */}
      {selectedDevice && selectedDevice.metrics && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedDevice.name} - Detailed Metrics
            </h3>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedDevice.status)}`}>
              {getStatusIcon(selectedDevice.status)}
              {selectedDevice.status.charAt(0).toUpperCase() + selectedDevice.status.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <BoltIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-700">System</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">CPU Usage</span>
                    <span className={`text-xs font-medium ${getMetricColor(selectedDevice.metrics.cpuUsage, [70, 90])}`}>
                      {selectedDevice.metrics.cpuUsage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        selectedDevice.metrics.cpuUsage >= 90 ? 'bg-red-500' : 
                        selectedDevice.metrics.cpuUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${selectedDevice.metrics.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Memory Usage</span>
                    <span className={`text-xs font-medium ${getMetricColor(selectedDevice.metrics.memoryUsage, [70, 90])}`}>
                      {selectedDevice.metrics.memoryUsage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        selectedDevice.metrics.memoryUsage >= 90 ? 'bg-red-500' : 
                        selectedDevice.metrics.memoryUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${selectedDevice.metrics.memoryUsage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Temperature</span>
                  <span className={`text-xs font-medium ${getMetricColor(selectedDevice.metrics.temperature, [60, 75])}`}>
                    {selectedDevice.metrics.temperature}°C
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Uptime</span>
                  <span className="text-xs font-medium text-gray-700">
                    {selectedDevice.metrics.uptime}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <SignalIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-700">RFID Performance</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Read Rate (tags/sec)</span>
                    <span className="text-xs font-medium text-gray-700">
                      {selectedDevice.metrics.readRate}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(selectedDevice.metrics.readRate / 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Signal Strength</span>
                    <span className={`text-xs font-medium ${getMetricColor(selectedDevice.metrics.signalStrength, [40, 20])}`}>
                      {selectedDevice.metrics.signalStrength}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        selectedDevice.metrics.signalStrength <= 20 ? 'bg-red-500' : 
                        selectedDevice.metrics.signalStrength <= 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${selectedDevice.metrics.signalStrength}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <WifiIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-700">Network</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">IP Address</span>
                  <span className="text-xs font-medium text-gray-700">
                    {selectedDevice.ipAddress}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Last Ping</span>
                  <span className="text-xs font-medium text-gray-700">
                    {selectedDevice.metrics.lastPing}
                  </span>
                </div>
                
                <div className="flex items-center mt-4">
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                  >
                    Ping Device
                  </button>
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Restart Device
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setSelectedDevice(null)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceStatusMonitor; 