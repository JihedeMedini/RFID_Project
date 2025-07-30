import { useState } from 'react';
import { 
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  FingerPrintIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

type SecuritySettingsData = {
  requireMFA: boolean;
  passwordExpiration: number; // days
  sessionTimeout: number; // minutes
  allowedIPs: string[];
  apiAccessRestricted: boolean;
  biometricLogin: boolean;
  auditLoggingEnabled: boolean;
};

type SecuritySettingsProps = {
  onSave?: (settings: SecuritySettingsData) => void;
  initialSettings?: SecuritySettingsData;
};

const SecuritySettings = ({ onSave, initialSettings }: SecuritySettingsProps) => {
  const [settings, setSettings] = useState<SecuritySettingsData>(
    initialSettings || {
      requireMFA: true,
      passwordExpiration: 90,
      sessionTimeout: 30,
      allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
      apiAccessRestricted: true,
      biometricLogin: false,
      auditLoggingEnabled: true
    }
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [ipError, setIpError] = useState('');
  
  const handleInputChange = (field: keyof SecuritySettingsData, value: boolean | number | string[]) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setSettings(initialSettings || {
      requireMFA: true,
      passwordExpiration: 90,
      sessionTimeout: 30,
      allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
      apiAccessRestricted: true,
      biometricLogin: false,
      auditLoggingEnabled: true
    });
    setIsEditing(false);
  };
  
  const validateIP = (ip: string): boolean => {
    // Simple validation for IP address or CIDR notation
    const ipRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
    return ipRegex.test(ip);
  };
  
  const handleAddIP = () => {
    if (!newIP) {
      setIpError('IP address cannot be empty');
      return;
    }
    
    if (!validateIP(newIP)) {
      setIpError('Invalid IP address or CIDR notation');
      return;
    }
    
    if (settings.allowedIPs.includes(newIP)) {
      setIpError('IP address already exists');
      return;
    }
    
    handleInputChange('allowedIPs', [...settings.allowedIPs, newIP]);
    setNewIP('');
    setIpError('');
  };
  
  const handleRemoveIP = (ip: string) => {
    handleInputChange('allowedIPs', settings.allowedIPs.filter(item => item !== ip));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
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
        <div className="space-y-6">
          {/* Authentication Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
              Authentication Settings
            </h3>
            
            <div className="space-y-3 ml-7">
              <div className="flex items-center">
                <input
                  id="require-mfa"
                  name="require-mfa"
                  type="checkbox"
                  checked={settings.requireMFA}
                  onChange={(e) => handleInputChange('requireMFA', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="require-mfa" className="ml-2 block text-sm text-gray-700">
                  Require multi-factor authentication (MFA)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="biometric-login"
                  name="biometric-login"
                  type="checkbox"
                  checked={settings.biometricLogin}
                  onChange={(e) => handleInputChange('biometricLogin', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="biometric-login" className="ml-2 block text-sm text-gray-700 flex items-center">
                  <FingerPrintIcon className="h-4 w-4 text-gray-400 mr-1" />
                  Enable biometric login
                </label>
              </div>
              
              <div className="mt-3">
                <label htmlFor="password-expiration" className="block text-sm text-gray-700 mb-1">
                  Password expiration (days)
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="password-expiration"
                    min="0"
                    max="365"
                    value={settings.passwordExpiration}
                    onChange={(e) => handleInputChange('passwordExpiration', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-32 sm:text-sm border-gray-300 rounded-md"
                  />
                  <span className="ml-2 text-sm text-gray-500">
                    {settings.passwordExpiration === 0 ? 'Never expires' : `${settings.passwordExpiration} days`}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Session Settings */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
              Session Settings
            </h3>
            
            <div className="ml-7">
              <label htmlFor="session-timeout" className="block text-sm text-gray-700 mb-1">
                Session timeout (minutes)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="session-timeout"
                  min="1"
                  max="1440"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value) || 30)}
                  disabled={!isEditing}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-32 sm:text-sm border-gray-300 rounded-md"
                />
                <span className="ml-2 text-sm text-gray-500">
                  {settings.sessionTimeout} minutes
                </span>
              </div>
            </div>
          </div>
          
          {/* Access Control */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
              Access Control
            </h3>
            
            <div className="space-y-3 ml-7">
              <div className="flex items-center">
                <input
                  id="api-access"
                  name="api-access"
                  type="checkbox"
                  checked={settings.apiAccessRestricted}
                  onChange={(e) => handleInputChange('apiAccessRestricted', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="api-access" className="ml-2 block text-sm text-gray-700">
                  Restrict API access to allowed IPs only
                </label>
              </div>
              
              <div className="mt-3">
                <label className="block text-sm text-gray-700 mb-2">
                  Allowed IP Addresses
                </label>
                
                <div className="space-y-2 mb-4">
                  {settings.allowedIPs.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No IP addresses added</p>
                  ) : (
                    settings.allowedIPs.map((ip) => (
                      <div key={ip} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <span className="text-sm font-mono">{ip}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIP(ip)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                {isEditing && (
                  <div className="mt-2">
                    <div className="flex">
                      <input
                        type="text"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                        placeholder="192.168.1.0/24"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddIP}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Add IP
                      </button>
                    </div>
                    {ipError && <p className="mt-1 text-xs text-red-600">{ipError}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Enter IP address (e.g., 192.168.1.1) or CIDR notation (e.g., 192.168.1.0/24)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Audit Logging */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
              Audit & Compliance
            </h3>
            
            <div className="space-y-3 ml-7">
              <div className="flex items-center">
                <input
                  id="audit-logging"
                  name="audit-logging"
                  type="checkbox"
                  checked={settings.auditLoggingEnabled}
                  onChange={(e) => handleInputChange('auditLoggingEnabled', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="audit-logging" className="ml-2 block text-sm text-gray-700">
                  Enable comprehensive audit logging
                </label>
              </div>
              
              {settings.auditLoggingEnabled && (
                <div className="bg-blue-50 p-3 rounded-md mt-2">
                  <p className="text-xs text-blue-700">
                    Audit logging is capturing all user actions, system events, and security incidents.
                    Logs are retained for 90 days in compliance with security policies.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings; 