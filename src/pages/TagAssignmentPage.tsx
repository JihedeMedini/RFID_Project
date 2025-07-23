import { useState, useEffect } from 'react';
import type { Item, TagAssignment } from '../mockServices';
import { TagService, MOCK_ITEMS, generateZPLLabel } from '../mockServices';
import { Zone } from '../mockServices/types';
import PrintingAnimation from '../components/PrintingAnimation';

const TagAssignmentPage = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [tagId, setTagId] = useState('');
  const [homeZone, setHomeZone] = useState<Zone>(Zone.WAREHOUSE);
  const [assignments, setAssignments] = useState<TagAssignment[]>([]);
  const [zplPreview, setZplPreview] = useState<string | null>(null);
  const [showZplModal, setShowZplModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isAssignButtonAnimating, setIsAssignButtonAnimating] = useState(false);

  useEffect(() => {
    // Load existing tag assignments
    setAssignments(TagService.getAllAssignments());
  }, []);

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = e.target.value;
    const item = MOCK_ITEMS.find(i => i.id === itemId) || null;
    setSelectedItem(item);
  };

  const handleTagIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagId(e.target.value);
  };

  const handleHomeZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHomeZone(e.target.value as Zone);
  };

  const handleAssign = () => {
    if (!selectedItem || !tagId.trim()) {
      alert('Please select an item and enter a tag ID');
      return;
    }

    // Check if tag is already assigned
    if (TagService.isTagAssigned(tagId)) {
      alert('This tag is already assigned to an item');
      return;
    }

    // Animate assign button
    setIsAssignButtonAnimating(true);
    setTimeout(() => setIsAssignButtonAnimating(false), 500);

    // Assign tag to item with home zone
    const assignment = TagService.assignTag(tagId, selectedItem.id, homeZone);
    
    // Update local state
    setAssignments([assignment, ...assignments]);
    
    // Generate ZPL label
    const zpl = generateZPLLabel(tagId, selectedItem, homeZone);
    setZplPreview(zpl);
    setShowZplModal(true);
    
    // Reset form
    setTagId('');
  };

  const handleSimulateScan = () => {
    // Generate a random tag ID to simulate scanning
    const randomTag = `TAG${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    setTagId(randomTag);
  };

  const handlePrintLabel = () => {
    setShowZplModal(false);
    setIsPrinting(true);
  };

  const handlePrintingComplete = () => {
    setIsPrinting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 animate-slide-in-left">Tag Assignment</h1>
        <div className="text-sm text-gray-500 animate-slide-in-right">
          {assignments.length} total assignments
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6 animate-slide-up">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Assign New Tag
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
                <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Item
                </label>
                <select
                  id="item"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={selectedItem?.id || ''}
                  onChange={handleItemChange}
                >
                  <option value="">-- Select an item --</option>
                  {MOCK_ITEMS.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.sku}
                    </option>
                  ))}
                </select>
                
                {selectedItem && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md animate-scale-in">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Selected:</span> {selectedItem.name}
                    </p>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">SKU:</span> {selectedItem.sku}
                    </p>
                    {selectedItem.description && (
                      <p className="text-sm text-blue-600 mt-1">
                        {selectedItem.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
                <label htmlFor="tagId" className="block text-sm font-medium text-gray-700 mb-1">
                  RFID Tag ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="tagId"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={tagId}
                    onChange={handleTagIdChange}
                    placeholder="Enter tag ID"
                  />
                  <button
                    onClick={handleSimulateScan}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-md border border-gray-300 transition-all duration-300 flex items-center hover:shadow-md active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM14 3.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-6 11a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                    </svg>
                    Scan
                  </button>
                </div>
              </div>

              <div className="transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
                <label htmlFor="homeZone" className="block text-sm font-medium text-gray-700 mb-1">
                  Home Zone
                </label>
                <select
                  id="homeZone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={homeZone}
                  onChange={handleHomeZoneChange}
                >
                  {Object.values(Zone).map(zone => (
                    <option key={zone} value={zone}>
                      {zone.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  The home zone is the initial location where this item belongs.
                </p>
              </div>
              
              <button
                onClick={handleAssign}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center hover:shadow-lg ${isAssignButtonAnimating ? 'animate-wiggle' : ''} ${!selectedItem || !tagId.trim() ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}`}
                disabled={!selectedItem || !tagId.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Assign Tag
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Help</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="transition-all duration-300 hover:text-blue-600 hover:translate-x-1">
                <span className="font-medium text-gray-700">1.</span> Select an item from the dropdown
              </p>
              <p className="transition-all duration-300 hover:text-blue-600 hover:translate-x-1">
                <span className="font-medium text-gray-700">2.</span> Enter a tag ID or click "Scan" to simulate scanning
              </p>
              <p className="transition-all duration-300 hover:text-blue-600 hover:translate-x-1">
                <span className="font-medium text-gray-700">3.</span> Select a home zone for the item
              </p>
              <p className="transition-all duration-300 hover:text-blue-600 hover:translate-x-1">
                <span className="font-medium text-gray-700">4.</span> Click "Assign Tag" to create the assignment
              </p>
              <p className="transition-all duration-300 hover:text-blue-600 hover:translate-x-1">
                <span className="font-medium text-gray-700">5.</span> A ZPL label will be generated for printing
              </p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                Recent Assignments
              </h2>
            </div>
            
            {assignments.length === 0 ? (
              <div className="p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 text-lg">No tags have been assigned yet.</p>
                <p className="text-gray-400 text-sm mt-1">Assignments will appear here once created.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Home Zone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment, index) => {
                      const item = MOCK_ITEMS.find(i => i.id === assignment.itemId);
                      return (
                        <tr 
                          key={index} 
                          className={`${index === 0 ? "bg-blue-50" : ""} hover:bg-gray-50 transition-colors duration-150`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium text-gray-900">{assignment.tagId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.sku}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Unknown Item</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full" 
                              style={{
                                backgroundColor: assignment.homeZone === Zone.WAREHOUSE ? '#e3f2fd' :
                                  assignment.homeZone === Zone.SHIPPING ? '#e8f5e9' :
                                  assignment.homeZone === Zone.RECEIVING ? '#fff3e0' :
                                  assignment.homeZone === Zone.QUALITY_CHECK ? '#f3e5f5' :
                                  assignment.homeZone === Zone.ENTRY ? '#e0f7fa' :
                                  assignment.homeZone === Zone.EXIT ? '#ffebee' : '#f5f5f5',
                                color: assignment.homeZone === Zone.WAREHOUSE ? '#1565c0' :
                                  assignment.homeZone === Zone.SHIPPING ? '#2e7d32' :
                                  assignment.homeZone === Zone.RECEIVING ? '#e65100' :
                                  assignment.homeZone === Zone.QUALITY_CHECK ? '#6a1b9a' :
                                  assignment.homeZone === Zone.ENTRY ? '#00838f' :
                                  assignment.homeZone === Zone.EXIT ? '#c62828' : '#616161'
                              }}
                            >
                              {assignment.homeZone?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(assignment.assignedAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* ZPL Label Modal */}
      {showZplModal && zplPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                ZPL Label Preview
              </h3>
              <button 
                onClick={() => setShowZplModal(false)}
                className="text-white hover:text-blue-200 focus:outline-none transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="bg-gray-800 p-4 rounded-md overflow-x-auto mb-4">
                <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                  {zplPreview}
                </pre>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 animate-pulse-slow">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This ZPL code can be sent to a compatible Zebra printer to print the RFID tag label.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowZplModal(false)}
                className="bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm mr-2 transition-all duration-200 hover:shadow active:scale-95"
              >
                Close
              </button>
              <button
                onClick={handlePrintLabel}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm flex items-center transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Printing Animation */}
      {isPrinting && <PrintingAnimation onComplete={handlePrintingComplete} />}
    </div>
  );
};

export default TagAssignmentPage; 