
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface HealthCheckPageProps {
  onSuccess: () => void;
}

const HealthCheckPage: React.FC<HealthCheckPageProps> = ({ onSuccess }) => {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    setMessage(t('healthCheck.checking'));
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'An unknown server error occurred.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(t('healthCheck.fetchError'));
      }
    };
    checkHealth();
  }, [t]);

  const StatusIcon: React.FC = () => {
      switch(status) {
          case 'checking':
              return <i className="fas fa-spinner fa-spin text-4xl text-sunriver-blue"></i>;
          case 'success':
              return <i className="fas fa-check-circle text-4xl text-green-500"></i>;
          case 'error':
              return <i className="fas fa-times-circle text-4xl text-red-500"></i>;
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pastel-bg bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1920/1080?blur=5')"}}>
      <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md m-4 text-center">
        <h1 className="text-2xl font-bold text-sunriver-blue mb-6">{t('healthCheck.title')}</h1>
        <div className="flex flex-col items-center space-y-4">
            <StatusIcon />
            <p className={`font-semibold ${status === 'error' ? 'text-red-700' : 'text-gray-700'}`}>{message}</p>
        </div>
        {status === 'success' && (
          <button
            onClick={onSuccess}
            className="mt-8 bg-sunriver-yellow hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 w-full"
          >
            {t('healthCheck.proceed')}
          </button>
        )}
        {status === 'error' && (
          <div className="mt-8 text-sm text-left bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-bold text-red-800">{t('healthCheck.troubleshootingTitle')}</h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-red-700">
                <li>{t('healthCheck.troubleshooting1')}</li>
                <li>{t('healthCheck.troubleshooting2')}</li>
                <li dangerouslySetInnerHTML={{ __html: t('healthCheck.troubleshooting3') }}></li>
                <li>{t('healthCheck.troubleshooting4')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCheckPage;
