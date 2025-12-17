import React, { useRef } from 'react';
import { MODULES } from '../data';
import { useProject } from '../context/ProjectContext';
import { ProjectState } from '../types';

const Sidebar: React.FC = () => {
  const { state, setCurrentModule, loadProject, resetProject } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const progress = Math.round((state.completedModules.length / MODULES.length) * 100);

  const handleSaveJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `SCIE_${(state.projectName || 'projeto').replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleLoadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
           const json: ProjectState = JSON.parse(text);
           // Basic validation
           if (json.building && Array.isArray(json.spaces)) {
               loadProject(json);
               alert("Projeto carregado com sucesso!");
           } else {
               alert("Ficheiro inválido.");
           }
        }
      } catch (error) {
          console.error(error);
          alert("Erro ao ler o ficheiro.");
      }
    };
    reader.readAsText(fileObj);
    // Reset input
    event.target.value = '';
  };

  const handleNewProject = () => {
      if (window.confirm("Tem a certeza? Isto irá apagar todos os dados do projeto atual.")) {
          resetProject();
      }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-16 bottom-0 overflow-y-auto print-only:hidden pb-16 z-40 shadow-xl md:shadow-none">
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Progresso</h4>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
          <div 
            className="bg-anepc-blue h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 text-right">{progress}% Concluído</p>
      </div>
      
      <nav className="flex-1 p-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Módulos SCIE</h4>
        <ul className="space-y-1">
          {MODULES.map((module) => {
            const isActive = state.currentModule === module.id;
            const isCompleted = state.completedModules.includes(module.id);
            const isDisabled = module.id > 1 && state.category === null;
            
            return (
              <li key={module.id}>
                <button
                  onClick={() => !isDisabled && setCurrentModule(module.id)}
                  disabled={isDisabled}
                  className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-anepc-blue text-white shadow-md' 
                      : isDisabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                    <i className={`fas ${module.icon} text-xs`}></i>
                  </div>
                  <span className="flex-1 text-left font-medium">{module.title}</span>
                  {isCompleted && !isActive && (
                    <i className="fas fa-check-circle text-green-500 ml-2"></i>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Projeto Atual</p>
          <p className="text-xs text-gray-800 truncate font-bold">{state.projectName || '-'}</p>
          <p className="text-[10px] text-gray-500">Cat: <strong>{state.category || '-'}</strong></p>
        </div>

        <div className="grid grid-cols-3 gap-2">
            <button 
                onClick={handleNewProject}
                className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                title="Novo Projeto (Limpar)"
            >
                <i className="fas fa-file mb-1 text-gray-400"></i>
                <span className="text-[10px] font-bold">Novo</span>
            </button>
            <button 
                onClick={handleSaveJSON}
                className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 hover:text-anepc-blue transition-all"
                title="Gravar Projeto (JSON)"
            >
                <i className="fas fa-save mb-1 text-gray-400"></i>
                <span className="text-[10px] font-bold">Gravar</span>
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 hover:text-anepc-blue transition-all"
                title="Abrir Projeto (JSON)"
            >
                <i className="fas fa-folder-open mb-1 text-gray-400"></i>
                <span className="text-[10px] font-bold">Abrir</span>
            </button>
        </div>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLoadJSON} 
            accept=".json" 
            className="hidden" 
        />
      </div>
    </div>
  );
};

export default Sidebar;