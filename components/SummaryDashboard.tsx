import React from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULES, getTechnicalRequirements } from '../data';
import { RiskCategory } from '../types';

const SummaryDashboard: React.FC = () => {
    const { state, setCurrentModule } = useProject();

    // Helper to determine status icon
    const StatusIcon = ({ status }: { status: 'ok' | 'error' | 'empty' | 'info' }) => {
        switch (status) {
            case 'ok': return <i className="fas fa-check-circle text-green-500 text-lg"></i>;
            case 'error': return <i className="fas fa-times-circle text-red-500 text-lg"></i>;
            case 'info': return <i className="fas fa-info-circle text-blue-500 text-lg"></i>;
            default: return <i className="far fa-circle text-gray-300 text-lg"></i>;
        }
    };

    // Module Status Logic
    const getModuleStatus = (moduleId: number) => {
        switch (moduleId) {
            case 1: // Categoria
                return state.category ? 'ok' : 'empty';
            case 2: // Spaces
                return state.spaces.length > 0 ? 'ok' : 'empty';
            case 3: // Evacuation
                if (state.evacuationPaths.length === 0) return 'empty';
                const hasNonCompliant = state.evacuationPaths.some(p => !p.isCompliant);
                return hasNonCompliant ? 'error' : 'ok';
            case 4: // Widths
                return state.widthCalculations.length > 0 ? 'ok' : 'empty';
            case 7: // Smoke
                return state.smokeCalculations.length > 0 ? 'ok' : 'empty';
            default:
                // Technical modules depend on category being set
                return state.category ? 'info' : 'empty';
        }
    };

    const getModuleSummary = (moduleId: number) => {
        switch (moduleId) {
            case 1:
                return state.category ? `${state.category}ª Categoria de Risco` : 'Não definido';
            case 2:
                return `${state.spaces.length} espaços registados`;
            case 3:
                const nonCompliantCount = state.evacuationPaths.filter(p => !p.isCompliant).length;
                return nonCompliantCount > 0 
                    ? `${nonCompliantCount} caminhos não conformes` 
                    : `${state.evacuationPaths.length} caminhos verificados`;
            case 4:
                return `${state.widthCalculations.length} cálculos de saídas`;
            case 7:
                return `${state.smokeCalculations.length} zonas de desenfumagem`;
            default:
                return 'Requisitos técnicos aplicáveis';
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <i className="fas fa-clipboard-check text-anepc-blue"></i>
                        Resumo e Conformidade Global
                    </h2>
                    <p className="text-gray-500 mt-2">Visão geral do estado do projeto e verificação de critérios fundamentais.</p>
                </div>

                <div className="p-8">
                    {/* Key Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <p className="text-xs font-bold text-gray-500 uppercase">Utilização-Tipo</p>
                             <p className="text-xl font-bold text-gray-800">{state.building.ut}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <p className="text-xs font-bold text-gray-500 uppercase">Categoria</p>
                             <p className={`text-xl font-bold ${state.category ? 'text-gray-800' : 'text-gray-400'}`}>
                                 {state.category ? `${state.category}ª` : '-'}
                             </p>
                        </div>
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <p className="text-xs font-bold text-gray-500 uppercase">Efetivo</p>
                             <p className="text-xl font-bold text-gray-800">{state.building.occupancy}</p>
                        </div>
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <p className="text-xs font-bold text-gray-500 uppercase">Progresso</p>
                             <p className="text-xl font-bold text-anepc-blue">
                                 {Math.round((state.completedModules.length / (MODULES.length - 2)) * 100)}%
                             </p>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Estado dos Módulos</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        
                        {/* Modules List */}
                        <div className="space-y-3">
                             {MODULES.filter(m => m.id < 14).map(module => {
                                 const status = getModuleStatus(module.id);
                                 return (
                                     <div key={module.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all">
                                         <div className="flex items-center gap-3">
                                             <div className={`w-8 h-8 rounded flex items-center justify-center text-gray-500 bg-gray-50`}>
                                                 <i className={`fas ${module.icon}`}></i>
                                             </div>
                                             <div>
                                                 <p className="font-semibold text-sm text-gray-800">{module.title}</p>
                                                 <p className="text-xs text-gray-500">{getModuleSummary(module.id)}</p>
                                             </div>
                                         </div>
                                         <div className="flex items-center gap-3">
                                             <StatusIcon status={status as any} />
                                             <button 
                                                onClick={() => setCurrentModule(module.id)}
                                                className="text-gray-400 hover:text-anepc-blue transition-colors"
                                             >
                                                 <i className="fas fa-chevron-right"></i>
                                             </button>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>

                        {/* Technical Summary View */}
                        <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <i className="fas fa-list-ul text-anepc-blue"></i>
                                Síntese de Requisitos Técnicos
                            </h4>
                            
                            {!state.category ? (
                                <div className="text-center py-10 text-gray-400">
                                    <p>Defina a Categoria de Risco para ver a síntese técnica.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                                    {[5, 6, 8, 9, 11, 12, 13].map(modId => {
                                        const reqs = getTechnicalRequirements(modId, state);
                                        const modInfo = MODULES.find(m => m.id === modId);
                                        
                                        if (reqs.length === 0) return null;

                                        return (
                                            <div key={modId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                                <h5 className="text-xs font-bold uppercase text-anepc-blue mb-2">{modInfo?.title}</h5>
                                                <ul className="space-y-2">
                                                    {reqs.map((r, i) => (
                                                        <li key={i} className="flex justify-between text-sm items-start border-b border-gray-50 last:border-0 pb-1 last:pb-0">
                                                            <span className="text-gray-600 mr-2">{r.title}</span>
                                                            <span className="font-bold text-gray-800 text-right">{r.value}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryDashboard;