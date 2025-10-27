
import React from 'react';
import type { Page } from '../App';
import { useLanguage } from '../hooks/useLanguage';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const logoSrc = "/logo2.png";


const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onLogout }) => {
  const { t } = useLanguage();

  const navItems: { page: Page; icon: string; labelKey: string }[] = [
    { page: 'Home', icon: 'fas fa-home', labelKey: 'sidebar.home' },
    { page: 'RoomStatus', icon: 'fas fa-bed', labelKey: 'sidebar.roomStatus' },
    { page: 'Dashboard', icon: 'fas fa-chart-line', labelKey: 'sidebar.dashboard' },
    { page: 'Cleaning', icon: 'fas fa-broom', labelKey: 'sidebar.cleaning' },
    { page: 'Receipt', icon: 'fas fa-receipt', labelKey: 'sidebar.receipt' },
  ];

  return (
    <header className="w-full h-20 bg-sunriver-yellow text-sunriver-blue flex items-center justify-between px-4 md:px-8 shadow-lg z-20 shrink-0">
      {/* Left section: Logo and Title */}
      <div className="flex items-center">
        <img src={logoSrc} alt="Sunriver Hotel Logo" className="h-12 w-12 rounded-full object-cover" />
        <h1 className="hidden md:block text-2xl font-bold ml-4 whitespace-nowrap">Sunriver Hotel</h1>
      </div>

      {/* Center section: Navigation links */}
      <nav>
        <ul className="flex items-center space-x-1 md:space-x-4">
          {navItems.map((item) => (
            <li key={item.page}>
              <button
                onClick={() => setCurrentPage(item.page)}
                className={`flex items-center p-2 md:px-3 md:py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === item.page
                    ? 'bg-sunriver-blue text-white'
                    : 'hover:bg-sunriver-blue/20'
                }`}
              >
                <i className={`${item.icon} text-lg md:text-base`}></i>
                <span className="hidden md:inline ml-2 text-sm font-medium">{t(item.labelKey)}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Right section: Logout button */}
      <div>
        <button
          onClick={onLogout}
          className="flex items-center p-2 md:px-3 md:py-2 rounded-lg transition-colors duration-200 hover:bg-sunriver-blue/20"
        >
          <i className="fas fa-sign-out-alt text-lg md:text-base"></i>
          <span className="hidden md:inline ml-2 text-sm font-medium">{t('sidebar.logout')}</span>
        </button>
      </div>
    </header>
  );
};

export default Sidebar;