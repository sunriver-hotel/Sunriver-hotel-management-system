import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { Language } from '../types';

// Correctly reference the logo from the public folder as a string path
const logoSrc = "/logo.png";

interface LoginPageProps {
  onLogin: () => void;
}

const LanguageButton: React.FC<{ lang: Language; currentLang: Language; setLang: (lang: Language) => void; flag: string }> = ({ lang, currentLang, setLang, flag }) => (
  <button
    onClick={() => setLang(lang)}
    className={`w-12 h-8 rounded-md overflow-hidden transition-all duration-200 ${currentLang === lang ? 'ring-2 ring-sunriver-yellow' : 'opacity-60 hover:opacity-100'}`}
  >
    <img src={flag} alt={`${lang} flag`} className="w-full h-full object-cover" />
  </button>
);


const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin2');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();

      if (response.ok) {
        onLogin();
      } else {
        setError(data.message || t('login.invalidCredentials'));
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pastel-bg bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1920/1080?blur=5')"}}>
      <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md m-4">
        <div className="text-center mb-8">
            <img src={logoSrc} alt="Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg"/>
            <h1 className="text-3xl font-bold text-sunriver-blue">{t('login.title')}</h1>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sunriver-blue text-sm font-bold mb-2" htmlFor="username">
              {t('login.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-sunriver-yellow"
              placeholder="Username"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sunriver-blue text-sm font-bold mb-2" htmlFor="password">
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-sunriver-yellow"
              placeholder="Password"
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-sunriver-yellow hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 w-full disabled:bg-gray-400"
            >
              {isLoading ? 'Logging in...' : t('login.loginButton')}
            </button>
          </div>
        </form>
        <div className="mt-8 flex justify-center items-center space-x-4">
            <LanguageButton lang="en" currentLang={language} setLang={setLanguage} flag="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" />
            <LanguageButton lang="th" currentLang={language} setLang={setLanguage} flag="https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
