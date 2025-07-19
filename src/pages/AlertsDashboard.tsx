import { useState, useEffect } from 'react';
import { AlertService, AlertType, AlertSeverity, TagService, MOCK_ITEMS } from '../mockServices';
import type { Alert } from '../mockServices';

const AlertsDashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | ''>('');
  const [typeFilter, setTypeFilter] = useState<AlertType | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDismissAnimation, setShowDismissAnimation] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading alerts
    setIsLoading(true);
    setTimeout(() => {
      setAlerts(AlertService.getAllAlerts());
      setIsLoading(false);
    }, 800);
  }, []);

  const handleSeverityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSeverityFilter(e.target.value as AlertSeverity | '');
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value as AlertType | '');
  };

  const handleDismissAlert = (alertId: string) => {
    setShowDismissAnimation(alertId);
    
    setTimeout(() => {
      AlertService.dismissAlert(alertId);
      setAlerts(AlertService.getAllAlerts());
      setShowDismissAnimation(null);
    }, 500);
  };

  const handleDismissAll = () => {
    AlertService.dismissAllAlerts();
    setAlerts([]);
  };

  const handleSimulateAlert = () => {
    // Generate a random alert
    const types = Object.values(AlertType);
    const severities = Object.values(AlertSeverity);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
    const randomTag = `TAG${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    AlertService.triggerAlert(
      randomTag,
      randomType,
      randomSeverity,
      `Simulated ${randomType} alert for ${randomTag}`
    );
    
    setAlerts(AlertService.getAllAlerts());
  };

  // Get item name by tag ID
  const getItemName = (tagId: string): string | null => {
    const item = TagService.getItemByTagId(tagId, MOCK_ITEMS);
    return item ? item.name : null;
  };

  // Filter alerts based on selected filters
  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter && alert.severity !== severityFilter) return false;
    if (typeFilter && alert.type !== typeFilter) return false;
    return true;
  });

  // Get color for severity badge
  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.LOW: return 'bg-blue-100 text-blue-800';
      case AlertSeverity.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case AlertSeverity.HIGH: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get color for alert type badge
  const getAlertTypeColor = (type: AlertType): string => {
    switch (type) {
      case AlertType.UNAUTHORIZED_ACCESS: return 'bg-red-100 text-red-800';
      case AlertType.UNASSIGNED_TAG: return 'bg-yellow-100 text-yellow-800';
      case AlertType.ZONE_VIOLATION: return 'bg-orange-100 text-orange-800';
      case AlertType.MOVEMENT_ANOMALY: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 animate-slide-in-left">Alerts Dashboard</h1>
        <div className="flex gap-2 animate-slide-in-right">
          <button
            onClick={handleSimulateAlert}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 flex items-center hover:shadow-md active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Simulate Alert
          </button>
          <button
            onClick={handleDismissAll}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 flex items-center hover:shadow-md active:scale-95"
            disabled={filteredAlerts.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Dismiss All
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-slide-up">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Active Alerts
          </h2>
        </div>
        
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
              <label htmlFor="severityFilter" className="block text-xs font-medium text-gray-500 mb-1">
                Filter by Severity
              </label>
              <select
                id="severityFilter"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={severityFilter}
                onChange={handleSeverityFilterChange}
              >
                <option value="">All Severities</option>
                {Object.values(AlertSeverity).map(severity => (
                  <option key={severity} value={severity}>
                    {severity}
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
                {Object.values(AlertType).map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 text-lg">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No active alerts</p>
            <p className="text-gray-400 text-sm mt-1">All systems operating normally</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAlerts.map((alert, index) => {
                    const itemName = getItemName(alert.tagId);
                    return (
                      <tr 
                        key={alert.id} 
                        className={`${showDismissAnimation === alert.id ? 'animate-slide-out opacity-0' : 'hover:bg-gray-50'} transition-all duration-300`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{alert.tagId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{itemName || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getAlertTypeColor(alert.type)}`}>
                            {alert.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {alert.message}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDismissAlert(alert.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 hover:scale-110 transform inline-flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Dismiss
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">High Priority</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {alerts.filter(a => a.severity === AlertSeverity.HIGH).length}
            </div>
            <div className="text-sm text-gray-500">
              Require immediate attention
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">Medium Priority</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {alerts.filter(a => a.severity === AlertSeverity.MEDIUM).length}
            </div>
            <div className="text-sm text-gray-500">
              Need attention soon
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">Low Priority</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {alerts.filter(a => a.severity === AlertSeverity.LOW).length}
            </div>
            <div className="text-sm text-gray-500">
              For information only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard; 