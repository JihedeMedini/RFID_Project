import { useState } from 'react';
import { 
  Cog6ToothIcon,
  ServerIcon,
  PrinterIcon,
  BellIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import ApiIntegrationSettings from '../components/ApiIntegrationSettings';
import PrinterConfiguration from '../components/PrinterConfiguration';
import NotificationSettings from '../components/NotificationSettings';

type SettingsTab = 'api' | 'printer' | 'notifications' | 'user' | 'security';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('api');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure system settings and integrations.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('api')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'api'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ServerIcon className="h-5 w-5 mr-2" />
                API Integration
              </div>
            </button>
            <button
              onClick={() => setActiveTab('printer')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'printer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <PrinterIcon className="h-5 w-5 mr-2" />
                Printers
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                Notifications
              </div>
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                User Preferences
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Security
              </div>
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'api' && (
            <ApiIntegrationSettings />
          )}
          
          {activeTab === 'printer' && (
            <PrinterConfiguration />
          )}
          
          {activeTab === 'notifications' && (
            <NotificationSettings />
          )}
          
          {activeTab === 'user' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">User Preferences</h2>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <p>User preferences settings will be implemented in a future update.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <p>Security settings will be implemented in a future update.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Save All Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 