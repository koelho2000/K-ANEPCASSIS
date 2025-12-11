import React from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULES, getTechnicalRequirements } from '../data';

const RegulationViewer: React.FC = () => {
  const { state } = useProject();
  const currentModuleDef = MODULES.find(m => m.id === state.currentModule);

  const requirements = getTechnicalRequirements(state.currentModule, state);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-blue-50 text-anepc-blue rounded-lg flex items-center justify-center text-xl">
                <i className={`fas ${currentModuleDef?.icon}`}></i>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentModuleDef?.title}</h2>
                <p className="text-gray-500">Requisitos Técnicos SCIE</p>
            </div>
        </div>

        {/* Project Context Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
             <div className="bg-gray-50 p-3 rounded border border-gray-100">
                 <span className="text-xs text-gray-400 uppercase font-bold block">Utilização-Tipo</span>
                 <span className="font-bold text-gray-700">{state.building.ut}</span>
             </div>
             <div className="bg-gray-50 p-3 rounded border border-gray-100">
                 <span className="text-xs text-gray-400 uppercase font-bold block">Categoria Risco</span>
                 <span className="font-bold text-gray-700">{state.category ? `${state.category}ª` : 'N/A'}</span>
             </div>
             <div className="bg-gray-50 p-3 rounded border border-gray-100">
                 <span className="text-xs text-gray-400 uppercase font-bold block">Altura</span>
                 <span className="font-bold text-gray-700">{state.building.height} m</span>
             </div>
        </div>

        {requirements.length > 0 ? (
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-list-check text-anepc-blue"></i>
                    Exigências Regulamentares
                </h3>
                <div className="space-y-4">
                    {requirements.map((req, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-center bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                             <div className="flex-1">
                                 <h4 className="font-bold text-gray-800">{req.title}</h4>
                                 <p className="text-sm text-gray-500 mt-1">{req.description}</p>
                             </div>
                             <div className="mt-3 md:mt-0 md:ml-6 flex-shrink-0">
                                 <span className="inline-block px-4 py-2 bg-blue-50 text-anepc-blue font-bold rounded border border-blue-100 text-sm">
                                     {req.value}
                                 </span>
                             </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-100 flex gap-3">
                    <i className="fas fa-info-circle mt-0.5"></i>
                    <p>Estes requisitos serão incluídos automaticamente no relatório final. Verifique sempre a legislação completa (DL 220/2008 e Portaria 135/2020) para exceções específicas.</p>
                </div>
            </div>
        ) : (
            <div className="text-center py-12 text-gray-500">
                <i className="fas fa-hard-hat text-4xl mb-3 opacity-30"></i>
                <p>Preencha a Categoria de Risco (Módulo 1) para ver os requisitos.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default RegulationViewer;