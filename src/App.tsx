import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { ProfilePage } from './pages/ProfilePage';
import { DestinationsPage } from './pages/DestinationsPage';
import { TripBuilderPage } from './pages/TripBuilderPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDestinationsPage } from './pages/AdminDestinationsPage';
import { AdminActivitiesPage } from './pages/AdminActivitiesPage';
import { AdminAccommodationPage } from './pages/AdminAccommodationPage';
import { AdminTransportationPage } from './pages/AdminTransportationPage';
import { AdminHotelsPage } from './pages/AdminHotelsPage';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/build-trip" element={<TripBuilderPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/destinations" element={<AdminDestinationsPage />} />
            <Route path="/admin/activities" element={<AdminActivitiesPage />} />
            <Route path="/admin/accommodation" element={<AdminAccommodationPage />} />
            <Route path="/admin/hotels" element={<AdminHotelsPage />} />
            <Route path="/admin/transportation" element={<AdminTransportationPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={5000}
          toastOptions={{
            className: 'cursor-pointer',
          }}
        />
      </div>
    </Router>
  );
}

export default App;
