import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      
      <main className={`pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      <footer className={`bg-white border-t border-gray-200 py-4 px-6 text-sm text-gray-600 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <p>&copy; 2025 RFID Warehouse Management System</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-blue-600 hover:text-blue-800">Documentation</a>
            <a href="#" className="text-blue-600 hover:text-blue-800">Support</a>
            <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 