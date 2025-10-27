
import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { Language } from '../types';

interface LoginPageProps {
  onLogin: () => void;
}

const logoSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAeNSURBVНомер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";


const LanguageButton: React.FC<{ lang: Language; currentLang: Language; setLang: (lang: Language) => void; flag: string }> = ({ lang, currentLang, setLang, flag }) => (
  <button
    onClick={() => setLang(lang)}
    className={`w-12 h-8 rounded-md overflow-hidden transition-all duration-200 ${currentLang === lang ? 'ring-2 ring-sunriver-yellow' : 'opacity-60 hover:opacity-100'}`}
  >
    <img src={flag} alt={`${lang} flag`} className="w-full h-full object-cover" />
  </button>
);


const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { language, setLanguage, t } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin2') {
      onLogin();
    } else {
      setError(t('login.invalidCredentials'));
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
              placeholder="admin"
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
              placeholder="admin2"
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-sunriver-yellow hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 w-full"
            >
              {t('login.loginButton')}
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
