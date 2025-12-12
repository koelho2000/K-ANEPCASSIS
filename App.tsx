import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';
import ProjectDetails from './components/ProjectDetails';
import ReportGenerator from './components/ReportGenerator';
import SearchModal from './components/SearchModal';
import LegislationViewer from './components/LegislationViewer';
import SummaryDashboard from './components/SummaryDashboard';

// Modules
import Module1Category from './components/Module1Category';
import Module2Spaces from './components/Module2Spaces';
import Module3Distances from './components/Module3Distances';
import Module4Widths from './components/Module4Widths';
import Module7Smoke from './components/Module7Smoke';
import RegulationViewer from './components/RegulationViewer';

const AppContent: React.FC = () => {
  const { state, setMode } = useProject();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen) {
        // Prevent if user is typing in an input
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // 1. Splash Screen Mode
  if (state.mode === 'splash') {
      return <SplashScreen />;
  }

  // 2. Project Details Mode
  if (state.mode === 'project_details') {
      return <ProjectDetails />;
  }

  // 3. Report Mode
  if (state.mode === 'report') {
      return (
        <div className="bg-gray-50 min-h-screen p-8">
            <ReportGenerator />
        </div>
      );
  }

  // 4. Modules Mode (Main App Layout)
  const renderModule = () => {
    switch (state.currentModule) {
      case 1: return <Module1Category />;
      case 2: return <Module2Spaces />;
      case 3: return <Module3Distances />;
      case 4: return <Module4Widths />;
      case 7: return <Module7Smoke />;
      case 14: return <LegislationViewer />;
      case 15: return <SummaryDashboard />; // New Summary Dashboard
      default: return <RegulationViewer />;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
      // For mobile:
      if (!isSidebarOpen) {
        sidebar.style.transform = 'translateX(0)';
      } else {
        sidebar.style.transform = ''; // Reset to CSS default
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-800">
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Header Mobile - Only visible on small screens */}
      <div className="md:hidden fixed top-0 w-full bg-white z-50 border-b border-gray-200 h-16 flex items-center px-4 justify-between shadow-sm">
         <span className="font-bold text-anepc-blue flex items-center gap-2">
             <i className="fas fa-shield-alt"></i> SCIE
         </span>
         <div className="flex items-center gap-2">
             <button onClick={() => setIsSearchOpen(true)} className="text-gray-500 p-2"><i className="fas fa-search"></i></button>
             <button onClick={toggleSidebar} className="text-gray-500 p-2"><i className="fas fa-bars"></i></button>
         </div>
      </div>

      {/* Header Desktop */}
      <div className="hidden md:flex fixed top-0 w-full bg-white z-40 border-b border-gray-200 h-16 items-center px-6 justify-between shadow-sm">
         <div className="flex items-center gap-3">
             <div className="bg-anepc-blue text-white p-1.5 rounded">
                <i className="fas fa-shield-alt text-lg"></i>
             </div>
             <div>
                 <h1 className="font-bold text-gray-800 leading-tight">K-ANEPCASSIS</h1>
                 <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">ANEPC • v2.1.0</p>
             </div>
         </div>
         <div className="flex items-center gap-4">
             {/* Search Button */}
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-all w-64 text-left"
                title="Atalho: / ou Ctrl+K"
             >
                <i className="fas fa-search"></i>
                <span className="opacity-70">Pesquisar...</span>
                <span className="ml-auto text-xs border border-gray-300 rounded px-1.5 bg-white text-gray-400">/</span>
             </button>

             <div className="text-right hidden lg:block">
                 <p className="text-xs font-bold text-gray-700">{state.projectName || 'Projeto'}</p>
                 <p className="text-[10px] text-gray-400">{state.projectLocation || 'Localização'}</p>
             </div>
             
             <button 
                 onClick={() => setMode('report')}
                 className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded shadow-sm transition-colors flex items-center gap-2"
             >
                 <i className="fas fa-file-alt"></i>
                 GERAR RELATÓRIO
             </button>

             <button onClick={() => setMode('splash')} className="text-gray-400 hover:text-anepc-blue transition-colors ml-2" title="Sair">
                 <i className="fas fa-sign-out-alt"></i>
             </button>
         </div>
      </div>

      {/* Sidebar - Hidden on mobile unless toggled */}
      <div id="sidebar" className="hidden md:block h-full pt-16 transition-transform duration-300 transform -translate-x-full md:translate-x-0 z-30 fixed md:relative w-64 bg-white border-r border-gray-200">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto pt-20 md:pt-20 bg-gray-50 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 mb-20">
           {renderModule()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
};

export default App;