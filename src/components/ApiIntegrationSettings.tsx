import { useState } from 'react';
import { 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon,
  ServerIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

type ApiCredentials = {
  baseUrl: string;
  apiKey: string;
  username: string;
  password: string;
  timeout: number;
  useSSL: boolean;
};

type ApiIntegrationSettingsProps = {
  onSave?: (credentials: ApiCredentials) => void;
  initialCredentials?: ApiCredentials;
};

const ApiIntegrationSettings = ({ onSave, initialCredentials }: ApiIntegrationSettingsProps) => {
  const [credentials, setCredentials] = useState<ApiCredentials>(
    initialCredentials || {
      baseUrl: 'https://oracle-rest.example.com/api/v1',
      apiKey: '',
      username: '',
      password: '',
      timeout: 30,
      useSSL: true
    }
  );
  
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleInputChange = (field: keyof ApiCredentials, value: string | number | boolean) => {
    setCredentials({
      ...credentials,
      [field]: value
    });
  };
  
  const handleTestConnection = () => {
    setTestStatus('testing');
    
    // Simulate API connection test
    setTimeout(() => {
      // For demo purposes, consider the test successful if all required fields are filled
      const isValid = 
        credentials.baseUrl.trim() !== '' && 
        credentials.apiKey.trim() !== '' && 
        credentials.username.trim() !== '' && 
        credentials.password.trim() !== '';
      
      setTestStatus(isValid ? 'success' : 'error');
    }, 1500);
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(credentials);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setCredentials(initialCredentials || {
      baseUrl: 'https://oracle-rest.example.com/api/v1',
      apiKey: '',
      username: '',
      password: '',
      timeout: 30,
      useSSL: true
    });
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <ServerIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Oracle REST API Integration</h2>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit Settings
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="base-url" className="block text-sm font-medium text-gray-700 mb-1">
              API Base URL
            </label>
            <input
              type="text"
              id="base-url"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={credentials.baseUrl}
              onChange={(e) => handleInputChange('baseUrl', e.target.value)}
              disabled={!isEditing}
              placeholder="https://oracle-rest.example.com/api/v1"
            />
          </div>
          
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="text"
              id="api-key"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={credentials.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your API key"
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={credentials.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter password"
              />
              {isEditing && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <KeyIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">
              Request Timeout (seconds)
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="timeout"
                min="5"
                max="120"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={credentials.timeout}
                onChange={(e) => handleInputChange('timeout', parseInt(e.target.value) || 30)}
                disabled={!isEditing}
              />
              <ClockIcon className="h-5 w-5 text-gray-400 ml-2" />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="use-ssl"
              name="use-ssl"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={credentials.useSSL}
              onChange={(e) => handleInputChange('useSSL', e.target.checked)}
              disabled={!isEditing}
            />
            <label htmlFor="use-ssl" className="ml-2 block text-sm text-gray-700 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-1" />
              Use SSL/TLS Encryption
            </label>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {testStatus === 'testing' ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </button>
          </div>
        )}
        
        {testStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-700">
                Connection successful! API integration is working correctly.
              </p>
            </div>
          </div>
        )}
        
        {testStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-700">
                  Connection failed. Please check your credentials and try again.
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Make sure all required fields are filled and the API endpoint is accessible.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiIntegrationSettings; 