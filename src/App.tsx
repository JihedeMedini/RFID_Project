import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import layout
import Layout from './components/Layout'

// Import pages
import DashboardPage from './pages/DashboardPage'
import TagAssignmentPage from './pages/TagAssignmentPage'
import MovementLogPage from './pages/MovementLogPage'
import AlertsDashboard from './pages/AlertsDashboard'
import AIDashboardPage from './pages/AIDashboardPage'
import DeviceManagementPage from './pages/DeviceManagementPage'
import ZoneManagementPage from './pages/ZoneManagementPage'
import SettingsPage from './pages/SettingsPage'
import ReportsPage from './pages/ReportsPage'

// Import components
import AIChatbot from './components/AIChatbot'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <DashboardPage />
          </Layout>
        } />
        <Route path="/dashboard" element={
          <Layout>
            <DashboardPage />
          </Layout>
        } />
        <Route path="/tag-assignment" element={
          <Layout>
            <TagAssignmentPage />
          </Layout>
        } />
        <Route path="/movement" element={
          <Layout>
            <MovementLogPage />
          </Layout>
        } />
        <Route path="/alerts" element={
          <Layout>
            <AlertsDashboard />
          </Layout>
        } />
        <Route path="/device-management" element={
          <Layout>
            <DeviceManagementPage />
          </Layout>
        } />
        <Route path="/zone-management" element={
          <Layout>
            <ZoneManagementPage />
          </Layout>
        } />
        <Route path="/reports" element={
          <Layout>
            <ReportsPage />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <SettingsPage />
          </Layout>
        } />
        <Route path="/ai-dashboard" element={
          <Layout>
            <AIDashboardPage />
          </Layout>
        } />
      </Routes>

      {/* AI Chatbot */}
      <AIChatbot />
    </Router>
  )
}

export default App
