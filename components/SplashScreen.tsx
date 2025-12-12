import React from 'react';
import { useProject } from '../context/ProjectContext';

const SplashScreen: React.FC = () => {
  const { setMode } = useProject();

  const handleEnter = () => {
    setMode('project_details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/20 text-center max-w-lg w-full">
        
        <div className="mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg text-blue-900">
                <i className="fas fa-shield-alt text-5xl"></i>
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">K-ANEPCASSIS</h1>
            <p className="text-blue-100 text-lg">Autoridade Nacional de Emergência e Proteção Civil</p>
        </div>

        <div className="space-y-6 mb-10">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-blue-200">Versão</span>
                    <span className="font-mono font-bold">v2.1.0</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-blue-200">Data</span>
                    <span className="font-mono">{new Date().toLocaleDateString('pt-PT')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-200">Licença</span>
                    <span>Uso Profissional</span>
                </div>
            </div>

            <div className="text-sm opacity-80">
                <p className="mb-1">Desenvolvido por <span className="font-bold">koelho2000</span></p>
                <a href="https://www.koelho2000.com" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-colors border-b border-blue-300/50 hover:border-white">
                    www.koelho2000.com
                </a>
            </div>
        </div>

        <button 
            onClick={handleEnter}
            className="w-full bg-white text-blue-900 font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-blue-50 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 text-lg"
        >
            <span>Iniciar Aplicação</span>
            <i className="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div className="absolute bottom-6 text-blue-300/60 text-xs">
         © {new Date().getFullYear()} K-ANEPCASSIS. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default SplashScreen;