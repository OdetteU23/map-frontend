import { Routes, Route, useParams } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import LandingPage from './views/LandingPage'
import AuthPage from './views/AuthPage'
import UserHome from './views/UserHome'
import SearchPage from './views/SearchPage'
import MessagesPage from './views/MessagesPage'
import SettingsPage from './views/SettingsPage'
import AccountPage from './views/AccountPage'
import ProviderHome from './views/ProviderHome'
import SpaceDetail from './views/SpaceDetail'
import BookingsPage from './views/Bookings'
import ImageUploadPage from './views/imageUpload'
import CreateSpacePage from './views/CreateSpacePage'
import EditSpacePage from './views/EditSpacePage'
import NotificationsPage from './views/NotificationsPage'
import PaymentPage from './views/PaymentPage'

const ImageUploadWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <ImageUploadPage listingId={id ? Number(id) : undefined} />;
};

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
        <Route path="/account" element={<AccountPage />} />
        <Route path="/provider" element={<ProviderHome />} />
        <Route path="/provider/create" element={<CreateSpacePage />} />
        <Route path="/provider/edit/:id" element={<EditSpacePage />} />
        <Route path="/space/:id" element={<SpaceDetail />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/upload/:id" element={<ImageUploadWrapper />} />
        <Route path="/upload" element={<CreateSpacePage />} />
      </Route>
    </Routes>
  )
}

export default App
