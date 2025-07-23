import { useState, useEffect } from 'react';
import { 
  CubeIcon,
  MapIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export type ZoneType = {
  id: number;
  name: string;
  description: string;
  type: 'warehouse' | 'shipping' | 'receiving' | 'EXIT' | 'Entry' | 'Quality check';
  color: string;
  readers: number[];
  rules: RuleType[];
};

export type RuleType = {
  id: number;
  name: string;
  type: 'entry' | 'exit' | 'duration' | 'count';
  condition: string;
  action: string;
  enabled: boolean;
};

type ZoneCreationFormProps = {
  zone?: ZoneType;
  onSave: (zone: ZoneType) => void;
  onCancel: () => void;
  availableReaders: { id: number; name: string }[];
};

const defaultZone: ZoneType = {
  id: 0,
  name: '',
  description: '',
  type: 'warehouse',
  color: '#3B82F6', // Blue
  readers: [],
  rules: []
};

const ZoneCreationForm = ({ zone, onSave, onCancel, availableReaders }: ZoneCreationFormProps) => {
  const [zoneData, setZoneData] = useState<ZoneType>(zone || defaultZone);
  const [activeTab, setActiveTab] = useState<'details' | 'readers' | 'rules'>('details');
  const [newRule, setNewRule] = useState<Omit<RuleType, 'id'>>({
    name: '',
    type: 'entry',
    condition: '',
    action: '',
    enabled: true
  });
  
  const zoneTypes = [
    { value: 'warehouse', label: 'Warehouse', color: '#3B82F6' }, // Blue
    { value: 'shipping', label: 'Shipping', color: '#10B981' },   // Green
    { value: 'receiving', label: 'Receiving', color: '#F59E0B' }, // Amber
    { value: 'restricted', label: 'Restricted', color: '#EF4444' }, // Red
    { value: 'custom', label: 'Custom', color: '#8B5CF6' }        // Purple
  ];
  
  const handleInputChange = (field: keyof ZoneType, value: any) => {
    setZoneData({
      ...zoneData,
      [field]: value
    });
  };
  
  const handleColorChange = (color: string) => {
    setZoneData({
      ...zoneData,
      color
    });
  };
  
  const handleReaderToggle = (readerId: number) => {
    const readers = [...zoneData.readers];
    const index = readers.indexOf(readerId);
    
    if (index === -1) {
      readers.push(readerId);
    } else {
      readers.splice(index, 1);
    }
    
    setZoneData({
      ...zoneData,
      readers
    });
  };
  
  const handleAddRule = () => {
    if (!newRule.name || !newRule.condition || !newRule.action) return;
    
    const newRuleWithId: RuleType = {
      ...newRule,
      id: zoneData.rules.length > 0 
        ? Math.max(...zoneData.rules.map(r => r.id)) + 1 
        : 1
    };
    
    setZoneData({
      ...zoneData,
      rules: [...zoneData.rules, newRuleWithId]
    });
    
    setNewRule({
      name: '',
      type: 'entry',
      condition: '',
      action: '',
      enabled: true
    });
  };
  
  const handleDeleteRule = (ruleId: number) => {
    setZoneData({
      ...zoneData,
      rules: zoneData.rules.filter(rule => rule.id !== ruleId)
    });
  };
  
  const handleToggleRuleEnabled = (ruleId: number) => {
    setZoneData({
      ...zoneData,
      rules: zoneData.rules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    });
  };
  
  const handleSave = () => {
    // Assign an ID if this is a new zone
    if (zoneData.id === 0) {
      // In a real app, the ID would come from the backend
      const newZone = {
        ...zoneData,
        id: Math.floor(Math.random() * 1000) + 1
      };
      onSave(newZone);
    } else {
      onSave(zoneData);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: `${zoneData.color}20` }}>
            <MapIcon className="h-6 w-6" style={{ color: zoneData.color }} />
          </div>
          <h2 className="text-lg font-medium text-gray-900">
            {zone ? 'Edit Zone' : 'Create New Zone'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Zone Details
          </button>
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'readers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('readers')}
          >
            Assign Readers
          </button>
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('rules')}
          >
            Configure Rules
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="zone-name" className="block text-sm font-medium text-gray-700">
                Zone Name *
              </label>
              <input
                type="text"
                id="zone-name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={zoneData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="zone-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="zone-description"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={zoneData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="zone-type" className="block text-sm font-medium text-gray-700">
                Zone Type
              </label>
              <select
                id="zone-type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={zoneData.type}
                onChange={(e) => {
                  const selectedType = e.target.value as ZoneType['type'];
                  const selectedColor = zoneTypes.find(t => t.value === selectedType)?.color || '#3B82F6';
                  handleInputChange('type', selectedType);
                  handleColorChange(selectedColor);
                }}
              >
                {zoneTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Color
              </label>
              <div className="flex flex-wrap gap-2">
                {zoneTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    className={`w-8 h-8 rounded-full ${zoneData.color === type.color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: type.color }}
                    onClick={() => handleColorChange(type.color)}
                    aria-label={`Select ${type.label} color`}
                  />
                ))}
                <input
                  type="color"
                  value={zoneData.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'readers' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Assign RFID readers to this zone. Assigned readers will track tags within this zone.
            </p>
            
            {availableReaders.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No readers available to assign.</p>
                <p className="text-gray-500 text-sm mt-1">Add readers in the Device Management section first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableReaders.map(reader => (
                  <div
                    key={reader.id}
                    className={`relative rounded-lg border ${
                      zoneData.readers.includes(reader.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    } p-4 shadow-sm focus:outline-none cursor-pointer`}
                    onClick={() => handleReaderToggle(reader.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CubeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{reader.name}</div>
                        <div className="text-sm text-gray-500">ID: {reader.id}</div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <input
                        type="checkbox"
                        checked={zoneData.readers.includes(reader.id)}
                        onChange={() => {}} // Handled by the onClick on the parent div
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Configure rules for this zone. Rules define actions to take when certain conditions are met.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Rule</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rule-name" className="block text-xs font-medium text-gray-700">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    id="rule-name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                    placeholder="e.g. Unauthorized Entry Alert"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="rule-type" className="block text-xs font-medium text-gray-700">
                    Rule Type
                  </label>
                  <select
                    id="rule-type"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as RuleType['type'] })}
                  >
                    <option value="entry">Entry Rule</option>
                    <option value="exit">Exit Rule</option>
                    <option value="duration">Duration Rule</option>
                    <option value="count">Count Rule</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="rule-condition" className="block text-xs font-medium text-gray-700">
                    Condition
                  </label>
                  <input
                    type="text"
                    id="rule-condition"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                    placeholder="e.g. Tag without access rights enters zone"
                    value={newRule.condition}
                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="rule-action" className="block text-xs font-medium text-gray-700">
                    Action
                  </label>
                  <input
                    type="text"
                    id="rule-action"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                    placeholder="e.g. Send alert to security team"
                    value={newRule.action}
                    onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Rule
                </button>
              </div>
            </div>
            
            {zoneData.rules.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No rules configured for this zone.</p>
                <p className="text-gray-500 text-sm mt-1">Add rules using the form above.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rule Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {zoneData.rules.map((rule) => (
                      <tr key={rule.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rule.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rule.condition}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rule.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleToggleRuleEnabled(rule.id)}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                                rule.enabled ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  rule.enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              ></span>
                            </button>
                            <span className="ml-2 text-sm text-gray-500">
                              {rule.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={!zoneData.name}
        >
          Save Zone
        </button>
      </div>
    </div>
  );
};

export default ZoneCreationForm; 