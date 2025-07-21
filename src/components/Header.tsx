import { useState } from 'react';
import { Bars3Icon, BellIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

type HeaderProps = {
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
};

const Header = ({ toggleSidebar, sidebarCollapsed }: HeaderProps) => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New tag detected in restricted zone', read: false },
    { id: 2, message: 'Movement detected outside working hours', read: false },
    { id: 3, message: 'RFID reader #3 offline', read: true }
  ]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  return (
    <header className={`bg-white shadow-sm h-16 fixed top-0 right-0 ${sidebarCollapsed ? 'left-16' : 'left-64'} transition-all duration-300 z-10`}>
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="ml-4 relative max-w-xs">
            <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="ml-2 bg-transparent border-none focus:outline-none text-sm w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 p-4">No notifications</p>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)} 
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <UserIcon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium hidden md:block">Admin User</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Your Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <div className="border-t border-gray-100"></div>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 