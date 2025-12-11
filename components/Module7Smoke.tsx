import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { SmokeCalculation } from '../types';

const Tooltip = ({ text }: { text: string }) => (
  <div className="relative group inline-flex ml-2 align-middle z-50">
    <i className="fas fa-question-circle text-gray-400 hover:text-anepc-blue cursor-help transition-colors text-[10px]"></i>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] leading-tight rounded shadow-lg hidden group-hover:block z-50 pointer-events-none text-center font-normal">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const Module7Smoke: React.FC = () => {
  const { state, addSmokeCalculation, removeSmokeCalculation } = useProject();
  const [activeTab, setActiveTab] = useState<'general' | 'apsad'>('general');
  const [method, setMethod] = useState<'passive' | 'active'>('active');
  
  // Zone Identification
  const [zoneName, setZoneName] = useState('');

  // Input states General
  const [spaceType, setSpaceType] = useState('generic');
  const [area, setArea] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [renovations, setRenovations] = useState<number>(6); // Default 6 ren/h

  // Input states APSAD R17
  const [apsadRisk, setApsadRisk] = useState<number>(2); // 1: Low, 2: Ordinary, 3: High
  const [cantonArea, setCantonArea] = useState<number | ''>(''); // Área do Cantão (Smoke Zone)
  const [cantonHeight, setCantonHeight] = useState<number | ''>(''); // Altura de referência H
  
  // Results General
  const volume = (area && height) ? Number(area) * Number(height) : 0;
  
  // Calculate Passive (Natural) Requirements General
  const calculatePassive = () => {
    if (!area) return { areaUtil: 0, numExutores: 0 };
    let factor = 200;
    if (spaceType === 'stage') factor = 50; 
    const areaUtil = Number(area) / factor;
    const numExutores = Math.ceil(areaUtil / 1); 
    return { areaUtil, numExutores };
  };

  // Calculate Active (Mechanical) Requirements General
  const calculateActive = () => {
    if (!volume) return { flowM3H: 0, flowM3S: 0 };
    let ren = renovations;
    if (spaceType === 'parking') ren = 600; 
    if (spaceType === 'basement') ren = 12;
    if (spaceType === 'stage') ren = 12;
    
    let flowM3H = volume * ren;
    if (spaceType === 'generic') {
        const flowByArea = (Number(area) / 100) * 3600; 
        flowM3H = Math.max(flowM3H, flowByArea);
    }
    const flowM3S = flowM3H / 3600;
    return { flowM3H, flowM3S };
  };

  // Calculate APSAD R17
  // Simplified Coefficient method (Alpha) based on H and Fire Class
  const calculateAPSAD = () => {
      const h = Number(cantonHeight);
      const sCanton = Number(cantonArea);
      
      if (!h || !sCanton) return { alpha: 0, areaGeo: 0, areaUseful: 0 };

      // Coefficients Table (Approximate standard values for demonstration of the logic)
      let alpha = 0;

      // Logic based on typical APSAD alpha tables (simplified for demo)
      // Low Risk (1): 0.5% to 1.0%
      // Ordinary Risk (2): 0.8% to 1.5%
      // High Risk (3): 1.2% to 2.0%
      // Height factor: Taller buildings generally require less percentage due to smoke reservoir capacity, 
      // but strictly APSAD tables are complex. Using a linear interpolation for demo.
      
      if (h <= 3) {
          if (apsadRisk === 1) alpha = 0.5; 
          if (apsadRisk === 2) alpha = 1.0;
          if (apsadRisk === 3) alpha = 1.5;
      } else if (h <= 8) {
          if (apsadRisk === 1) alpha = 0.5 + ((h-3) * 0.1); 
          if (apsadRisk === 2) alpha = 1.0 + ((h-3) * 0.1); 
          if (apsadRisk === 3) alpha = 1.5 + ((h-3) * 0.1);
      } else {
          // > 8m
          if (apsadRisk === 1) alpha = 1.0;
          if (apsadRisk === 2) alpha = 1.5;
          if (apsadRisk === 3) alpha = 2.0;
      }

      // Percentage to decimal
      const coeff = alpha / 100;
      
      const areaUseful = sCanton * coeff;
      // Geometric area is usually Useful / Cv (Aerodynamic coeff, typically 0.6)
      const areaGeo = areaUseful / 0.6; 

      return { alpha, areaUseful, areaGeo };
  };

  const passiveResults = calculatePassive();
  const activeResults = calculateActive();
  const apsadResults = calculateAPSAD();

  const handleSave = () => {
      if (!zoneName) {
          alert("Defina um nome para a zona de desenfumagem.");
          return;
      }

      let newCalc: SmokeCalculation;

      if (activeTab === 'general') {
          if (!area || !height) {
              alert("Preencha a área e a altura.");
              return;
          }
          newCalc = {
              id: Date.now().toString(),
              name: zoneName,
              method: 'general',
              area: Number(area),
              height: Number(height),
              notes: method === 'passive' ? `SCIE Geral - Natural (1/${spaceType === 'stage' ? '50' : '200'})` : `SCIE Geral - Mecânica (${renovations} ren/h)`,
              results: {
                  areaUseful: passiveResults.areaUtil,
                  flowM3S: method === 'active' ? activeResults.flowM3S : undefined,
                  flowM3H: method === 'active' ? activeResults.flowM3H : undefined
              }
          };
      } else {
          if (!cantonArea || !cantonHeight) {
              alert("Preencha a área do cantão e a altura de referência.");
              return;
          }
          newCalc = {
              id: Date.now().toString(),
              name: zoneName,
              method: 'apsad',
              area: Number(cantonArea),
              height: Number(cantonHeight),
              notes: `APSAD R17 - Classe ${apsadRisk} - Alpha ${apsadResults.alpha.toFixed(2)}%`,
              results: {
                  alpha: apsadResults.alpha,
                  areaUseful: apsadResults.areaUseful,
                  areaGeometric: apsadResults.areaGeo
              }
          };
      }

      addSmokeCalculation(newCalc);
      setZoneName('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
               <h2 className="text-xl font-bold text-gray-800">Cálculo de Controlo de Fumo</h2>
               <p className="text-sm text-gray-500 mt-1">Dimensionamento de desenfumagem (SCIE / APSAD R17)</p>
           </div>
           
           <div className="flex bg-gray-200 p-1 rounded-lg">
               <button 
                  onClick={() => setActiveTab('general')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'general' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
               >
                   Geral (DL 220)
               </button>
               <button 
                  onClick={() => setActiveTab('apsad')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'apsad' ? 'bg-white shadow text-red-700' : 'text-gray-500 hover:text-gray-700'}`}
               >
                   APSAD R17 (Fumo)
               </button>
           </div>
        </div>

        {activeTab === 'general' ? (
            <div className="p-6">
                {/* Zone Name Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Zona / Compartimento
                        <Tooltip text="Identificação da zona de desenfumagem (ex: Armazém A, Átrio Principal)." />
                    </label>
                    <input 
                        type="text" 
                        value={zoneName}
                        onChange={(e) => setZoneName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-anepc-blue focus:border-anepc-blue"
                        placeholder="Ex: Armazém A"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Espaço
                            <Tooltip text="A tipologia define o rácio de cálculo natural (ex: Palcos 1/50, Geral 1/200) ou a taxa de renovação mecânica." />
                        </label>
                        <select 
                            value={spaceType} 
                            onChange={(e) => setSpaceType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-anepc-blue focus:border-anepc-blue"
                        >
                            <option value="generic">Espaço Genérico (Regra Geral)</option>
                            <option value="basement">Piso Enterrado (Cave)</option>
                            <option value="atrium">Átrio / Espaço Amplo</option>
                            <option value="stage">Palco / Espaço Cénico</option>
                            <option value="parking">Parque de Estacionamento</option>
                            <option value="circulation">Via de Evacuação Horizontal</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Método de Desenfumagem
                            <Tooltip text="Natural: Através de exutores/janelas. Mecânica: Através de ventiladores de extração." />
                        </label>
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button 
                                onClick={() => setMethod('passive')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${method === 'passive' ? 'bg-white shadow-sm text-anepc-blue' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Natural
                            </button>
                            <button 
                                onClick={() => setMethod('active')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${method === 'active' ? 'bg-white shadow-sm text-anepc-blue' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Mecânica
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Área (m²)
                            <Tooltip text="Área em planta da zona a desenfumar." />
                        </label>
                        <input 
                            type="number" 
                            value={area}
                            onChange={(e) => setArea(parseFloat(e.target.value))}
                            className="w-full text-lg font-bold bg-transparent border-b border-gray-300 focus:border-anepc-blue focus:outline-none py-1"
                            placeholder="0"
                        />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Pé-Direito (m)
                            <Tooltip text="Altura média do compartimento. Usado para calcular o volume na desenfumagem mecânica." />
                        </label>
                        <input 
                            type="number" 
                            value={height}
                            onChange={(e) => setHeight(parseFloat(e.target.value))}
                            className="w-full text-lg font-bold bg-transparent border-b border-gray-300 focus:border-anepc-blue focus:outline-none py-1"
                            placeholder="0.0"
                        />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Volume (m³)</label>
                        <div className="text-2xl font-bold text-anepc-blue">{volume.toFixed(1)}</div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Resultados (SCIE Geral)</h3>
                    
                    {method === 'passive' && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg text-green-700"><i className="fas fa-wind"></i></div>
                                <h4 className="font-bold text-green-800">Desenfumagem Natural</h4>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm text-green-700 mb-1">Área Útil de Aberturas</p>
                                    <p className="text-3xl font-bold text-green-900">{passiveResults.areaUtil.toFixed(2)} m²</p>
                                    <p className="text-xs text-green-600 mt-2">Regra 1/{spaceType === 'stage' ? '50' : '200'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-green-700 mb-1">Entradas de Ar (S.air)</p>
                                    <p className="text-3xl font-bold text-green-900">{passiveResults.areaUtil.toFixed(2)} m²</p>
                                    <p className="text-xs text-green-600 mt-2">Admissão de ar fresco</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {method === 'active' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-anepc-blue"><i className="fas fa-fan"></i></div>
                                    <h4 className="font-bold text-blue-900">Desenfumagem Mecânica</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-blue-700">
                                        Taxa renovação:
                                        <Tooltip text="Volume de ar a extrair por hora. Geral: 6 vol/h. Caves: 12 vol/h." />
                                    </label>
                                    <select 
                                        value={renovations}
                                        onChange={(e) => setRenovations(Number(e.target.value))}
                                        className="text-xs border-blue-200 rounded bg-white text-blue-800"
                                    >
                                        <option value="6">6 vol/h (Padrão)</option>
                                        <option value="12">12 vol/h (Risco Elevado)</option>
                                        <option value="15">15 vol/h (Estacionamento)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm text-blue-700 mb-1">Caudal de Extração</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-bold text-blue-900">{activeResults.flowM3S.toFixed(2)} m³/s</p>
                                        <p className="text-lg text-blue-600">({activeResults.flowM3H.toFixed(0)} m³/h)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                         <button 
                             onClick={handleSave}
                             className="w-full bg-anepc-blue text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-sm"
                         >
                             <i className="fas fa-plus-circle mr-2"></i> Adicionar à Lista
                         </button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <h3 className="text-red-800 font-bold text-sm uppercase mb-1">Norma APSAD R17 (Desenfumagem Natural)</h3>
                    <p className="text-xs text-red-700">Método para cálculo de Área Útil de Exutores (S<sub>ui</sub>) em função da área do cantão e altura de referência.</p>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 w-full text-left">Croqui de Definições</h4>
                    {/* SVG Diagram for Canton and Height */}
                    <svg viewBox="0 0 500 220" className="w-full max-w-lg h-auto" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill="#003366" />
                            </marker>
                        </defs>
                        
                        {/* Floor */}
                        <line x1="10" y1="200" x2="490" y2="200" stroke="#333" strokeWidth="3" />
                        <text x="450" y="215" fontSize="10" fill="#666">Pavimento</text>

                        {/* Roof Structure (Pitched) */}
                        <path d="M10 100 L250 30 L490 100" fill="none" stroke="#333" strokeWidth="2" />
                        <text x="250" y="20" fontSize="10" fill="#666" textAnchor="middle">Cobertura</text>

                        {/* Smoke Curtains (Sancas) */}
                        <line x1="80" y1="80" x2="80" y2="130" stroke="#d32f2f" strokeWidth="3" />
                        <line x1="420" y1="80" x2="420" y2="130" stroke="#d32f2f" strokeWidth="3" />
                        <text x="80" y="145" fontSize="10" fill="#d32f2f" textAnchor="middle">Sanca</text>
                        <text x="420" y="145" fontSize="10" fill="#d32f2f" textAnchor="middle">Sanca</text>

                        {/* Canton Area Indication */}
                        <path d="M80 130 L420 130" fill="none" stroke="#d32f2f" strokeWidth="1" strokeDasharray="4" />
                        <rect x="80" y="30" width="340" height="100" fill="#d32f2f" fillOpacity="0.05" />
                        <text x="250" y="90" fontSize="12" fontWeight="bold" fill="#d32f2f" textAnchor="middle">CANTÃO DE DESENFUMAGEM (S_canton)</text>

                        {/* Height (H) Indication */}
                        <line x1="250" y1="30" x2="250" y2="200" stroke="#003366" strokeWidth="1" strokeDasharray="4" />
                        <line x1="250" y1="30" x2="250" y2="200" strokeOpacity="0" markerEnd="url(#arrow)" /> {/* Invisible line just for marker usage if needed */}
                        
                        {/* Dimension Line H */}
                        <line x1="290" y1="65" x2="290" y2="200" stroke="#003366" strokeWidth="2" />
                        <line x1="285" y1="65" x2="295" y2="65" stroke="#003366" strokeWidth="2" />
                        <line x1="285" y1="200" x2="295" y2="200" stroke="#003366" strokeWidth="2" />
                        <text x="300" y="130" fontSize="12" fontWeight="bold" fill="#003366">H (Altura Referência)</text>
                        <text x="300" y="145" fontSize="10" fill="#003366">Média (Teto-Chão)</text>

                    </svg>
                </div>
                
                {/* Zone Name */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Cantão / Zona
                        <Tooltip text="Identificação da zona de fumo delimitada por sancas ou paredes." />
                    </label>
                    <input 
                        type="text" 
                        value={zoneName}
                        onChange={(e) => setZoneName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Ex: Zona de Produção"
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Classe de Fogo
                            <Tooltip text="Classificação da carga térmica segundo a APSAD R17 (1: Reduzido, 2: Ordinário, 3: Elevado)." />
                        </label>
                        <select 
                            value={apsadRisk} 
                            onChange={(e) => setApsadRisk(Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="1">Risco 1 (Reduzido / Incombustível)</option>
                            <option value="2">Risco 2 (Ordinário / Geral)</option>
                            <option value="3">Risco 3 (Elevado / Plásticos)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Define o potencial calorífico da carga de incêndio.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Área do Cantão (m²)
                            <Tooltip text="Área em planta delimitada pelas sancas de fumo (S_canton)." />
                        </label>
                        <input 
                            type="number" 
                            value={cantonArea}
                            onChange={(e) => setCantonArea(parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Área da zona de fumo"
                        />
                        <p className="text-xs text-gray-500 mt-1">Área delimitada pelas retombadas de fumo (S<sub>canton</sub>).</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Altura Referência H (m)
                            <Tooltip text="Altura média entre o pavimento e a cobertura (H). Influencia o coeficiente Alpha." />
                        </label>
                        <input 
                            type="number" 
                            value={cantonHeight}
                            onChange={(e) => setCantonHeight(parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Altura média"
                        />
                        <p className="text-xs text-gray-500 mt-1">Média entre ponto mais alto e mais baixo da cobertura.</p>
                    </div>
                </div>

                {/* Demonstration Section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Demonstração de Cálculo</h4>
                    
                    <div className="space-y-4 text-sm text-gray-700">
                        <p className="mb-2">A regra R17 determina a <strong>Área Útil de Exutores (S<sub>ui</sub>)</strong> aplicando uma percentagem (Coeficiente Alpha) sobre a área do cantão.</p>
                        
                        <div className="bg-white p-4 rounded border border-gray-300 font-mono mb-4 text-xs md:text-sm shadow-sm">
                             <p className="text-blue-800 font-bold mb-2">Fórmula Fundamental:</p>
                             <p className="text-lg text-center bg-gray-50 py-2 rounded border border-gray-200">
                                S<sub>ui</sub> = S<sub>canton</sub> × α
                             </p>
                             <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                 <div>
                                    <strong>S<sub>canton</sub>:</strong> Área do cantão ({cantonArea || 0} m²)
                                 </div>
                                 <div>
                                    <strong>α:</strong> Coeficiente (%) tabelado em função da Altura H e da Classe.
                                 </div>
                             </div>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-200 border-dashed">
                            <span className="text-gray-500">1. Coeficiente Alpha (α)</span>
                            <span className="font-bold text-blue-600">{apsadResults.alpha.toFixed(2)} %</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 border-dashed bg-green-50 px-2 rounded">
                            <span className="text-green-800 font-bold">2. Área Útil Exutores (S<sub>ui</sub>)</span>
                            <span className="font-bold text-green-800 text-lg">
                                {apsadResults.areaUseful.toFixed(2)} m²
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-2">
                             <span className="text-gray-500">3. Área Geométrica Estimada (Cv ≈ 0.6)</span>
                             <span className="font-bold text-gray-400">
                                ~ {apsadResults.areaGeo.toFixed(2)} m²
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                         <div className="bg-white p-4 rounded border border-gray-200 shadow-sm text-center">
                             <p className="text-xs text-gray-400 uppercase font-bold">Total Exutores</p>
                             <p className="text-xs text-gray-500 mt-1">Ex: se cada unidade tiver 2m² útil</p>
                             <p className="text-2xl font-bold text-gray-800 mt-2">
                                 {Math.ceil(apsadResults.areaUseful / 2)} <span className="text-sm font-normal">unidades</span>
                             </p>
                         </div>
                         <div className="bg-white p-4 rounded border border-gray-200 shadow-sm text-center">
                             <p className="text-xs text-gray-400 uppercase font-bold">Entradas de Ar (S<sub>air</sub>)</p>
                             <p className="text-xs text-gray-500 mt-1">Deve ser S<sub>air</sub> ≥ S<sub>ui</sub></p>
                             <p className="text-2xl font-bold text-gray-800 mt-2">
                                 {apsadResults.areaUseful.toFixed(2)} <span className="text-sm font-normal">m²</span>
                             </p>
                         </div>
                    </div>

                    <div className="mt-6">
                         <button 
                             onClick={handleSave}
                             className="w-full bg-anepc-blue text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-sm"
                         >
                             <i className="fas fa-plus-circle mr-2"></i> Adicionar à Lista
                         </button>
                    </div>
                </div>
            </div>
        )}

        {/* List of Saved Calculations */}
        {state.smokeCalculations.length > 0 && (
             <div className="border-t border-gray-200">
                 <div className="p-4 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 flex justify-between items-center">
                      <span>Cálculos Guardados</span>
                      <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full">{state.smokeCalculations.length}</span>
                 </div>
                 <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500 font-medium">
                         <tr>
                             <th className="px-4 py-3">Zona</th>
                             <th className="px-4 py-3">Método</th>
                             <th className="px-4 py-3 text-right">Área Local</th>
                             <th className="px-4 py-3 text-right">Result.</th>
                             <th className="px-4 py-3">Notas</th>
                             <th className="px-4 py-3"></th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {state.smokeCalculations.map(calc => (
                             <tr key={calc.id} className="hover:bg-gray-50">
                                 <td className="px-4 py-3 font-medium text-gray-900">{calc.name}</td>
                                 <td className="px-4 py-3 text-gray-600">
                                     {calc.method === 'apsad' ? <span className="text-red-600 font-bold">APSAD</span> : 'Geral'}
                                 </td>
                                 <td className="px-4 py-3 text-right">{calc.area} m²</td>
                                 <td className="px-4 py-3 text-right font-bold text-anepc-blue">
                                     {calc.method === 'apsad' 
                                        ? `${calc.results.areaUseful.toFixed(2)} m²` 
                                        : (calc.results.flowM3S ? `${calc.results.flowM3S?.toFixed(2)} m³/s` : `${calc.results.areaUseful.toFixed(2)} m²`)
                                     }
                                 </td>
                                 <td className="px-4 py-3 text-gray-500 text-xs">{calc.notes}</td>
                                 <td className="px-4 py-3 text-right">
                                     <button 
                                          onClick={() => removeSmokeCalculation(calc.id)}
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
    </div>
  );
};

export default Module7Smoke;