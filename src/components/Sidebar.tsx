import { NavLink } from 'react-router-dom';
import { useState } from 'react';

// Icons
import {
  TagIcon,
  DocumentTextIcon,
  BellIcon,
  CubeIcon,
  Cog6ToothIcon,
  MapIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

type SidebarProps = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

const Sidebar = ({ collapsed, toggleSidebar }: SidebarProps) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const toggleGroup = (group: string) => {
    setActiveGroup(activeGroup === group ? null : group);
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} h-screen bg-blue-900 text-white transition-all duration-300 fixed left-0 top-0 z-10`}>
      <div className="flex items-center justify-between p-4 border-b border-blue-800">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <CubeIcon className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-bold">RFID Warehouse</h1>
              <p className="text-xs text-blue-300">Management System</p>
            </div>
          </div>
        )}
        {collapsed && <CubeIcon className="h-6 w-6 mx-auto" />}
        <button 
          onClick={toggleSidebar} 
          className="p-1 rounded-md hover:bg-blue-800 focus:outline-none"
        >
          {collapsed ? <Bars3Icon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
        </button>
      </div>

      <nav className="mt-4">
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 ${collapsed ? 'justify-center' : ''} ${
                  isActive 
                    ? 'bg-blue-800 border-l-4 border-white' 
                    : 'hover:bg-blue-800'
                }`
              }
            >
              <ChartBarIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Dashboard</span>}
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/tag-assignment" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 ${collapsed ? 'justify-center' : ''} ${
                  isActive 
                    ? 'bg-blue-800 border-l-4 border-white' 
                    : 'hover:bg-blue-800'
                }`
              }
            >
              <TagIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Tag Assignment</span>}
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/movement" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 ${collapsed ? 'justify-center' : ''} ${
                  isActive 
                    ? 'bg-blue-800 border-l-4 border-white' 
                    : 'hover:bg-blue-800'
                }`
              }
            >
              <DocumentTextIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Movement Log</span>}
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/alerts" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 ${collapsed ? 'justify-center' : ''} ${
                  isActive 
                    ? 'bg-blue-800 border-l-4 border-white' 
                    : 'hover:bg-blue-800'
                }`
              }
            >
              <BellIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Alerts</span>}
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/device-management" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 ${collapsed ? 'justify-center' : ''} ${
                  isActive 
                    ? 'bg-blue-800 border-l-4 border-white' 
                    : 'hover:bg-blue-800'
                }`
              }
            >
              <CubeIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Device Management</span>}
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/zone-management" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 ${collapsed ? 'justify-center' : ''} ${
                  isActive 
                    ? 'bg-blue-800 border-l-4 border-white' 
                    : 'hover:bg-blue-800'
                }`
              }
            >
              <MapIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Zone Management</span>}
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/reports" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 ${collapsed ? 'justify-center' : ''} ${
                  isActive 
                    ? 'bg-blue-800 border-l-4 border-white' 
                    : 'hover:bg-blue-800'
                }`
              }
            >
              <ChartBarIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Reports</span>}
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/settings" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 ${collapsed ? 'justify-center' : ''} ${
                  isActive 
                    ? 'bg-blue-800 border-l-4 border-white' 
                    : 'hover:bg-blue-800'
                }`
              }
            >
              <Cog6ToothIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Settings</span>}
            </NavLink>
          </li>

          {/* <li>
            <NavLink 
              to="/ai-dashboard" 
              className={({isActive}) => 
                `flex items-center px-4 py-3 ${collapsed ? 'justify-center' : ''} ${
                  isActive 
                    ? 'bg-blue-800 border-l-4 border-white' 
                    : 'hover:bg-blue-800'
                }`
              }
            >
              <CubeIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">AI Dashboard</span>}
            </NavLink>
          </li> */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 