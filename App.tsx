
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import RoomStatusPage from './pages/RoomStatus';
import DashboardPage from './pages/Dashboard';
import CleaningPage from './pages/Cleaning';
import ReceiptPage from './pages/Receipt';
import Sidebar from './components/Sidebar';
import HealthCheckPage from './pages/HealthCheck';

export type Page = 'Home' | 'RoomStatus' | 'Dashboard' | 'Cleaning' | 'Receipt';

const App: React.FC = () => {
  const [isHealthChecked, setIsHealthChecked] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>('Home');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('Home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <HomePage />;
      case 'RoomStatus':
        return <RoomStatusPage onNavigateToBooking={setCurrentPage} />;
      case 'Dashboard':
        return <DashboardPage />;
      case 'Cleaning':
        return <CleaningPage />;
      case 'Receipt':
        return <ReceiptPage />;
      default:
        return <HomePage />;
    }
  };

  const renderApp = () => {
    if (!isHealthChecked) {
      return <HealthCheckPage onSuccess={() => setIsHealthChecked(true)} />;
    }
    
    if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
    }

    return (
      <div className="flex flex-col h-screen bg-pastel-bg text-sunriver-blue">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    );
  };

  return (
    <LanguageProvider>
      <AppProvider>
        {renderApp()}
      </AppProvider>
    </LanguageProvider>
  );
};

export default App;
