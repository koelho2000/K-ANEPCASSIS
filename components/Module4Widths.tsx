import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { WidthCalculation } from '../types';

const Tooltip = ({ text }: { text: string }) => (
  <div className="relative group inline-flex ml-2 align-middle z-50">
    <i className="fas fa-question-circle text-gray-400 hover:text-anepc-blue cursor-help transition-colors text-[10px]"></i>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] leading-tight rounded shadow-lg hidden group-hover:block z-50 pointer-events-none text-center font-normal">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const Module4Widths: React.FC = () => {
  const { state, addWidthCalculation, removeWidthCalculation } = useProject();
  const [occupancy, setOccupancy] = useState<number | ''>('');
  const [calculationMode, setCalculationMode] = useState<'manual' | 'total' | 'space'>('manual');
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [calcName, setCalcName] = useState('');

  // Filter available spaces
  const availableSpaces = useMemo(() => {
      const usedSpaceIds = new Set(state.widthCalculations.map(c => c.sourceSpaceId).filter(Boolean));
      return state.spaces.filter(s => !usedSpaceIds.has(s.id));
  }, [state.spaces, state.widthCalculations]);

  // Auto-fill occupancy when switching modes
  useEffect(() => {
    if (calculationMode === 'total') {
        setOccupancy(state.building.occupancy);
        setCalcName('Total Edifício');
    } else if (calculationMode === 'space' && selectedSpaceId) {
        const space = state.spaces.find(s => s.id === selectedSpaceId);
        if (space) {
            setOccupancy(space.occupancy);
            setCalcName(space.name);
        }
    } else if (calculationMode === 'manual') {
        setCalcName('');
    }
  }, [calculationMode, state.building.occupancy, selectedSpaceId, state.spaces]);

  
  // Logic Art 54 & 56
  const calculateRequirements = (n: number) => {
    if (n <= 0) return { up: 0, width: 0, exits: 0 };
    
    // Width (UP)
    let up = 0;
    if (n <= 50) up = 1;
    else if (n <= 500) up = Math.ceil(n / 100) + 1; // Simplification of standard calc
    else up = Math.ceil(n / 100);

    // Meters
    let widthMeters = 0;
    if (up === 1) widthMeters = 0.9;
    else if (up === 2) widthMeters = 1.4;
    else widthMeters = up * 0.6;

    // Number of Exits
    let exits = 1;
    if (n > 50 && n <= 1500) exits = 2; // Basic rule, complex formula exists
    if (n > 1500) exits = 2 + Math.floor((n-1500)/500); // Rough Approx
    
    return { up, width: widthMeters, exits };
  };

  const reqs = calculateRequirements(Number(occupancy));

  const handleSpaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedSpaceId(e.target.value);
  };

  const handleSaveCalculation = () => {
      if(!calcName || !occupancy) {
          alert("Defina um nome e um valor de efetivo.");
          return;
      }

      const newCalc: WidthCalculation = {
          id: Date.now().toString(),
          name: calcName,
          sourceSpaceId: (calculationMode === 'space' && selectedSpaceId) ? selectedSpaceId : undefined,
          occupancy: Number(occupancy),
          up: reqs.up,
          width: reqs.width,
          exits: reqs.exits
      };
      
      addWidthCalculation(newCalc);
      
      // Reset if manual, otherwise keep settings
      if(calculationMode === 'manual') {
          setCalcName('');
          setOccupancy('');
      } else if (calculationMode === 'space') {
          setSelectedSpaceId('');
          setOccupancy('');
          setCalcName('');
      }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
           <h2 className="text-xl font-bold text-gray-800">Cálculo de Larguras e Saídas</h2>
           <p className="text-sm text-gray-500 mt-1">Unidades de Passagem (UP) e Nº de Saídas (Art. 54º e 56º)</p>
        </div>

        <div className="p-6">
            <div className="mb-6 grid md:grid-cols-2 gap-6">
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Origem dos Dados
                        <Tooltip text="Escolha entre inserção manual, o efetivo total do edifício ou de um espaço específico do Módulo 2." />
                     </label>
                     <div className="flex bg-gray-100 p-1 rounded-lg">
                         <button 
                            onClick={() => setCalculationMode('manual')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition ${calculationMode === 'manual' ? 'bg-white shadow text-anepc-blue' : 'text-gray-500 hover:text-gray-700'}`}
                         >
                             Manual
                         </button>
                         <button 
                            onClick={() => setCalculationMode('total')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition ${calculationMode === 'total' ? 'bg-white shadow text-anepc-blue' : 'text-gray-500 hover:text-gray-700'}`}
                         >
                             Total Edifício
                         </button>
                         <button 
                            onClick={() => setCalculationMode('space')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition ${calculationMode === 'space' ? 'bg-white shadow text-anepc-blue' : 'text-gray-500 hover:text-gray-700'}`}
                         >
                             Por Espaço
                         </button>
                     </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {calculationMode === 'manual' && 'Efetivo (Manual)'}
                        {calculationMode === 'total' && 'Efetivo Total (Módulo 1)'}
                        {calculationMode === 'space' && 'Selecionar Espaço (Módulo 2)'}
                        <Tooltip text="Número de pessoas que utilizam a saída. Base para o cálculo de UP e nº de saídas." />
                    </label>
                    
                    {calculationMode === 'space' ? (
                         <select 
                            value={selectedSpaceId} 
                            onChange={handleSpaceChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-anepc-blue focus:border-anepc-blue"
                         >
                            <option value="">
                                {availableSpaces.length === 0 ? '-- Todos os espaços já calculados --' : '-- Selecione um espaço --'}
                            </option>
                            {availableSpaces.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.occupancy} pax)</option>
                            ))}
                         </select>
                    ) : (
                        <input 
                            type="number" 
                            value={occupancy} 
                            onChange={(e) => {
                                setOccupancy(Number(e.target.value));
                                if(calculationMode !== 'manual') setCalculationMode('manual');
                            }}
                            readOnly={calculationMode === 'total'}
                            className={`w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-anepc-blue focus:border-anepc-blue ${calculationMode === 'total' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            placeholder="0"
                        />
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* UP Result */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center transition-all hover:shadow-md">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-anepc-blue shadow-sm">
                        <i className="fas fa-arrows-left-right"></i>
                    </div>
                    <span className="block text-sm text-gray-600 font-medium mb-1">Largura (UP)</span>
                    <span className="block text-4xl font-bold text-gray-800">{reqs.up} <span className="text-lg text-gray-500 font-normal">UP</span></span>
                </div>

                {/* Meters Result */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center transition-all hover:shadow-md">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-green-600 shadow-sm">
                        <i className="fas fa-ruler-horizontal"></i>
                    </div>
                    <span className="block text-sm text-gray-600 font-medium mb-1">Largura (Metros)</span>
                    <span className="block text-4xl font-bold text-gray-800">{reqs.width.toFixed(2)} <span className="text-lg text-gray-500 font-normal">m</span></span>
                </div>

                {/* Exits Result */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 text-center transition-all hover:shadow-md">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-orange-600 shadow-sm">
                        <i className="fas fa-door-open"></i>
                    </div>
                    <span className="block text-sm text-gray-600 font-medium mb-1">Nº Saídas Mínimo</span>
                    <span className="block text-4xl font-bold text-gray-800">{reqs.exits}</span>
                </div>
            </div>

            {/* Save Section */}
            <div className="mt-8 flex gap-4 border-t border-gray-100 pt-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Identificativo
                        <Tooltip text="Designação da saída (ex: Saída Principal, Saída de Emergência Traseira)." />
                    </label>
                    <input 
                        type="text" 
                        value={calcName}
                        onChange={e => setCalcName(e.target.value)}
                        placeholder="Ex: Saída Principal Piso 0"
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={handleSaveCalculation}
                        disabled={!occupancy}
                        className="bg-anepc-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
                    >
                        <i className="fas fa-plus mr-2"></i> Adicionar à Lista
                    </button>
                </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase">Regras de Conversão UP</h4>
                <ul className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <li className="flex items-center"><span className="w-2 h-2 bg-anepc-blue rounded-full mr-2"></span>1 UP = 0.90 m</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-anepc-blue rounded-full mr-2"></span>2 UP = 1.40 m</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-anepc-blue rounded-full mr-2"></span>N UP = N x 0.60 m</li>
                </ul>
            </div>
        </div>
      </div>

      {/* List of Saved Calculations */}
      {state.widthCalculations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700 flex justify-between items-center">
                  <span>Cálculos Guardados</span>
                  <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full">{state.widthCalculations.length}</span>
              </div>
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                          <th className="px-4 py-3">Nome</th>
                          <th className="px-4 py-3 text-right">Efetivo</th>
                          <th className="px-4 py-3 text-right">UP</th>
                          <th className="px-4 py-3 text-right">Largura (m)</th>
                          <th className="px-4 py-3 text-right">Saídas</th>
                          <th className="px-4 py-3"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {state.widthCalculations.map(calc => (
                          <tr key={calc.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{calc.name}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{calc.occupancy}</td>
                              <td className="px-4 py-3 text-right font-bold text-gray-800">{calc.up}</td>
                              <td className="px-4 py-3 text-right text-anepc-blue font-bold">{calc.width.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{calc.exits}</td>
                              <td className="px-4 py-3 text-right">
                                  <button 
                                      onClick={() => removeWidthCalculation(calc.id)}
                                      className="text-red-400 hover:text-red-600 transition-colors"
                                  >
                                      <i className="fas fa-trash"></i>
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}
    </div>
  );
};

export default Module4Widths;