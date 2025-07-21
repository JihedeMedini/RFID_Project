import { useState } from 'react';
import { 
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

type NotificationType = 'email' | 'sms';

type NotificationEvent = 'unauthorized_movement' | 'device_offline' | 'zone_capacity_exceeded' | 'new_tag_detected' | 'tag_not_found';

type NotificationContact = {
  id: string;
  name: string;
  type: NotificationType;
  value: string; // email address or phone number
  events: NotificationEvent[];
  active: boolean;
};

type NotificationSettingsProps = {
  onSave?: (contacts: NotificationContact[]) => void;
  initialContacts?: NotificationContact[];
};

const NotificationSettings = ({ onSave, initialContacts }: NotificationSettingsProps) => {
  // Mock notification contacts
  const defaultContacts: NotificationContact[] = [
    {
      id: '1',
      name: 'Warehouse Manager',
      type: 'email',
      value: 'manager@example.com',
      events: ['unauthorized_movement', 'device_offline', 'zone_capacity_exceeded'],
      active: true
    },
    {
      id: '2',
      name: 'Security Team',
      type: 'email',
      value: 'security@example.com',
      events: ['unauthorized_movement'],
      active: true
    },
    {
      id: '3',
      name: 'On-call Support',
      type: 'sms',
      value: '+1234567890',
      events: ['device_offline'],
      active: true
    }
  ];
  
  const [contacts, setContacts] = useState<NotificationContact[]>(initialContacts || defaultContacts);
  const [editingContact, setEditingContact] = useState<NotificationContact | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [testStatus, setTestStatus] = useState<'success' | 'error' | null>(null);
  const [testingContactId, setTestingContactId] = useState<string | null>(null);
  
  const eventLabels: Record<NotificationEvent, string> = {
    unauthorized_movement: 'Unauthorized Movement',
    device_offline: 'Device Offline',
    zone_capacity_exceeded: 'Zone Capacity Exceeded',
    new_tag_detected: 'New Tag Detected',
    tag_not_found: 'Tag Not Found'
  };
  
  const handleAddContact = () => {
    const newContact: NotificationContact = {
      id: `new-${Date.now()}`,
      name: '',
      type: 'email',
      value: '',
      events: [],
      active: true
    };
    
    setEditingContact(newContact);
    setIsAddingContact(true);
  };
  
  const handleEditContact = (contact: NotificationContact) => {
    setEditingContact({ ...contact });
    setIsAddingContact(false);
  };
  
  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter(c => c.id !== contactId));
  };
  
  const handleToggleActive = (contactId: string) => {
    setContacts(contacts.map(c => 
      c.id === contactId ? { ...c, active: !c.active } : c
    ));
  };
  
  const handleSaveContact = () => {
    if (!editingContact) return;
    
    if (isAddingContact) {
      setContacts([...contacts, editingContact]);
    } else {
      setContacts(contacts.map(c => c.id === editingContact.id ? editingContact : c));
    }
    
    setEditingContact(null);
    setIsAddingContact(false);
  };
  
  const handleCancelEdit = () => {
    setEditingContact(null);
    setIsAddingContact(false);
  };
  
  const handleInputChange = (field: keyof NotificationContact, value: string | boolean | NotificationEvent[]) => {
    if (!editingContact) return;
    
    setEditingContact({
      ...editingContact,
      [field]: value
    });
  };
  
  const handleToggleEvent = (event: NotificationEvent) => {
    if (!editingContact) return;
    
    const events = editingContact.events.includes(event)
      ? editingContact.events.filter(e => e !== event)
      : [...editingContact.events, event];
    
    handleInputChange('events', events);
  };
  
  const handleTestNotification = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    setTestingContactId(contactId);
    setTestStatus(null);
    
    // Simulate sending a test notification
    setTimeout(() => {
      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.2;
      setTestStatus(success ? 'success' : 'error');
      
      setTimeout(() => {
        setTestingContactId(null);
        setTestStatus(null);
      }, 3000);
    }, 1500);
  };
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const validatePhone = (phone: string) => {
    return /^\+?[0-9]{10,15}$/.test(phone);
  };
  
  const isContactValid = (contact: NotificationContact) => {
    if (!contact.name || !contact.value || contact.events.length === 0) return false;
    
    if (contact.type === 'email') {
      return validateEmail(contact.value);
    } else {
      return validatePhone(contact.value);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <BellIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
        </div>
        <button
          onClick={handleAddContact}
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Contact
        </button>
      </div>
      
      {/* Contact List */}
      <div className="overflow-hidden">
        {contacts.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notification contacts configured</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add contacts to receive alerts when important events occur.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Events
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
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {contact.type === 'email' ? (
                          <EnvelopeIcon className="h-6 w-6 text-gray-600" />
                        ) : (
                          <DevicePhoneMobileIcon className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        <div className="text-xs text-gray-500">{contact.value}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {contact.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {contact.events.map((event) => (
                        <span key={event} className="px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-800">
                          {eventLabels[event]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleActive(contact.id)}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                          contact.active ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            contact.active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-sm text-gray-500">
                        {contact.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleTestNotification(contact.id)}
                        disabled={testingContactId === contact.id || !contact.active}
                        className={`text-blue-600 hover:text-blue-900 ${!contact.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {testingContactId === contact.id ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <BellIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Test Status Messages */}
      {testStatus && (
        <div className={`m-4 p-4 ${testStatus === 'success' ? 'bg-green-50' : 'bg-red-50'} rounded-md`}>
          <div className="flex">
            {testStatus === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            )}
            <p className={`text-sm ${testStatus === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {testStatus === 'success' 
                ? 'Test notification sent successfully!' 
                : 'Failed to send test notification. Please check the contact information and try again.'}
            </p>
          </div>
        </div>
      )}
      
      {/* Edit/Add Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isAddingContact ? 'Add Notification Contact' : 'Edit Notification Contact'}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={editingContact.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter contact name"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Type
                  </label>
                  <select
                    id="contact-type"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={editingContact.type}
                    onChange={(e) => handleInputChange('type', e.target.value as NotificationType)}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="contact-value" className="block text-sm font-medium text-gray-700 mb-1">
                    {editingContact.type === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <input
                    type={editingContact.type === 'email' ? 'email' : 'text'}
                    id="contact-value"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={editingContact.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    placeholder={editingContact.type === 'email' ? 'email@example.com' : '+1234567890'}
                  />
                  {editingContact.value && (
                    editingContact.type === 'email' && !validateEmail(editingContact.value) ? (
                      <p className="mt-1 text-xs text-red-600">Please enter a valid email address.</p>
                    ) : (
                      editingContact.type === 'sms' && !validatePhone(editingContact.value) && (
                        <p className="mt-1 text-xs text-red-600">Please enter a valid phone number (10-15 digits, can start with +).</p>
                      )
                    )
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Events
                  </label>
                  <div className="space-y-2">
                    {Object.entries(eventLabels).map(([event, label]) => (
                      <div key={event} className="flex items-center">
                        <input
                          id={`event-${event}`}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={editingContact.events.includes(event as NotificationEvent)}
                          onChange={() => handleToggleEvent(event as NotificationEvent)}
                        />
                        <label htmlFor={`event-${event}`} className="ml-2 block text-sm text-gray-700">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {editingContact.events.length === 0 && (
                    <p className="mt-1 text-xs text-red-600">Please select at least one event.</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="contact-active"
                    name="contact-active"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={editingContact.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                  />
                  <label htmlFor="contact-active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContact}
                disabled={!isContactValid(editingContact)}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  !isContactValid(editingContact) ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isAddingContact ? 'Add Contact' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings; 