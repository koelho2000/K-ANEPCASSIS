import React from 'react';
import { useProject } from '../context/ProjectContext';
import { UT_DEFINITIONS } from '../data';
import { UtilizationType } from '../types';

const Tooltip = ({ text }: { text: string }) => (
  <div className="relative group inline-flex ml-2 align-middle z-50">
    <i className="fas fa-question-circle text-gray-300 hover:text-anepc-blue cursor-help transition-colors text-xs"></i>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2 bg-gray-800 text-white text-[11px] leading-tight rounded shadow-lg hidden group-hover:block z-50 pointer-events-none text-center font-normal">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const Module1Category: React.FC = () => {
  const { state, updateBuildingData } = useProject();
  const { building, category } = state;

  const handleUtChange = (ut: UtilizationType) => {
    updateBuildingData({ ut });
  };

  const getCategoryColor = (cat: number | null) => {
    switch (cat) {
      case 1: return "bg-green-100 text-green-800 border-green-200";
      case 2: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 3: return "bg-orange-100 text-orange-800 border-orange-200";
      case 4: return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const getRiskLabel = (cat: number | null) => {
    switch (cat) {
        case 1: return "Risco Reduzido";
        case 2: return "Risco Moderado";
        case 3: return "Risco Elevado";
        case 4: return "Risco Muito Elevado";
        default: return "-";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-gray-800">Definição da Categoria de Risco</h2>
                <p className="text-sm text-gray-500 mt-1">Selecione a Utilização-Tipo e insira os parâmetros do edifício</p>
             </div>
             
             {/* Result Box with Tooltip */}
             <div className="relative group z-10">
                 <div className={`px-6 py-3 rounded-lg border-2 ${getCategoryColor(category)} flex flex-col items-center min-w-[140px] cursor-help transition-all shadow-sm hover:shadow-md`}>
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70 flex items-center gap-1">
                        Resultado <i className="fas fa-info-circle text-[10px]"></i>
                    </span>
                    <span className="text-2xl font-bold">{category ? `${category}ª Cat` : '-'}</span>
                    <span className="text-[10px] font-bold mt-1 uppercase">{getRiskLabel(category)}</span>
                 </div>

                 {/* Hover Tooltip */}
                 <div className="absolute right-0 top-full mt-3 w-72 bg-gray-800 text-white text-xs rounded-lg shadow-xl p-4 hidden group-hover:block z-50 pointer-events-none">
                    <h4 className="font-bold border-b border-gray-600 pb-2 mb-2 text-gray-300">Níveis de Exigência SCIE</h4>
                    <ul className="space-y-2">
                         <li className="flex gap-2 items-start">
                            <span className="font-bold text-green-400 whitespace-nowrap">1.ª Cat:</span>
                            <span className="text-gray-300">Medidas padrão. Extintores e sinalização básicos.</span>
                         </li>
                         <li className="flex gap-2 items-start">
                            <span className="font-bold text-yellow-400 whitespace-nowrap">2.ª Cat:</span>
                            <span className="text-gray-300">Exige Rede de Incêndios (RIA) e resistência ao fogo aumentada.</span>
                         </li>
                         <li className="flex gap-2 items-start">
                            <span className="font-bold text-orange-400 whitespace-nowrap">3.ª Cat:</span>
                            <span className="text-gray-300">Deteção automática obrigatória, compartimentação e controlo de fumo.</span>
                         </li>
                         <li className="flex gap-2 items-start">
                            <span className="font-bold text-red-400 whitespace-nowrap">4.ª Cat:</span>
                            <span className="text-gray-300">Exigência máxima. Sprinklers e gestão de segurança complexa.</span>
                         </li>
                    </ul>
                    {/* Arrow */}
                    <div className="absolute right-10 -top-1 w-3 h-3 bg-gray-800 transform rotate-45"></div>
                </div>
             </div>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: UT Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                1. Utilização-Tipo Principal
                <Tooltip text="Classificação funcional do edifício (Art. 8º DL 220/2008). Determina os critérios para o cálculo da categoria." />
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {UT_DEFINITIONS.map((ut) => (
                <button
                  key={ut.id}
                  onClick={() => handleUtChange(ut.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    building.ut === ut.id
                      ? 'border-anepc-blue bg-blue-50 ring-1 ring-anepc-blue'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${building.ut === ut.id ? 'bg-anepc-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <i className={`fas ${ut.icon} text-xs`}></i>
                    </div>
                    <span className={`font-bold ${building.ut === ut.id ? 'text-anepc-blue' : 'text-gray-700'}`}>UT {ut.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{ut.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Factors */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">2. Fatores de Risco</h3>
            <div className="grid md:grid-cols-2 gap-6">
                
                {/* Height */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Altura do Edifício (m)
                        <Tooltip text="Diferença de cota entre o plano de referência e o último piso acima do solo suscetível de ocupação (Art. 2º DL 220/2008)." />
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            min="0"
                            step="0.1"
                            value={building.height || ''}
                            onChange={(e) => updateBuildingData({ height: parseFloat(e.target.value) })}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-anepc-blue focus:border-anepc-blue"
                            placeholder="0.0"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">m</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Distância vertical ao último piso ocupável.</p>
                </div>

                {/* Floors Below */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pisos Abaixo do Plano de Referência
                        <Tooltip text="Número de pisos total ou parcialmente enterrados. Influencia a classificação da categoria (ex: >3 pisos enterrados agrava a categoria)." />
                    </label>
                    <select 
                        value={building.floorsBelow}
                        onChange={(e) => updateBuildingData({ floorsBelow: parseInt(e.target.value) })}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-anepc-blue focus:border-anepc-blue"
                    >
                        {[0,1,2,3,4,5,6].map(n => (
                            <option key={n} value={n}>{n} {n === 1 ? 'piso' : 'pisos'}</option>
                        ))}
                    </select>
                </div>

                {/* Gross Area */}
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Área Bruta Total (m²)
                        <Tooltip text="Superfície total do pavimento dos espaços cobertos, delimitada pelas paredes exteriores. Fator crítico para UT II, VIII e XII." />
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            min="0"
                            value={building.grossArea || ''}
                            onChange={(e) => updateBuildingData({ grossArea: parseFloat(e.target.value) })}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-anepc-blue focus:border-anepc-blue"
                            placeholder="0"
                        />
                         <span className="absolute right-3 top-2 text-gray-400 text-sm">m²</span>
                    </div>
                </div>

                {/* Occupancy */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Efetivo Total (pessoas)
                        <Tooltip text="Número máximo de pessoas admissível no edifício. Base para cálculo de categorias em UT III, IV, V, VI, etc. (Art. 54º)." />
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            min="0"
                            value={building.occupancy || ''}
                            onChange={(e) => updateBuildingData({ occupancy: parseInt(e.target.value) })}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-anepc-blue focus:border-anepc-blue"
                            placeholder="0"
                        />
                         <span className="absolute right-3 top-2 text-gray-400 text-sm">pax</span>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module1Category;