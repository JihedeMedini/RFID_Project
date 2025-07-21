import { useState } from 'react';
import ReportGenerator from '../components/ReportGenerator';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// Mock report data
const recentReports = [
  { id: 1, name: 'Daily Movement Report - 2023-05-15', type: 'movement', date: '2023-05-15', format: 'pdf', size: '1.2 MB' },
  { id: 2, name: 'Inventory Status - May 2023', type: 'inventory', date: '2023-05-10', format: 'excel', size: '3.5 MB' },
  { id: 3, name: 'Zone Activity Analysis - Q2', type: 'zone', date: '2023-05-01', format: 'pdf', size: '2.8 MB' },
  { id: 4, name: 'User Actions Report - April 2023', type: 'custom', date: '2023-04-30', format: 'csv', size: '1.7 MB' },
  { id: 5, name: 'Monthly Shipping Report', type: 'movement', date: '2023-04-15', format: 'pdf', size: '4.2 MB' }
];

const ReportsPage = () => {
  const [downloadingReport, setDownloadingReport] = useState<number | null>(null);
  
  const handleGenerateReport = (options: any) => {
    console.log('Generating report with options:', options);
    // In a real app, this would call an API to generate the report
  };
  
  const handleDownloadReport = (reportId: number) => {
    setDownloadingReport(reportId);
    
    // Simulate download delay
    setTimeout(() => {
      setDownloadingReport(null);
    }, 2000);
  };
  
  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'movement':
        return <ArrowDownTrayIcon className="h-5 w-5 text-blue-600" />;
      case 'inventory':
        return <DocumentTextIcon className="h-5 w-5 text-green-600" />;
      case 'zone':
        return <DocumentTextIcon className="h-5 w-5 text-amber-600" />;
      case 'custom':
        return <ChartBarIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'excel':
        return 'bg-green-100 text-green-800';
      case 'csv':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate custom reports and analytics for your RFID tracking data.
        </p>
      </div>
      
      <div className="mb-8">
        <ReportGenerator onGenerateReport={handleGenerateReport} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
          <p className="mt-1 text-sm text-gray-500">
            Access and download your previously generated reports.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getReportTypeIcon(report.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 capitalize">{report.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{report.date}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getFormatBadgeColor(report.format)}`}>
                      {report.format.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDownloadReport(report.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {downloadingReport === report.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          Download
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 