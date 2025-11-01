import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';

const DemoModeBanner = () => {
  const navigate = useNavigate();
  const isDemoMode = sessionStorage.getItem('demo_mode') === 'true';

  if (!isDemoMode) return null;

  const exitDemoMode = () => {
    sessionStorage.removeItem('demo_mode');
    navigate('/demo');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-bold">🎭 Mode Démonstration Actif</p>
            <p className="text-sm text-white/90">
              Vous pouvez accéder à toutes les pages sans restriction
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/demo')}
            className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-all"
          >
            Retour à la démo
          </button>
          <button
            onClick={exitDemoMode}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all flex items-center space-x-2"
            title="Quitter le mode démo"
          >
            <X className="w-4 h-4" />
            <span>Quitter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoModeBanner;
