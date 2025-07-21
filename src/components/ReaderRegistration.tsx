import { useState } from 'react';
import { 
  CubeIcon,
  PlusIcon, 
  XMarkIcon,
  WifiIcon,
  QrCodeIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

type ReaderModel = {
  id: string;
  name: string;
  manufacturer: string;
  antennaCount: number;
  protocols: string[];
  image: string;
};

type ReaderRegistrationProps = {
  onRegisterReader: (readerData: any) => void;
  onCancel: () => void;
};

const ReaderRegistration = ({ onRegisterReader, onCancel }: ReaderRegistrationProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [discoveredReaders, setDiscoveredReaders] = useState<any[]>([]);
  const [selectedReader, setSelectedReader] = useState<any | null>(null);
  const [readerName, setReaderName] = useState('');
  const [readerLocation, setReaderLocation] = useState('');
  const [readerGroup, setReaderGroup] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  // Mock reader models
  const readerModels: ReaderModel[] = [
    {
      id: 'model1',
      name: 'RFID-X1000',
      manufacturer: 'TechRFID',
      antennaCount: 4,
      protocols: ['EPC Gen2', 'ISO 18000-6C'],
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'model2',
      name: 'SmartTrack Pro',
      manufacturer: 'RFIDWare',
      antennaCount: 2,
      protocols: ['EPC Gen2', 'ISO 18000-6C', 'ISO 18000-6B'],
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'model3',
      name: 'TrackMaster 8',
      manufacturer: 'LogiScan',
      antennaCount: 8,
      protocols: ['EPC Gen2', 'ISO 18000-6C', 'RAIN RFID'],
      image: 'https://via.placeholder.com/100'
    }
  ];
  
  const handleScan = () => {
    setIsScanning(true);
    
    // Mock discovery process
    setTimeout(() => {
      setDiscoveredReaders([
        { id: 'abc123', name: 'Unknown Reader', ipAddress: '192.168.1.120', status: 'available' },
        { id: 'def456', name: 'Unknown Reader', ipAddress: '192.168.1.121', status: 'available' }
      ]);
      setIsScanning(false);
    }, 2000);
  };
  
  const handleSelectReader = (reader: any) => {
    setSelectedReader(reader);
  };
  
  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedReader && !manualMode) {
        alert('Please select a reader or use manual configuration');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedModel) {
        alert('Please select a reader model');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!readerName) {
        alert('Please enter a reader name');
        return;
      }
      
      // Prepare reader data
      const readerData = {
        id: selectedReader ? selectedReader.id : `manual-${Date.now()}`,
        name: readerName,
        location: readerLocation,
        group: readerGroup,
        ipAddress: selectedReader ? selectedReader.ipAddress : ipAddress,
        port: port || '5084',
        model: readerModels.find(model => model.id === selectedModel),
        status: 'offline',
        antennas: Array(readerModels.find(model => model.id === selectedModel)?.antennaCount || 0)
          .fill(0)
          .map((_, index) => ({
            id: index + 1,
            name: `Antenna ${index + 1}`,
            status: 'inactive',
            power: 25,
            gain: 6.0,
            polarization: 'Linear',
            coverage: ''
          }))
      };
      
      onRegisterReader(readerData);
    }
  };
  
  const handlePreviousStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <WifiIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Auto-Discovery</h3>
            <p className="text-sm text-blue-700 mt-1">
              Scan your local network to find RFID readers automatically.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleScan}
          disabled={isScanning}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isScanning ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <WifiIcon className="h-4 w-4 mr-2" />
              Scan for Readers
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
          {manualMode ? 'Hide Manual Config' : 'Manual Configuration'}
        </button>
      </div>
      
      {discoveredReaders.length > 0 && !manualMode && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Discovered Readers</h3>
          <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {discoveredReaders.map((reader) => (
                <li key={reader.id}>
                  <div 
                    className={`block hover:bg-gray-50 cursor-pointer ${selectedReader === reader ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSelectReader(reader)}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CubeIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reader.name}</div>
                            <div className="text-sm text-gray-500">ID: {reader.id}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div>{reader.ipAddress}</div>
                          <div className="mt-1">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {reader.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {manualMode && (
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Manual Configuration</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="ip-address" className="block text-sm font-medium text-gray-700">
                IP Address
              </label>
              <input
                type="text"
                id="ip-address"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g. 192.168.1.100"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                Port (Optional)
              </label>
              <input
                type="text"
                id="port"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g. 5084"
                value={port}
                onChange={(e) => setPort(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <CubeIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Select Reader Model</h3>
            <p className="text-sm text-blue-700 mt-1">
              Choose the model of your RFID reader for proper configuration.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {readerModels.map((model) => (
          <div 
            key={model.id}
            className={`relative rounded-lg border ${selectedModel === model.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'} bg-white p-4 shadow-sm focus:outline-none cursor-pointer`}
            onClick={() => setSelectedModel(model.id)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 overflow-hidden rounded-md border border-gray-200">
                <img src={model.image} alt={model.name} className="h-full w-full object-cover" />
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-900">{model.name}</div>
                <div className="text-sm text-gray-500">{model.manufacturer}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <div className="mt-1">Antennas: {model.antennaCount}</div>
              <div className="mt-1">Protocols: {model.protocols.join(', ')}</div>
            </div>
            {selectedModel === model.id && (
              <div className="absolute top-2 right-2 h-5 w-5 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <QrCodeIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Reader Details</h3>
            <p className="text-sm text-blue-700 mt-1">
              Provide additional information about this RFID reader.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 border border-gray-200 rounded-md">
        <div className="space-y-4">
          <div>
            <label htmlFor="reader-name" className="block text-sm font-medium text-gray-700">
              Reader Name *
            </label>
            <input
              type="text"
              id="reader-name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Warehouse-Reader-01"
              value={readerName}
              onChange={(e) => setReaderName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="reader-location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="reader-location"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Warehouse Zone A"
              value={readerLocation}
              onChange={(e) => setReaderLocation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="reader-group" className="block text-sm font-medium text-gray-700">
              Reader Group
            </label>
            <select
              id="reader-group"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={readerGroup}
              onChange={(e) => setReaderGroup(e.target.value)}
            >
              <option value="">None</option>
              <option value="warehouse">Warehouse</option>
              <option value="shipping">Shipping</option>
              <option value="receiving">Receiving</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
        <div className="text-sm text-gray-500 space-y-1">
          <div><span className="font-medium">Model:</span> {readerModels.find(model => model.id === selectedModel)?.name}</div>
          <div><span className="font-medium">Manufacturer:</span> {readerModels.find(model => model.id === selectedModel)?.manufacturer}</div>
          <div><span className="font-medium">IP Address:</span> {selectedReader ? selectedReader.ipAddress : ipAddress}</div>
          {port && <div><span className="font-medium">Port:</span> {port}</div>}
          <div><span className="font-medium">Antennas:</span> {readerModels.find(model => model.id === selectedModel)?.antennaCount}</div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Register New RFID Reader</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Step Indicator */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            <li className={`relative pr-8 sm:pr-20 ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className="flex items-center">
                <div className={`h-8 w-8 flex items-center justify-center rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <div className="ml-4 text-sm font-medium">Discovery</div>
              </div>
              <div className="absolute top-4 right-0 h-0.5 w-full bg-gray-200">
                <div className={`h-0.5 ${step > 1 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: '100%' }}></div>
              </div>
            </li>
            <li className={`relative pr-8 sm:pr-20 ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className="flex items-center">
                <div className={`h-8 w-8 flex items-center justify-center rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <div className="ml-4 text-sm font-medium">Model</div>
              </div>
              <div className="absolute top-4 right-0 h-0.5 w-full bg-gray-200">
                <div className={`h-0.5 ${step > 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: '100%' }}></div>
              </div>
            </li>
            <li className={`relative ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className="flex items-center">
                <div className={`h-8 w-8 flex items-center justify-center rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <div className="ml-4 text-sm font-medium">Details</div>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      
      {/* Step Content */}
      <div className="mb-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={step === 1 ? onCancel : handlePreviousStep}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {step === 3 ? 'Register Reader' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default ReaderRegistration;