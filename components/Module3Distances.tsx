import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { EvacuationPath, RiskLocation } from '../types';

const Tooltip = ({ text }: { text: string }) => (
  <div className="relative group inline-flex ml-2 align-middle z-50">
    <i className="fas fa-question-circle text-gray-400 hover:text-anepc-blue cursor-help transition-colors text-[10px]"></i>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] leading-tight rounded shadow-lg hidden group-hover:block z-50 pointer-events-none text-center font-normal">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const Module3Distances: React.FC = () => {
  const { state, addEvacuationPath, updateEvacuationPath, removeEvacuationPath } = useProject();
  
  // Input states
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [name, setName] = useState('');
  const [pathType, setPathType] = useState('local'); // local, interior, exterior
  const [config, setConfig] = useState('impasse'); // impasse, distinct
  const [actualDistance, setActualDistance] = useState<number | ''>('');
  const [isRiskD, setIsRiskD] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Manual Override states
  const [manualOverride, setManualOverride] = useState(false);
  const [manualIsCompliant, setManualIsCompliant] = useState(true);

  // Filter available spaces
  const availableSpaces = useMemo(() => {
      const usedSpaceIds = new Set(state.evacuationPaths.map(p => p.sourceSpaceId).filter(Boolean));
      return state.spaces.filter(s => 
          !usedSpaceIds.has(s.id) || s.id === selectedSpaceId // Allow current selection if editing or re-selecting
      );
  }, [state.spaces, state.evacuationPaths, selectedSpaceId]);

  // Regulation Logic (Art 57 & 61)
  const calculateMaxDistance = () => {
    let limit = 0;
    
    if (pathType === 'local') {
        // Art 57 - Locais de permanência
        if (config === 'impasse') limit = 15;
        else limit = 30;
    } else if (pathType === 'interior') {
        // Art 61 - Vias horizontais interiores
        if (config === 'impasse') {
             limit = isRiskD ? 10 : 15;
        } else {
             limit = 30; // Simplified
        }
    } else if (pathType === 'exterior') {
         // Art 61 - Vias horizontais exteriores
         if (config === 'impasse') limit = 30;
         else limit = 60;
    }

    return limit;
  };

  const limit = calculateMaxDistance();
  const calculatedIsCompliant = actualDistance !== '' && Number(actualDistance) <= limit;
  
  // Final compliance status (Manual or Calculated)
  const isCompliant = manualOverride ? manualIsCompliant : calculatedIsCompliant;

  const handleSpaceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const spaceId = e.target.value;
    setSelectedSpaceId(spaceId);
    
    if (spaceId) {
        const space = state.spaces.find(s => s.id === spaceId);
        if (space) {
            setName(`${space.name} (Evacuação)`);
            // Automatically detect Risk D or E context
            const isHighRisk = space.riskClass === RiskLocation.D || space.riskClass === RiskLocation.E;
            setIsRiskD(isHighRisk);
            setPathType('local'); // Default to local as we selected a space
        }
    }
  };

  const handleSavePath = () => {
      if (!name || actualDistance === '') {
          alert('Por favor preencha o nome e a distância.');
          return;
      }

      const pathData: EvacuationPath = {
          id: isEditing || Date.now().toString(),
          name,
          sourceSpaceId: selectedSpaceId || undefined,
          type: pathType,
          config,
          distance: Number(actualDistance),
          maxDistance: limit,
          isCompliant: isCompliant
      };

      if (isEditing) {
          updateEvacuationPath(pathData);
          setIsEditing(null);
      } else {
          addEvacuationPath(pathData);
      }
      
      resetForm();
  };

  const startEdit = (path: EvacuationPath) => {
      setIsEditing(path.id);
      setName(path.name);
      setPathType(path.type);
      setConfig(path.config);
      setActualDistance(path.distance);
      setSelectedSpaceId(path.sourceSpaceId || '');
      
      // Infer Risk D/E based on standard limit diffs (10m limit in impasse interior means Risk D)
      // This is an approximation since we don't store "isRiskD" boolean in the path object directly
      const inferredRiskD = (path.type === 'interior' && path.config === 'impasse' && path.maxDistance === 10);
      setIsRiskD(inferredRiskD);

      // Check if there was a manual override
      const calculatedComp = path.distance <= path.maxDistance;
      if (path.isCompliant !== calculatedComp) {
          setManualOverride(true);
          setManualIsCompliant(path.isCompliant);
      } else {
          setManualOverride(false);
          setManualIsCompliant(true);
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
      setName('');
      setActualDistance('');
      setSelectedSpaceId('');
      setManualOverride(false);
      setManualIsCompliant(true);
      setIsEditing(null);
      setPathType('local');
      setConfig('impasse');
      setIsRiskD(false);
  };

  const getPathTypeLabel = (type: string) => {
      switch(type) {
          case 'local': return 'Local Permanência';
          case 'interior': return 'Via Interior';
          case 'exterior': return 'Via Exterior';
          default: return type;
      }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
           <div>
               <h2 className="text-xl font-bold text-gray-800">
                   {isEditing ? 'Editar Percurso de Evacuação' : 'Cálculo de Distâncias de Evacuação'}
               </h2>
               <p className="text-sm text-gray-500 mt-1">Verificação regulamentar (Art. 57º e 61º)</p>
           </div>
           {isEditing && (
               <button onClick={resetForm} className="text-sm text-gray-500 hover:text-red-500 underline">
                   Cancelar Edição
               </button>
           )}
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                {/* Integration with Module 2 */}
                {!isEditing && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">
                            <i className="fas fa-magic mr-1"></i> Importar de Espaço Existente
                            <Tooltip text="Preenche automaticamente os campos com base num espaço criado no Módulo 2." />
                        </label>
                        <select 
                            value={selectedSpaceId} 
                            onChange={handleSpaceSelect}
                            className="w-full p-2 border border-blue-200 rounded bg-white text-sm focus:ring-anepc-blue"
                        >
                            <option value="">
                                {availableSpaces.length === 0 ? '-- Todos os espaços já importados --' : '-- Selecionar Espaço --'}
                            </option>
                            {availableSpaces.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.type} - Risco {s.riskClass})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Identificação do Percurso
                        <Tooltip text="Nome descritivo para o relatório (ex: Corredor Ala Norte, Saída Sala 2)." />
                    </label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-anepc-blue focus:border-anepc-blue"
                        placeholder="Ex: Corredor Piso 1 - Ala Norte"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Via
                        <Tooltip text="Locais de Permanência (Art. 57) são espaços ocupáveis. Vias Horizontais (Art. 61) são corredores/circulações." />
                    </label>
                    <select 
                        value={pathType} 
                        onChange={(e) => setPathType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-anepc-blue focus:border-anepc-blue"
                    >
                        <option value="local">Local de Permanência (Art. 57)</option>
                        <option value="interior">Via Horizontal Interior (Art. 61)</option>
                        <option value="exterior">Via Horizontal Exterior (Art. 61)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        Configuração
                        <div className="relative group z-50">
                            <i className="fas fa-info-circle text-gray-400 cursor-help hover:text-anepc-blue transition-colors"></i>
                            <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-xl hidden group-hover:block z-50 pointer-events-none">
                                <p className="mb-2 font-bold border-b border-gray-600 pb-1">Definições (Art. 8º):</p>
                                <p className="mb-2"><strong className="text-yellow-300">Impasse:</strong> Quando os ocupantes dispõem apenas de um sentido de fuga possível até atingir uma saída exterior ou uma zona de segurança.</p>
                                <p><strong className="text-green-300">Saídas Distintas:</strong> Quando os ocupantes dispõem de, pelo menos, dois percursos de evacuação distintos e independentes entre si.</p>
                                {/* Arrow */}
                                <div className="absolute left-1 top-full border-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center p-3 border rounded-lg w-full cursor-pointer hover:bg-gray-50 transition shadow-sm">
                            <input type="radio" name="config" value="impasse" checked={config === 'impasse'} onChange={() => setConfig('impasse')} className="text-anepc-blue focus:ring-anepc-blue"/>
                            <span className="ml-2 text-sm">Em Impasse (1 saída)</span>
                        </label>
                        <label className="flex items-center p-3 border rounded-lg w-full cursor-pointer hover:bg-gray-50 transition shadow-sm">
                            <input type="radio" name="config" value="distinct" checked={config === 'distinct'} onChange={() => setConfig('distinct')} className="text-anepc-blue focus:ring-anepc-blue"/>
                            <span className="ml-2 text-sm">Saídas Distintas (&gt;1)</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="flex items-center text-sm text-gray-700 cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <input type="checkbox" checked={isRiskD} onChange={(e) => setIsRiskD(e.target.checked)} className="rounded text-anepc-blue mr-2"/>
                        <span>Serve locais de <strong className="text-red-700">Risco D</strong> (Acamados) ou <strong className="text-purple-700">Risco E</strong> (Dormida)?</span>
                        <Tooltip text="A presença de acamados ou dormida reduz significativamente as distâncias máximas permitidas (ex: 10m em impasse)." />
                    </label>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distância Medida em Projeto (m)
                        <Tooltip text="Distância real medida ao eixo do percurso, desde o ponto mais desfavorável até à saída ou zona de segurança." />
                    </label>
                    <div className="flex gap-4">
                        <input 
                            type="number" 
                            value={actualDistance} 
                            onChange={(e) => setActualDistance(parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md text-lg font-mono focus:ring-anepc-blue focus:border-anepc-blue"
                            placeholder="0.0"
                            min="0"
                            step="0.1"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-gray-50 rounded-xl p-6 flex flex-col justify-center items-center text-center border border-gray-200 flex-grow relative overflow-hidden">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Distância Máxima Permitida</span>
                    <span className="text-5xl font-bold text-gray-800 mb-2">{limit}m</span>
                    
                    {actualDistance !== '' && (
                        <>
                            <div className={`mt-4 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${isCompliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <i className={`fas ${isCompliant ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                {isCompliant ? 'CONFORME' : 'NÃO CONFORME'}
                            </div>
                            
                            {/* Manual Override Section */}
                            <div className="mt-6 w-full pt-4 border-t border-gray-200">
                                <label className="flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:text-gray-700 mb-3 select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={manualOverride} 
                                        onChange={e => setManualOverride(e.target.checked)}
                                        className="rounded text-anepc-blue mr-2 focus:ring-anepc-blue"
                                    />
                                    <span>Forçar Conformidade Manualmente</span>
                                </label>

                                {manualOverride && (
                                    <div className="flex justify-center gap-2 animate-pulse-once">
                                        <button 
                                            onClick={() => setManualIsCompliant(true)}
                                            className={`px-3 py-1 text-xs font-bold rounded border transition-colors ${manualIsCompliant ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-400 border-gray-200 hover:border-green-300'}`}
                                        >
                                            <i className="fas fa-check mr-1"></i> Conforme
                                        </button>
                                        <button 
                                            onClick={() => setManualIsCompliant(false)}
                                            className={`px-3 py-1 text-xs font-bold rounded border transition-colors ${!manualIsCompliant ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-400 border-gray-200 hover:border-red-300'}`}
                                        >
                                            <i className="fas fa-times mr-1"></i> Não Conforme
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    
                    <div className="mt-8 text-left w-full text-xs text-gray-500">
                        <p className="mb-1"><strong>Nota:</strong> Medido segundo o eixo dos caminhos de evacuação.</p>
                        {pathType === 'local' && config === 'distinct' && <p>Locais amplos (&gt;800m²) podem ter bonificação de 50%.</p>}
                    </div>
                </div>
                
                <button 
                    onClick={handleSavePath}
                    disabled={actualDistance === '' || !name}
                    className={`w-full py-3 ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-anepc-blue hover:bg-blue-800'} text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm`}
                >
                    <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus-circle'} mr-2`}></i>
                    {isEditing ? 'Guardar Alterações' : 'Adicionar ao Projeto'}
                </button>
            </div>
        </div>
      </div>

      {state.evacuationPaths.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700 flex justify-between items-center">
                  <span>Caminhos de Evacuação Guardados</span>
                  <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full">{state.evacuationPaths.length}</span>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                          <tr>
                              <th className="px-4 py-3">Nome</th>
                              <th className="px-4 py-3">Tipo</th>
                              <th className="px-4 py-3">Configuração</th>
                              <th className="px-4 py-3 text-right">Medido</th>
                              <th className="px-4 py-3 text-right">Máximo</th>
                              <th className="px-4 py-3 text-center">Estado</th>
                              <th className="px-4 py-3 text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {state.evacuationPaths.map(path => (
                              <tr key={path.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 font-medium text-gray-900">{path.name}</td>
                                  <td className="px-4 py-3 text-gray-600">{getPathTypeLabel(path.type)}</td>
                                  <td className="px-4 py-3 text-gray-600">{path.config === 'impasse' ? 'Impasse' : 'Distintas'}</td>
                                  <td className="px-4 py-3 text-right font-mono">{path.distance}m</td>
                                  <td className="px-4 py-3 text-right font-mono text-gray-500">{path.maxDistance}m</td>
                                  <td className="px-4 py-3 text-center">
                                      {path.isCompliant ? (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                              Conforme
                                          </span>
                                      ) : (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                              Não Conforme
                                          </span>
                                      )}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium">
                                      <button 
                                          onClick={() => startEdit(path)}
                                          className="text-orange-500 hover:text-orange-700 mr-3 transition-colors"
                                          title="Editar"
                                      >
                                          <i className="fas fa-edit"></i>
                                      </button>
                                      <button 
                                          onClick={() => removeEvacuationPath(path.id)}
                                          className="text-red-400 hover:text-red-600 transition-colors"
                                          title="Remover"
                                      >
                                          <i className="fas fa-trash"></i>
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default Module3Distances;