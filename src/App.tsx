import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import LandingPage from './views/LandingPage'
import AuthPage from './views/AuthPage'
import UserHome from './views/UserHome'
import SearchPage from './views/SearchPage'
import MessagesPage from './views/MessagesPage'
import SettingsPage from './views/SettingsPage'
import ProviderHome from './views/ProviderHome'
import SpaceDetail from './views/SpaceDetail'
import BookingsPage from './views/Bookings'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/provider" element={<ProviderHome />} />
        <Route path="/space/:id" element={<SpaceDetail />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
