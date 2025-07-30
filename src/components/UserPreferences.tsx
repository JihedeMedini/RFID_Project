import { useState } from 'react';
import { 
  UserIcon,
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  LanguageIcon,
  BellAlertIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'fr' | 'es' | 'de' | 'ar';
type TimeFormat = '12h' | '24h';

type UserPreferencesData = {
  theme: Theme;
  language: Language;
  timeFormat: TimeFormat;
  enableNotifications: boolean;
  emailDigest: boolean;
  dashboardRefreshRate: number; // in seconds
};

type UserPreferencesProps = {
  onSave?: (preferences: UserPreferencesData) => void;
  initialPreferences?: UserPreferencesData;
};

const UserPreferences = ({ onSave, initialPreferences }: UserPreferencesProps) => {
  const [preferences, setPreferences] = useState<UserPreferencesData>(
    initialPreferences || {
      theme: 'light',
      language: 'en',
      timeFormat: '24h',
      enableNotifications: true,
      emailDigest: false,
      dashboardRefreshRate: 30
    }
  );
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleInputChange = (field: keyof UserPreferencesData, value: string | number | boolean) => {
    setPreferences({
      ...preferences,
      [field]: value
    });
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(preferences);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setPreferences(initialPreferences || {
      theme: 'light',
      language: 'en',
      timeFormat: '24h',
      enableNotifications: true,
      emailDigest: false,
      dashboardRefreshRate: 30
    });
    setIsEditing(false);
  };
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ar', name: 'العربية' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">User Preferences</h2>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit Preferences
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
              Save Preferences
            </button>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {/* Theme Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <SunIcon className="h-5 w-5 text-gray-400 mr-2" />
                Theme
              </div>
            </label>
            <div className="flex space-x-4">
              {['light', 'dark', 'system'].map((theme) => (
                <label key={theme} className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={preferences.theme === theme}
                    onChange={() => handleInputChange('theme', theme as Theme)}
                    disabled={!isEditing}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Language Preference */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <LanguageIcon className="h-5 w-5 text-gray-400 mr-2" />
                Language
              </div>
            </label>
            <select
              id="language"
              value={preferences.language}
              onChange={(e) => handleInputChange('language', e.target.value as Language)}
              disabled={!isEditing}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Time Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                Time Format
              </div>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="timeFormat"
                  value="12h"
                  checked={preferences.timeFormat === '12h'}
                  onChange={() => handleInputChange('timeFormat', '12h')}
                  disabled={!isEditing}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">12-hour (1:30 PM)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="timeFormat"
                  value="24h"
                  checked={preferences.timeFormat === '24h'}
                  onChange={() => handleInputChange('timeFormat', '24h')}
                  disabled={!isEditing}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">24-hour (13:30)</span>
              </label>
            </div>
          </div>
          
          {/* Dashboard Refresh Rate */}
          <div>
            <label htmlFor="refresh-rate" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Cog6ToothIcon className="h-5 w-5 text-gray-400 mr-2" />
                Dashboard Refresh Rate (seconds)
              </div>
            </label>
            <input
              type="range"
              id="refresh-rate"
              min="5"
              max="120"
              step="5"
              value={preferences.dashboardRefreshRate}
              onChange={(e) => handleInputChange('dashboardRefreshRate', parseInt(e.target.value))}
              disabled={!isEditing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5s</span>
              <span>{preferences.dashboardRefreshRate}s</span>
              <span>120s</span>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Notification Preferences</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="enable-notifications"
                  name="enable-notifications"
                  type="checkbox"
                  checked={preferences.enableNotifications}
                  onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enable-notifications" className="ml-2 block text-sm text-gray-700 flex items-center">
                  <BellAlertIcon className="h-5 w-5 text-gray-400 mr-1" />
                  Enable in-app notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="email-digest"
                  name="email-digest"
                  type="checkbox"
                  checked={preferences.emailDigest}
                  onChange={(e) => handleInputChange('emailDigest', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="email-digest" className="ml-2 block text-sm text-gray-700">
                  Receive daily email digest
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences; 