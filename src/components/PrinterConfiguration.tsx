import { useState } from 'react';
import { 
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon,
  WifiIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

type PrinterType = 'network' | 'usb' | 'bluetooth';

type PrinterConfig = {
  id: string;
  name: string;
  type: PrinterType;
  address: string;
  port?: number;
  model: string;
  default: boolean;
  status: 'online' | 'offline' | 'error';
  lastConnected?: string;
};

type PrinterConfigurationProps = {
  onSave?: (printers: PrinterConfig[]) => void;
  initialPrinters?: PrinterConfig[];
};

const PrinterConfiguration = ({ onSave, initialPrinters }: PrinterConfigurationProps) => {
  // Mock printer data
  const defaultPrinters: PrinterConfig[] = [
    {
      id: '1',
      name: 'Warehouse Printer 1',
      type: 'network',
      address: '192.168.1.100',
      port: 9100,
      model: 'Zebra ZT411',
      default: true,
      status: 'online',
      lastConnected: '2023-05-15 14:32:45'
    },
    {
      id: '2',
      name: 'Shipping Desk Printer',
      type: 'usb',
      address: 'USB001',
      model: 'Zebra ZD620',
      default: false,
      status: 'online',
      lastConnected: '2023-05-15 13:45:22'
    },
    {
      id: '3',
      name: 'Mobile Printer',
      type: 'bluetooth',
      address: '00:11:22:33:44:55',
      model: 'Zebra QLn420',
      default: false,
      status: 'offline',
      lastConnected: '2023-05-14 09:15:22'
    }
  ];
  
  const [printers, setPrinters] = useState<PrinterConfig[]>(initialPrinters || defaultPrinters);
  const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null);
  const [isAddingPrinter, setIsAddingPrinter] = useState(false);
  const [testingPrinterId, setTestingPrinterId] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'success' | 'error' | null>(null);
  
  const handleAddPrinter = () => {
    const newPrinter: PrinterConfig = {
      id: `new-${Date.now()}`,
      name: '',
      type: 'network',
      address: '',
      port: 9100,
      model: '',
      default: false,
      status: 'offline'
    };
    
    setEditingPrinter(newPrinter);
    setIsAddingPrinter(true);
  };
  
  const handleEditPrinter = (printer: PrinterConfig) => {
    setEditingPrinter({ ...printer });
    setIsAddingPrinter(false);
  };
  
  const handleDeletePrinter = (printerId: string) => {
    setPrinters(printers.filter(p => p.id !== printerId));
  };
  
  const handleSetDefaultPrinter = (printerId: string) => {
    setPrinters(printers.map(p => ({
      ...p,
      default: p.id === printerId
    })));
  };
  
  const handleSavePrinter = () => {
    if (!editingPrinter) return;
    
    if (isAddingPrinter) {
      setPrinters([...printers, editingPrinter]);
    } else {
      setPrinters(printers.map(p => p.id === editingPrinter.id ? editingPrinter : p));
    }
    
    setEditingPrinter(null);
    setIsAddingPrinter(false);
  };
  
  const handleCancelEdit = () => {
    setEditingPrinter(null);
    setIsAddingPrinter(false);
  };
  
  const handleInputChange = (field: keyof PrinterConfig, value: string | number | boolean) => {
    if (!editingPrinter) return;
    
    setEditingPrinter({
      ...editingPrinter,
      [field]: value
    });
  };
  
  const handleTestPrinter = (printerId: string) => {
    setTestingPrinterId(printerId);
    setTestStatus(null);
    
    // Simulate printer test
    setTimeout(() => {
      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.3;
      setTestStatus(success ? 'success' : 'error');
      
      // Update printer status based on test result
      setPrinters(printers.map(p => p.id === printerId ? {
        ...p,
        status: success ? 'online' : 'error',
        lastConnected: success ? new Date().toLocaleString() : p.lastConnected
      } : p));
      
      setTimeout(() => {
        setTestingPrinterId(null);
        setTestStatus(null);
      }, 3000);
    }, 1500);
  };
  
  const getPrinterTypeIcon = (type: PrinterType) => {
    switch (type) {
      case 'network':
        return <WifiIcon className="h-5 w-5 text-blue-500" />;
      case 'usb':
        return <ComputerDesktopIcon className="h-5 w-5 text-green-500" />;
      case 'bluetooth':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>;
      default:
        return <PrinterIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <PrinterIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Printer Configuration</h2>
        </div>
        <button
          onClick={handleAddPrinter}
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Printer
        </button>
      </div>
      
      {/* Printer List */}
      <div className="overflow-hidden">
        {printers.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <PrinterIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No printers configured</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a printer to start printing RFID tags.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Printer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {printers.map((printer) => (
                <tr key={printer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <PrinterIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{printer.name}</div>
                        <div className="text-xs text-gray-500">{printer.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPrinterTypeIcon(printer.type)}
                      <span className="ml-1 text-sm text-gray-900 capitalize">{printer.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {printer.address}
                    {printer.port && <span>:{printer.port}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(printer.status)}`}>
                      {printer.status.charAt(0).toUpperCase() + printer.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="radio"
                      name="default-printer"
                      checked={printer.default}
                      onChange={() => handleSetDefaultPrinter(printer.id)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleTestPrinter(printer.id)}
                        disabled={testingPrinterId === printer.id}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {testingPrinterId === printer.id ? (
                          <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        ) : (
                          <ArrowPathIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditPrinter(printer)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePrinter(printer.id)}
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
                ? 'Test print successful! Printer is online and working correctly.' 
                : 'Test print failed. Please check printer connection and try again.'}
            </p>
          </div>
        </div>
      )}
      
      {/* Edit/Add Printer Modal */}
      {editingPrinter && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isAddingPrinter ? 'Add Printer' : 'Edit Printer'}
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
                  <label htmlFor="printer-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Printer Name
                  </label>
                  <input
                    type="text"
                    id="printer-name"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={editingPrinter.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter printer name"
                  />
                </div>
                
                <div>
                  <label htmlFor="printer-model" className="block text-sm font-medium text-gray-700 mb-1">
                    Printer Model
                  </label>
                  <input
                    type="text"
                    id="printer-model"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={editingPrinter.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Enter printer model"
                  />
                </div>
                
                <div>
                  <label htmlFor="printer-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Connection Type
                  </label>
                  <select
                    id="printer-type"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={editingPrinter.type}
                    onChange={(e) => handleInputChange('type', e.target.value as PrinterType)}
                  >
                    <option value="network">Network (TCP/IP)</option>
                    <option value="usb">USB</option>
                    <option value="bluetooth">Bluetooth</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="printer-address" className="block text-sm font-medium text-gray-700 mb-1">
                    {editingPrinter.type === 'network' ? 'IP Address' : 
                     editingPrinter.type === 'bluetooth' ? 'MAC Address' : 'Device Path'}
                  </label>
                  <input
                    type="text"
                    id="printer-address"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={editingPrinter.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder={editingPrinter.type === 'network' ? '192.168.1.100' : 
                                editingPrinter.type === 'bluetooth' ? '00:11:22:33:44:55' : 'USB001'}
                  />
                </div>
                
                {editingPrinter.type === 'network' && (
                  <div>
                    <label htmlFor="printer-port" className="block text-sm font-medium text-gray-700 mb-1">
                      Port
                    </label>
                    <input
                      type="number"
                      id="printer-port"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={editingPrinter.port || 9100}
                      onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 9100)}
                      placeholder="9100"
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    id="default-printer"
                    name="default-printer"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={editingPrinter.default}
                    onChange={(e) => handleInputChange('default', e.target.checked)}
                  />
                  <label htmlFor="default-printer" className="ml-2 block text-sm text-gray-700">
                    Set as default printer
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
                onClick={handleSavePrinter}
                disabled={!editingPrinter.name || !editingPrinter.address}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  !editingPrinter.name || !editingPrinter.address ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isAddingPrinter ? 'Add Printer' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterConfiguration; 