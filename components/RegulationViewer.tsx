import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULES, getTechnicalRequirements, calculateSpaceEquipment } from '../data';
import { Space, RiskLocation } from '../types';

// --- TECHNICAL GUIDES CONTENT (Textual Reference) ---
const TECHNICAL_GUIDES: Record<number, { title: string; content: React.ReactNode }> = {
    8: { 
        title: "Guia de Meios de Socorro (Extintores e RIA)",
        content: (
            <div className="space-y-4 text-sm text-gray-600">
                <p><strong>Critérios de Dotação (Art. 163º):</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                     <li>Distância máxima a percorrer até um extintor: <strong>15 metros</strong>.</li>
                     <li>Área máxima de cobertura por extintor: Aprox. <strong>200 m²</strong> (recomendação técnica para garantir os 15m).</li>
                     <li>Tipos: <strong>ABC</strong> (Pó Químico) para uso geral; <strong>CO2</strong> para quadros elétricos e cozinhas; <strong>ABF/Manta</strong> para gorduras.</li>
                </ul>
            </div>
        )
    },
    9: { 
        title: "Guia de Portas e Compartimentação",
        content: (
            <div className="space-y-4 text-sm text-gray-600">
                <p><strong>Resistência e Ferragens (Art. 50º-54º):</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                     <li><strong>Barra Antipânico:</strong> Obrigatória em saídas de locais com > 50 pessoas.</li>
                     <li><strong>Portas Corta-Fogo (EI):</strong> Isolam locais de risco C (60 min) e vias de evacuação protegidas.</li>
                     <li><strong>Molas (C):</strong> Fecho automático obrigatório em portas resistentes ao fogo.</li>
                </ul>
            </div>
        )
    },
    11: { 
        title: "Guia de Deteção de Incêndio (SADI)",
        content: (
            <div className="space-y-4 text-sm text-gray-600">
                <p><strong>Cobertura e Tipologia:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                     <li><strong>Detetores Óticos (Fumo):</strong> ~60 a 80 m² de cobertura. Uso geral.</li>
                     <li><strong>Detetores Térmicos (Calor):</strong> ~30 a 40 m² de cobertura. Cozinhas, garagens, zonas de vapores.</li>
                     <li><strong>Botoneiras:</strong> Junto a todas as saídas de piso e saídas para o exterior.</li>
                </ul>
            </div>
        )
    },
    12: { 
        title: "Guia de Extinção Automática",
        content: (
            <div className="space-y-4 text-sm text-gray-600">
                 <p><strong>Critérios de Obrigatoriedade:</strong></p>
                 <ul className="list-disc pl-5 space-y-1">
                     <li><strong>Sprinklers:</strong> Parques de estacionamento cobertos (> piso -1), Palcos > 100m², Centros Comerciais.</li>
                     <li><strong>Gases Limpos:</strong> Salas de servidores (CPD), arquivos de valor histórico (onde a água danifica).</li>
                     <li><strong>Hottes:</strong> Sistemas fixos para cozinhas profissionais > 20kW.</li>
                </ul>
            </div>
        )
    },
    13: { 
        title: "Guia de Sinalização e Iluminação",
        content: (
            <div className="space-y-4 text-sm text-gray-600">
                 <p><strong>Distribuição:</strong></p>
                 <ul className="list-disc pl-5 space-y-1">
                     <li><strong>Blocos Autónomos:</strong> Junto a saídas, mudanças de direção, extintores e quadros elétricos.</li>
                     <li><strong>Iluminação Ambiente (Anti-pânico):</strong> Salas > 60 m² ou > 50 pessoas.</li>
                     <li><strong>Sinalética:</strong> Fotoluminescente sobre portas de saída e meios de combate.</li>
                </ul>
            </div>
        )
    }
};

