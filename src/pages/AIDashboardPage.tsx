import { useState } from 'react';
import { 
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

import AnalyticsChart from '../components/AnalyticsChart';
import AIAssistant from '../components/AIAssistant';
import AnomalyDetection from '../components/AnomalyDetection';

const AIDashboardPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Mock data for charts
  const movementTrendsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tag Movements',
        data: [65, 78, 52, 91, 83, 56, 74],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  const zoneActivityData = {
    labels: ['Warehouse A', 'Warehouse B', 'Shipping', 'Receiving', 'Restricted'],
    datasets: [
      {
        label: 'Tag Count',
        data: [423, 385, 214, 156, 76],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const anomalyTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Anomalies Detected',
        data: [12, 19, 15, 8, 22],
        backgroundColor: 'rgba(239, 68, 68, 0.7)'
      }
    ]
  };
  
  const tagDwellTimeData = {
    labels: ['0-1h', '1-4h', '4-8h', '8-24h', '24h+'],
    datasets: [
      {
        label: 'Number of Tags',
        data: [45, 92, 63, 28, 14],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)'
        ]
      }
    ]
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI Dashboard & Analytics</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              className="text-sm border-gray-300 rounded-md"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="text-sm border-gray-300 rounded-md"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <LightBulbIcon className="h-4 w-4 mr-2" />
            AI Assistant
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Key Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800">Total Tags</div>
              <div className="text-2xl font-bold text-blue-900">1,254</div>
              <div className="text-xs text-blue-700 mt-1">+24 since yesterday</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800">Active Readers</div>
              <div className="text-2xl font-bold text-green-900">12/15</div>
              <div className="text-xs text-green-700 mt-1">80% operational</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-sm font-medium text-amber-800">Avg. Read Rate</div>
              <div className="text-2xl font-bold text-amber-900">98/sec</div>
              <div className="text-xs text-amber-700 mt-1">+5% from last week</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm font-medium text-red-800">Anomalies (24h)</div>
              <div className="text-2xl font-bold text-red-900">7</div>
              <div className="text-xs text-red-700 mt-1">3 unresolved</div>
            </div>
          </div>
        </div>
        
        {/* Movement Trends */}
        <div className="lg:col-span-2">
          <AnalyticsChart 
            type="line"
            data={movementTrendsData}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: 'Tag Movement Trends (Last 7 Days)'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Movements'
                  }
                }
              }
            }}
            height={300}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Zone Activity */}
        <div>
          <AnalyticsChart 
            type="bar"
            data={zoneActivityData}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: 'Current Zone Activity'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Tags'
                  }
                }
              }
            }}
            height={300}
          />
        </div>
        
        {/* Tag Dwell Time */}
        <div>
          <AnalyticsChart 
            type="doughnut"
            data={tagDwellTimeData}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: 'Tag Dwell Time Distribution'
                }
              }
            }}
            height={300}
          />
        </div>
      </div>
      
      {/* Anomaly Detection */}
      <div className="mb-6">
        <AnomalyDetection onRefresh={handleRefresh} />
      </div>
      
      {/* Anomaly Trends */}
      <div className="mb-6">
        <AnalyticsChart 
          type="bar"
          data={anomalyTrendsData}
          options={{
            plugins: {
              title: {
                display: true,
                text: 'Anomaly Detection Trends (Last 5 Months)'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Anomalies'
                }
              }
            }
          }}
          height={250}
        />
      </div>
      
      {/* AI Assistant Dialog */}
      {showAIAssistant && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] z-50">
          <AIAssistant onClose={() => setShowAIAssistant(false)} />
        </div>
      )}
    </div>
  );
};

export default AIDashboardPage; 