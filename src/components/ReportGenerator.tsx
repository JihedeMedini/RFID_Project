import { useState } from 'react';
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
  TableCellsIcon,
  MapIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';

type ReportType = 'movement' | 'inventory' | 'zone' | 'custom';

type ReportFormat = 'pdf' | 'excel' | 'csv';

type ReportOptions = {
  type: ReportType;
  title: string;
  startDate: string;
  endDate: string;
  zones: string[];
  tags: string[];
  users: string[];
  includeCharts: boolean;
  format: ReportFormat;
};

type ReportGeneratorProps = {
  onGenerateReport?: (options: ReportOptions) => void;
};

const ReportGenerator = ({ onGenerateReport }: ReportGeneratorProps) => {
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    type: 'movement',
    title: '',
    startDate: '',
    endDate: '',
    zones: [],
    tags: [],
    users: [],
    includeCharts: true,
    format: 'pdf'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Mock data for available options
  const availableZones = [
    { id: '1', name: 'Warehouse Zone A' },
    { id: '2', name: 'Warehouse Zone B' },
    { id: '3', name: 'Shipping Area' },
    { id: '4', name: 'Receiving Area' },
    { id: '5', name: 'Restricted Zone' }
  ];
  
  const availableTags = [
    { id: 'T001', name: 'Pallet 001' },
    { id: 'T002', name: 'Pallet 002' },
    { id: 'T003', name: 'Container A' },
    { id: 'T004', name: 'Container B' },
    { id: 'T005', name: 'Equipment X' }
  ];
  
  const availableUsers = [
    { id: 'U001', name: 'John Doe' },
    { id: 'U002', name: 'Jane Smith' },
    { id: 'U003', name: 'Robert Johnson' },
    { id: 'U004', name: 'Emily Davis' }
  ];
  
  const reportTemplates = [
    { id: 'daily-movement', name: 'Daily Movement Report', type: 'movement', description: 'Summary of all tag movements in the last 24 hours' },
    { id: 'inventory-status', name: 'Inventory Status Report', type: 'inventory', description: 'Current location and status of all tracked items' },
    { id: 'zone-activity', name: 'Zone Activity Report', type: 'zone', description: 'Analysis of activity in each zone over time' },
    { id: 'user-actions', name: 'User Actions Report', type: 'custom', description: 'Log of all user-initiated actions and their effects' }
  ];
  
  const handleInputChange = (field: keyof ReportOptions, value: any) => {
    setReportOptions({
      ...reportOptions,
      [field]: value
    });
  };
  
  const handleMultiSelectChange = (field: keyof ReportOptions, value: string) => {
    const currentValues = reportOptions[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setReportOptions({
      ...reportOptions,
      [field]: newValues
    });
  };
  
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = reportTemplates.find(t => t.id === templateId);
    
    if (template) {
      // Pre-populate form based on template
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      setReportOptions({
        ...reportOptions,
        type: template.type as ReportType,
        title: template.name,
        startDate: template.id === 'daily-movement' ? yesterday.toISOString().split('T')[0] : '',
        endDate: template.id === 'daily-movement' ? now.toISOString().split('T')[0] : ''
      });
    }
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // In a real app, this would call an API to generate the report
    setTimeout(() => {
      if (onGenerateReport) {
        onGenerateReport(reportOptions);
      }
      
      // Simulate report generation
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', `${reportOptions.title.toLowerCase().replace(/\s+/g, '-')}.${reportOptions.format}`);
      link.click();
      
      setIsGenerating(false);
    }, 2000);
  };
  
  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'movement':
        return <ArrowDownTrayIcon className="h-5 w-5 text-blue-600" />;
      case 'inventory':
        return <TableCellsIcon className="h-5 w-5 text-green-600" />;
      case 'zone':
        return <MapIcon className="h-5 w-5 text-amber-600" />;
      case 'custom':
        return <ChartBarIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Report Generator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create custom reports or use templates to quickly generate common reports.
        </p>
      </div>
      
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Report Templates</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reportTemplates.map((template) => (
            <div
              key={template.id}
              className={`relative rounded-lg border ${
                selectedTemplate === template.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'
              } bg-white p-4 shadow-sm focus:outline-none cursor-pointer`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {getReportTypeIcon(template.type as ReportType)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.type}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{template.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="px-6 py-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Report Options</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="report-title" className="block text-sm font-medium text-gray-700">
              Report Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="report-title"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={reportOptions.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter report title"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <div className="mt-1">
              <select
                id="report-type"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={reportOptions.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="movement">Movement Report</option>
                <option value="inventory">Inventory Report</option>
                <option value="zone">Zone Report</option>
                <option value="custom">Custom Report</option>
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="start-date"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                value={reportOptions.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="end-date"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                value={reportOptions.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Zones</legend>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {availableZones.map((zone) => (
                  <div key={zone.id} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`zone-${zone.id}`}
                        name="zones"
                        type="checkbox"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={reportOptions.zones.includes(zone.id)}
                        onChange={() => handleMultiSelectChange('zones', zone.id)}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={`zone-${zone.id}`} className="font-medium text-gray-700">
                        {zone.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          
          {(reportOptions.type === 'inventory' || reportOptions.type === 'custom') && (
            <div className="sm:col-span-6">
              <fieldset>
                <legend className="text-sm font-medium text-gray-700">Tags</legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {availableTags.map((tag) => (
                    <div key={tag.id} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`tag-${tag.id}`}
                          name="tags"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={reportOptions.tags.includes(tag.id)}
                          onChange={() => handleMultiSelectChange('tags', tag.id)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`tag-${tag.id}`} className="font-medium text-gray-700">
                          {tag.name}
                        </label>
                        <p className="text-gray-500">{tag.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
          
          {reportOptions.type === 'custom' && (
            <div className="sm:col-span-6">
              <fieldset>
                <legend className="text-sm font-medium text-gray-700">Users</legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {availableUsers.map((user) => (
                    <div key={user.id} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`user-${user.id}`}
                          name="users"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={reportOptions.users.includes(user.id)}
                          onChange={() => handleMultiSelectChange('users', user.id)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`user-${user.id}`} className="font-medium text-gray-700">
                          {user.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
          
          <div className="sm:col-span-3">
            <div className="flex items-center">
              <input
                id="include-charts"
                name="include-charts"
                type="checkbox"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={reportOptions.includeCharts}
                onChange={(e) => handleInputChange('includeCharts', e.target.checked)}
              />
              <label htmlFor="include-charts" className="ml-2 block text-sm text-gray-700">
                Include Charts and Visualizations
              </label>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="report-format" className="block text-sm font-medium text-gray-700">
              Report Format
            </label>
            <div className="mt-1">
              <select
                id="report-format"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={reportOptions.format}
                onChange={(e) => handleInputChange('format', e.target.value)}
              >
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV File</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          type="button"
          onClick={handleGenerateReport}
          disabled={isGenerating || !reportOptions.title}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            isGenerating || !reportOptions.title ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Generate Report
            </>
          )}
        </button>
      </div>
      
      {/* Report Preview (placeholder) */}
      {reportOptions.title && reportOptions.startDate && reportOptions.endDate && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Report Preview</h3>
          <div className="bg-white p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{reportOptions.title}</h4>
                <p className="text-sm text-gray-500">
                  {reportOptions.startDate} to {reportOptions.endDate}
                </p>
              </div>
              <div className="flex items-center">
                {getReportTypeIcon(reportOptions.type)}
                <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                  {reportOptions.type} Report
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {reportOptions.zones.length > 0 && (
                  <div className="flex items-center">
                    <MapIcon className="h-4 w-4 mr-1" />
                    <span>{reportOptions.zones.length} zones selected</span>
                  </div>
                )}
                
                {reportOptions.tags.length > 0 && (
                  <div className="flex items-center">
                    <TagIcon className="h-4 w-4 mr-1" />
                    <span>{reportOptions.tags.length} tags selected</span>
                  </div>
                )}
                
                {reportOptions.users.length > 0 && (
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{reportOptions.users.length} users selected</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 h-40 flex items-center justify-center border border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">Report preview will be generated here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator; 