const RegulationViewer: React.FC = () => {
  const { state } = useProject();
  const [activeTab, setActiveTab] = useState<'general' | 'calculator' | 'guide'>('calculator');
  
  const currentModuleDef = MODULES.find(m => m.id === state.currentModule);
  const requirements = getTechnicalRequirements(state.currentModule, state);
  const guide = TECHNICAL_GUIDES[state.currentModule];
  
  // Logic to determine if we should show the calculator
  const showCalculator = [8, 9, 11, 12, 13].includes(state.currentModule);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[600px]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-anepc-blue rounded-lg flex items-center justify-center text-xl shadow-sm">
                    <i className={`fas ${currentModuleDef?.icon}`}></i>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{currentModuleDef?.title}</h2>
                    <p className="text-gray-500 text-sm">Regulamentação Técnica e Cálculo de Equipamentos</p>
                </div>
            </div>

            {/* Context Stats */}
            <div className="flex gap-2 text-xs">
                 <div className="bg-gray-100 px-3 py-1 rounded text-gray-600 font-medium border border-gray-200">
                     UT {state.building.ut}
                 </div>
                 <div className="bg-gray-100 px-3 py-1 rounded text-gray-600 font-medium border border-gray-200">
                     {state.category ? `${state.category}ª Categoria` : 'Cat. N/D'}
                 </div>
            </div>
        </div>

        {/* Tabs */}
        {showCalculator ? (
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('calculator')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'calculator' ? 'border-anepc-blue text-anepc-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <i className="fas fa-calculator"></i> Cálculo de Equipamentos
                </button>
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'general' ? 'border-anepc-blue text-anepc-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <i className="fas fa-list-ul"></i> Requisitos Gerais
                </button>
                <button 
                    onClick={() => setActiveTab('guide')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'guide' ? 'border-anepc-blue text-anepc-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <i className="fas fa-book-reader"></i> Guia Técnico
                </button>
            </div>
        ) : null}

        {/* --- TAB: CALCULATOR (Detailed Quantities per Space) --- */}
        {showCalculator && activeTab === 'calculator' && (
             <div className="animate-fade-in">
                 {state.spaces.length > 0 ? (
                     <div className="overflow-x-auto border border-gray-200 rounded-lg">
                         <table className="w-full text-sm text-left">
                             <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                 <tr>
                                     <th className="px-4 py-3 w-1/4">Espaço / Local</th>
                                     <th className="px-4 py-3 w-1/6 text-center">Área / Risco</th>
                                     <th className="px-4 py-3">Quantidades e Tipos Calculados</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                                 {state.spaces.map(space => {
                                     const equipment = calculateSpaceEquipment(space, state.currentModule);
                                     
                                     return (
                                         <tr key={space.id} className="hover:bg-gray-50">
                                             <td className="px-4 py-3 align-top">
                                                 <p className="font-bold text-gray-800">{space.name}</p>
                                                 <p className="text-xs text-gray-500 capitalize">{space.type.replace(/_/g, ' ')}</p>
                                             </td>
                                             <td className="px-4 py-3 text-center align-top">
                                                 <div className="inline-block bg-gray-100 px-2 py-1 rounded mb-1 text-xs font-mono">{space.area} m²</div>
                                                 <div className={`text-xs font-bold px-2 py-0.5 rounded ${space.riskClass === 'F' ? 'bg-gray-800 text-white' : space.riskClass === 'C' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                                     Risco {space.riskClass}
                                                 </div>
                                             </td>
                                             <td className="px-4 py-3">
                                                 {equipment.length > 0 ? (
                                                     <div className="flex flex-wrap gap-2">
                                                         {equipment.map((item, i) => (
                                                             <div key={i} className="flex items-center bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                                                                 <div className={`px-3 py-2 text-xs font-bold ${item.typeClass || 'bg-gray-100'}`}>
                                                                     {item.quantity} <span className="text-[9px] font-normal opacity-75">{item.unit}</span>
                                                                 </div>
                                                                 <div className="px-3 py-2 text-sm text-gray-700 border-l border-gray-100 flex flex-col justify-center">
                                                                     <span className="leading-tight font-medium">{item.name}</span>
                                                                     {item.reason && <span className="text-[10px] text-gray-400 leading-none mt-0.5">{item.reason}</span>}
                                                                 </div>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 ) : (
                                                     <span className="text-gray-400 italic text-xs">Sem requisitos específicos calculados.</span>
                                                 )}
                                             </td>
                                         </tr>
                                     );
                                 })}
                             </tbody>
                         </table>
                     </div>
                 ) : (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <i className="fas fa-cubes text-4xl mb-3 opacity-30"></i>
                        <p>Adicione espaços no <strong>Módulo 2</strong> para gerar a lista de equipamentos.</p>
                        <button onClick={() => window.location.hash = '#'} className="mt-4 text-anepc-blue underline text-sm">Ir para Módulo 2</button>
                    </div>
                 )}
                 <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 flex gap-2 items-start">
                     <i className="fas fa-info-circle mt-0.5"></i>
                     <p><strong>Nota:</strong> Estas quantidades são estimativas automáticas baseadas em rácios de área (ex: 1 extintor/200m², 1 detetor/60m²) e tipologia. A localização final deve ser validada em projeto.</p>
                 </div>
             </div>
        )}

        {/* --- TAB: GENERAL REQUIREMENTS --- */}
        {(!showCalculator || activeTab === 'general') && (
            <div className="animate-fade-in">
                {requirements.length > 0 ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 flex items-start gap-3">
                             <i className="fas fa-info-circle text-anepc-blue mt-0.5"></i>
                             <p className="text-sm text-blue-900">Estes são os requisitos mínimos aplicáveis ao edifício como um todo, baseados na Categoria de Risco.</p>
                        </div>
                        {requirements.map((req, index) => (
                            <div key={index} className="flex flex-col md:flex-row md:items-center bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-lg">{req.title}</h4>
                                        <p className="text-gray-600 mt-1">{req.description}</p>
                                    </div>
                                    <div className="mt-3 md:mt-0 md:ml-6 flex-shrink-0">
                                        <span className="inline-block px-4 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg border border-gray-200 shadow-sm">
                                            {req.value}
                                        </span>
                                    </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <i className="fas fa-exclamation-triangle text-4xl mb-3 opacity-30"></i>
                        <p>Preencha a Categoria de Risco (Módulo 1) para ver os requisitos gerais.</p>
                    </div>
                )}
            </div>
        )}

        {/* --- TAB: TECHNICAL GUIDE --- */}
        {showCalculator && activeTab === 'guide' && guide && (
             <div className="animate-fade-in bg-white">
                 <div className="prose prose-sm max-w-none text-gray-600">
                     {guide.content}
                 </div>
                 <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-100 flex gap-3">
                    <i className="fas fa-graduation-cap mt-0.5"></i>
                    <p>Este guia resume as boas práticas e definições do regulamento. Para dimensionamento exato (hidráulico, elétrico), consulte os projetos de especialidade.</p>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default RegulationViewer;