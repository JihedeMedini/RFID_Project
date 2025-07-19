import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { useState } from 'react'
import './App.css'

// Import pages
import TagAssignmentPage from './pages/TagAssignmentPage'
import MovementLogPage from './pages/MovementLogPage'
import AlertsDashboard from './pages/AlertsDashboard'
import AIDashboardPage from './pages/AIDashboardPage'

// Import components
import AIChatbot from './components/AIChatbot'

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 w-full max-w-none">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                </svg>
                <div>
                  <h1 className="text-xl font-bold">RFID Warehouse</h1>
                  <p className="text-xs text-blue-100">Management System</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                <NavLink 
                  to="/" 
                  className={({isActive}) => 
                    `px-4 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-white text-blue-800 font-medium' 
                        : 'text-white hover:bg-blue-600'
                    }`
                  }
                  end
                >
                  Tag Assignment
                </NavLink>
                <NavLink 
                  to="/movement" 
                  className={({isActive}) => 
                    `px-4 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-white text-blue-800 font-medium' 
                        : 'text-white hover:bg-blue-600'
                    }`
                  }
                >
                  Movement Log
                </NavLink>
                <NavLink 
                  to="/alerts" 
                  className={({isActive}) => 
                    `px-4 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-white text-blue-800 font-medium' 
                        : 'text-white hover:bg-blue-600'
                    }`
                  }
                >
                  Alerts
                </NavLink>
                <NavLink 
                  to="/ai-dashboard" 
                  className={({isActive}) => 
                    `px-4 py-2 rounded-md transition-colors flex items-center ${
                      isActive 
                        ? 'bg-white text-blue-800 font-medium' 
                        : 'text-white hover:bg-blue-600'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                  </svg>
                  AI Dashboard
                </NavLink>
              </nav>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-md text-blue-100 hover:bg-blue-800 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden bg-blue-800 px-4 py-2">
              <div className="flex flex-col space-y-1">
                <NavLink 
                  to="/" 
                  className={({isActive}) => 
                    `px-3 py-2 rounded-md ${
                      isActive 
                        ? 'bg-white text-blue-800 font-medium' 
                        : 'text-white hover:bg-blue-700'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  end
                >
                  Tag Assignment
                </NavLink>
                <NavLink 
                  to="/movement" 
                  className={({isActive}) => 
                    `px-3 py-2 rounded-md ${
                      isActive 
                        ? 'bg-white text-blue-800 font-medium' 
                        : 'text-white hover:bg-blue-700'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Movement Log
                </NavLink>
                <NavLink 
                  to="/alerts" 
                  className={({isActive}) => 
                    `px-3 py-2 rounded-md ${
                      isActive 
                        ? 'bg-white text-blue-800 font-medium' 
                        : 'text-white hover:bg-blue-700'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Alerts
                </NavLink>
                <NavLink 
                  to="/ai-dashboard" 
                  className={({isActive}) => 
                    `px-3 py-2 rounded-md flex items-center ${
                      isActive 
                        ? 'bg-white text-blue-800 font-medium' 
                        : 'text-white hover:bg-blue-700'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                  </svg>
                  AI Dashboard
                </NavLink>
              </div>
            </nav>
          )}
        </header>
        
        <main className="flex-grow w-full">
          <div className="container mx-auto px-4 py-4 w-full max-w-none">
            <Routes>
              <Route path="/" element={<TagAssignmentPage />} />
              <Route path="/movement" element={<MovementLogPage />} />
              <Route path="/alerts" element={<AlertsDashboard />} />
              <Route path="/ai-dashboard" element={<AIDashboardPage />} />
            </Routes>
          </div>
        </main>
        
        <footer className="bg-gray-800 text-white text-sm py-4">
          <div className="container mx-auto px-4 w-full max-w-none">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-2 md:mb-0">
                <p>&copy; 2025 RFID Warehouse Management System</p>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-300 hover:text-white">Documentation</a>
                <a href="#" className="text-blue-300 hover:text-white">Support</a>
                <a href="#" className="text-blue-300 hover:text-white">Privacy Policy</a>
              </div>
            </div>
          </div>
        </footer>

        {/* AI Chatbot */}
        <AIChatbot />
      </div>
    </Router>
  )
}

export default App
