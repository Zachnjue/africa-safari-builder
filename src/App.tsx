import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { DestinationsPage } from './pages/DestinationsPage';
import { TripBuilderPage } from './pages/TripBuilderPage';
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/build-trip" element={<TripBuilderPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;
