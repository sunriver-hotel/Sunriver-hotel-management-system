
import React from 'react';
import type { Page } from '../App';
import { useLanguage } from '../hooks/useLanguage';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const logoSrc = "assets/logo2.png";


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
    <div className="w-16 md:w-64 bg-sunriver-yellow text-sunriver-blue flex flex-col transition-all duration-300">
      <div className="flex items-center justify-center md:justify-start p-4 h-20 border-b border-sunriver-blue/20">
        <img src={logoSrc} alt="Sunriver Hotel Logo" className="h-10 w-10 rounded-full" />
        <h1 className="hidden md:block text-xl font-bold ml-4 whitespace-nowrap">Sunriver Hotel</h1>
      </div>
      <nav className="flex-1 mt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.page}>
              <button
                onClick={() => setCurrentPage(item.page)}
                className={`flex items-center w-full p-4 my-1 transition-colors duration-200 ${
                  currentPage === item.page
                    ? 'bg-sunriver-blue text-white'
                    : 'hover:bg-sunriver-blue/20'
                }`}
              >
                <i className={`${item.icon} w-8 text-center text-lg`}></i>
                <span className="hidden md:inline ml-4 font-medium">{t(item.labelKey)}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-sunriver-blue/20">
        <button
          onClick={onLogout}
          className="flex items-center w-full p-4 transition-colors duration-200 hover:bg-sunriver-blue/20"
        >
          <i className="fas fa-sign-out-alt w-8 text-center text-lg"></i>
          <span className="hidden md:inline ml-4 font-medium">{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;