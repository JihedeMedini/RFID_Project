import { useState } from 'react';
import { 
  CubeIcon,
  SignalIcon, 
  PlusIcon, 
  TrashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

type AntennaType = {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  power: number;
  gain: number;
  polarization: string;
  coverage: string;
  zoneId?: number;
  zoneName?: string;
};

type ReaderType = {
  id: number;
  name: string;
  antennas: AntennaType[];
};

type AntennaMappingProps = {
  reader: ReaderType;
  onSave: (reader: ReaderType) => void;
};

const AntennaMapping = ({ reader, onSave }: AntennaMappingProps) => {
  const [readerData, setReaderData] = useState<ReaderType>(reader);
  const [editingAntennaId, setEditingAntennaId] = useState<number | null>(null);
  const [showAntennaDetails, setShowAntennaDetails] = useState<boolean>(false);
  
  // Available zones for mapping
  const availableZones = [
    { id: 1, name: 'Warehouse Zone A' },
    { id: 2, name: 'Warehouse Zone B' },
    { id: 3, name: 'Shipping Area' },
    { id: 4, name: 'Receiving Area' },
    { id: 5, name: 'Restricted Zone' }
  ];
  
  const handleAntennaStatusChange = (antennaId: number) => {
    setReaderData({
      ...readerData,
      antennas: readerData.antennas.map(antenna => 
        antenna.id === antennaId 
          ? { 
              ...antenna, 
              status: antenna.status === 'active' ? 'inactive' : 'active' 
            } 
          : antenna
      )
    });
  };
  
  const handleAntennaZoneChange = (antennaId: number, zoneId: number | undefined) => {
    setReaderData({
      ...readerData,
      antennas: readerData.antennas.map(antenna => {
        if (antenna.id === antennaId) {
          const zone = zoneId ? availableZones.find(z => z.id === zoneId) : undefined;
          return { 
            ...antenna, 
            zoneId: zoneId,
            zoneName: zone?.name
          };
        }
        return antenna;
      })
    });
  };
  
  const handleSaveChanges = () => {
    onSave(readerData);
  };
  
  const handleAntennaPropertyChange = (antennaId: number, property: string, value: any) => {
    setReaderData({
      ...readerData,
      antennas: readerData.antennas.map(antenna => 
        antenna.id === antennaId 
          ? { ...antenna, [property]: value } 
          : antenna
      )
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <CubeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">{readerData.name}</h2>
            <p className="text-sm text-gray-500">Antenna Configuration</p>
          </div>
        </div>
        <div>
          <button
            onClick={() => setShowAntennaDetails(!showAntennaDetails)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {showAntennaDetails ? (
              <>
                <ArrowsPointingInIcon className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ArrowsPointingOutIcon className="h-4 w-4 mr-2" />
                Show Details
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Antenna
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mapped Zone
              </th>
              {showAntennaDetails && (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Power (dBm)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain (dBi)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Polarization
                  </th>
                </>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {readerData.antennas.map((antenna) => (
              <tr key={antenna.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <SignalIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{antenna.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleAntennaStatusChange(antenna.id)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                        antenna.status === 'active' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          antenna.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                    <span className="ml-2 text-sm text-gray-500">
                      {antenna.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={antenna.zoneId || ''}
                    onChange={(e) => handleAntennaZoneChange(antenna.id, e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Not Mapped</option>
                    {availableZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </td>
                {showAntennaDetails && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={antenna.power}
                        onChange={(e) => handleAntennaPropertyChange(antenna.id, 'power', Number(e.target.value))}
                        min="0"
                        max="30"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={antenna.gain}
                        onChange={(e) => handleAntennaPropertyChange(antenna.id, 'gain', Number(e.target.value))}
                        step="0.1"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={antenna.polarization}
                        onChange={(e) => handleAntennaPropertyChange(antenna.id, 'polarization', e.target.value)}
                      >
                        <option value="Linear">Linear</option>
                        <option value="Circular">Circular</option>
                        <option value="Dual">Dual</option>
                      </select>
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingAntennaId(antenna.id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveChanges}
          className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Configuration
        </button>
      </div>
      
      {/* Antenna Settings Modal */}
      {editingAntennaId !== null && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <SignalIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Antenna Settings
                    </h3>
                    <div className="mt-4 space-y-4">
                      {readerData.antennas.filter(a => a.id === editingAntennaId).map(antenna => (
                        <div key={antenna.id} className="space-y-4">
                          <div>
                            <label htmlFor="antenna-name" className="block text-sm font-medium text-gray-700">
                              Antenna Name
                            </label>
                            <input
                              type="text"
                              id="antenna-name"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={antenna.name}
                              onChange={(e) => handleAntennaPropertyChange(antenna.id, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="antenna-power" className="block text-sm font-medium text-gray-700">
                              Power (dBm)
                            </label>
                            <input
                              type="number"
                              id="antenna-power"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={antenna.power}
                              onChange={(e) => handleAntennaPropertyChange(antenna.id, 'power', Number(e.target.value))}
                              min="0"
                              max="30"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="antenna-gain" className="block text-sm font-medium text-gray-700">
                              Gain (dBi)
                            </label>
                            <input
                              type="number"
                              id="antenna-gain"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={antenna.gain}
                              onChange={(e) => handleAntennaPropertyChange(antenna.id, 'gain', Number(e.target.value))}
                              step="0.1"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="antenna-polarization" className="block text-sm font-medium text-gray-700">
                              Polarization
                            </label>
                            <select
                              id="antenna-polarization"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={antenna.polarization}
                              onChange={(e) => handleAntennaPropertyChange(antenna.id, 'polarization', e.target.value)}
                            >
                              <option value="Linear">Linear</option>
                              <option value="Circular">Circular</option>
                              <option value="Dual">Dual</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="antenna-coverage" className="block text-sm font-medium text-gray-700">
                              Coverage Area
                            </label>
                            <textarea
                              id="antenna-coverage"
                              rows={2}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={antenna.coverage}
                              onChange={(e) => handleAntennaPropertyChange(antenna.id, 'coverage', e.target.value)}
                              placeholder="e.g. 3m x 5m area, 120-degree coverage"
                            ></textarea>
                          </div>
                          
                          <div className="flex items-center mt-4">
                            <input
                              id="antenna-status"
                              name="antenna-status"
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={antenna.status === 'active'}
                              onChange={() => handleAntennaStatusChange(antenna.id)}
                            />
                            <label htmlFor="antenna-status" className="ml-2 block text-sm text-gray-900">
                              Active
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setEditingAntennaId(null)}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setEditingAntennaId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AntennaMapping; 