import { useState } from 'react';
import { 
  TagIcon, 
  ExclamationCircleIcon, 
  MapIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ArrowSmallUpIcon,
  ArrowSmallDownIcon
} from '@heroicons/react/24/outline';
import { CubeIcon } from '@heroicons/react/24/outline';

// Mock data for the dashboard
const mockData = {
  tagCount: 1254,
  tagChange: 12,
  activeReaders: 8,
  readerChange: -1,
  activeZones: 5,
  zoneChange: 0,
  alerts: 3,
  alertsChange: -2,
  recentMovements: [
    { id: 1, tagId: 'T-1001', location: 'Warehouse Zone A', timestamp: '2023-05-15 14:32:45', status: 'normal' },
    { id: 2, tagId: 'T-1042', location: 'Shipping Area', timestamp: '2023-05-15 14:30:12', status: 'normal' },
    { id: 3, tagId: 'T-2103', location: 'Restricted Zone', timestamp: '2023-05-15 14:28:55', status: 'alert' },
    { id: 4, tagId: 'T-1578', location: 'Warehouse Zone B', timestamp: '2023-05-15 14:25:33', status: 'normal' },
    { id: 5, tagId: 'T-1305', location: 'Receiving Area', timestamp: '2023-05-15 14:22:01', status: 'normal' },
  ],
  recentAlerts: [
    { id: 1, message: 'Unauthorized movement detected in Restricted Zone', timestamp: '2023-05-15 14:28:55', level: 'high' },
    { id: 2, message: 'RFID Reader #3 disconnected', timestamp: '2023-05-15 13:45:22', level: 'medium' },
    { id: 3, message: 'Tag T-1042 battery low', timestamp: '2023-05-15 12:12:05', level: 'low' },
  ],
  zoneActivity: [
    { name: 'Warehouse Zone A', count: 423 },
    { name: 'Warehouse Zone B', count: 385 },
    { name: 'Shipping Area', count: 214 },
    { name: 'Receiving Area', count: 156 },
    { name: 'Restricted Zone', count: 76 },
  ]
};

const DashboardPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={handleRefresh}
          className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Tags</p>
              <p className="text-2xl font-bold mt-1">{mockData.tagCount}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-md">
              <TagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {mockData.tagChange > 0 ? (
              <>
                <ArrowSmallUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-500 ml-1">+{mockData.tagChange} since yesterday</span>
              </>
            ) : (
              <>
                <ArrowSmallDownIcon className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-500 ml-1">{mockData.tagChange} since yesterday</span>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Readers</p>
              <p className="text-2xl font-bold mt-1">{mockData.activeReaders}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-md">
              <CubeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {mockData.readerChange >= 0 ? (
              <>
                <ArrowSmallUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-500 ml-1">+{mockData.readerChange} since yesterday</span>
              </>
            ) : (
              <>
                <ArrowSmallDownIcon className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-500 ml-1">{mockData.readerChange} since yesterday</span>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Zones</p>
              <p className="text-2xl font-bold mt-1">{mockData.activeZones}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-md">
              <MapIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {mockData.zoneChange > 0 ? (
              <>
                <ArrowSmallUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-500 ml-1">+{mockData.zoneChange} since yesterday</span>
              </>
            ) : mockData.zoneChange < 0 ? (
              <>
                <ArrowSmallDownIcon className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-500 ml-1">{mockData.zoneChange} since yesterday</span>
              </>
            ) : (
              <span className="text-xs font-medium text-gray-500 ml-1">No change</span>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Alerts</p>
              <p className="text-2xl font-bold mt-1">{mockData.alerts}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-md">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {mockData.alertsChange > 0 ? (
              <>
                <ArrowSmallUpIcon className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-500 ml-1">+{mockData.alertsChange} since yesterday</span>
              </>
            ) : (
              <>
                <ArrowSmallDownIcon className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-500 ml-1">{mockData.alertsChange} since yesterday</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Recent Movements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockData.recentMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {movement.tagId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        movement.status === 'normal' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.status === 'normal' ? 'Normal' : 'Alert'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-200">
            <a href="/movement" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View all movements →
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Recent Alerts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {mockData.recentAlerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-md ${
                    alert.level === 'high' ? 'bg-red-100' : 
                    alert.level === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <ExclamationCircleIcon className={`h-5 w-5 ${
                      alert.level === 'high' ? 'text-red-600' : 
                      alert.level === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-200">
            <a href="/alerts" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View all alerts →
            </a>
          </div>
        </div>
      </div>
      
      {/* Zone Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Zone Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mockData.zoneActivity.map((zone) => (
              <div key={zone.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{zone.name}</span>
                  <span className="text-sm font-medium text-gray-700">{zone.count} tags</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(zone.count / mockData.tagCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-3 border-t border-gray-200">
          <a href="/zone-management" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Manage zones →
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 