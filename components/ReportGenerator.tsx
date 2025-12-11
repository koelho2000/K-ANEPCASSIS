import React, { useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULES, getTechnicalRequirements } from '../data';
import { RiskLocation } from '../types';

const ReportGenerator: React.FC = () => {
  const { state, setMode } = useProject();
  const reportRef = useRef<HTMLDivElement>(null);

  // Generate HTML for Word export
  const handleExportWord = () => {
      if (!reportRef.current) return;
      
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Relatório SCIE</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + reportRef.current.innerHTML + footer;
      
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = `Relatorio_SCIE_${(state.projectName || 'Projeto').replace(/\s+/g, '_')}.doc`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Control Bar (Hidden in Print) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden sticky top-4 z-10">
          <div>
              <h2 className="font-bold text-gray-800">Relatório Final</h2>
              <p className="text-xs text-gray-500">Pré-visualização pronta para exportar</p>
          </div>
          <div className="flex gap-2">
               <button onClick={() => setMode('modules')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded border border-gray-300">
                  <i className="fas fa-arrow-left mr-2"></i> Voltar
              </button>
              <button onClick={handleExportWord} className="px-4 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200">
                  <i className="fas fa-file-word mr-2"></i> Word
              </button>
              <button onClick={handlePrint} className="px-4 py-2 text-sm text-white bg-anepc-blue hover:bg-blue-800 rounded shadow-sm">
                  <i className="fas fa-print mr-2"></i> Imprimir / PDF
              </button>
          </div>
      </div>

      {/* Report Container */}
      <div ref={reportRef} className="bg-white shadow-lg print:shadow-none min-h-[1123px] w-full p-12 md:p-16 text-gray-800 print:p-0">
          
          {/* Header */}
          <header className="border-b-2 border-anepc-blue pb-6 mb-8 flex justify-between items-end">
              <div>
                  <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">Ficha de Segurança</h1>
                  <h2 className="text-xl text-anepc-blue font-medium mt-1">Contra Incêndio em Edifícios</h2>
              </div>
              <div className="text-right text-sm text-gray-500">
                  <p className="font-bold text-gray-800">{state.projectName}</p>
                  <p>{state.projectLocation}</p>
                  <p className="mt-2">{new Date().toLocaleDateString('pt-PT')}</p>
              </div>
          </header>

          {/* 1. Caracterização */}
          <section className="mb-10 break-inside-avoid">
              <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-gray-500 tracking-wider">1. Caracterização Geral</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-gray-500">Utilização-Tipo</span>
                      <span className="font-bold">{state.building.ut}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-gray-500">Categoria de Risco</span>
                      <span className="font-bold bg-gray-100 px-2 rounded">{state.category ? `${state.category}ª Categoria` : 'N/D'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-gray-500">Altura do Edifício</span>
                      <span className="font-bold">{state.building.height} m</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-gray-500">Efetivo Total</span>
                      <span className="font-bold">{state.building.occupancy} pessoas</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-gray-500">Área Bruta</span>
                      <span className="font-bold">{state.building.grossArea > 0 ? `${state.building.grossArea} m²` : '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-gray-500">Pisos Enterrados</span>
                      <span className="font-bold">{state.building.floorsBelow}</span>
                  </div>
              </div>
          </section>

          {/* 2. Classificação de Espaços */}
          <section className="mb-10 break-inside-avoid">
              <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-gray-500 tracking-wider">2. Classificação dos Locais de Risco</h3>
              {state.spaces.length > 0 ? (
                  <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-300">
                          <tr>
                              <th className="py-2 pl-2">Designação</th>
                              <th className="py-2">Tipo</th>
                              <th className="py-2 text-center">Risco</th>
                              <th className="py-2 text-right pr-2">Efetivo</th>
                          </tr>
                      </thead>
                      <tbody>
                          {state.spaces.map((s, i) => (
                              <tr key={i} className="border-b border-gray-100">
                                  <td className="py-2 pl-2 font-medium">{s.name}</td>
                                  <td className="py-2 text-gray-500 capitalize">{s.type.replace('_', ' ')}</td>
                                  <td className="py-2 text-center font-bold">
                                      {s.riskClass} 
                                      {s.riskClass === RiskLocation.C && s.notes?.includes('Agravado') ? '+' : ''}
                                  </td>
                                  <td className="py-2 text-right pr-2">{s.occupancy}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              ) : (
                  <p className="text-sm text-gray-400 italic">Nenhum espaço registado.</p>
              )}
          </section>

          {/* 3. Evacuação */}
          <section className="mb-10 break-inside-avoid">
              <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-gray-500 tracking-wider">3. Condições de Evacuação</h3>
              
              {/* Distances */}
              <div className="mb-6">
                  <h4 className="text-sm font-bold text-anepc-blue mb-2">3.1 Distâncias de Percurso</h4>
                  {state.evacuationPaths.length > 0 ? (
                      <table className="w-full text-sm text-left border-collapse mb-4">
                          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-300">
                              <tr>
                                  <th className="py-2 pl-2">Caminho</th>
                                  <th className="py-2 text-right">Medido</th>
                                  <th className="py-2 text-right">Máximo</th>
                                  <th className="py-2 text-center pr-2">Conformidade</th>
                              </tr>
                          </thead>
                          <tbody>
                              {state.evacuationPaths.map((p, i) => (
                                  <tr key={i} className="border-b border-gray-100">
                                      <td className="py-2 pl-2">{p.name}</td>
                                      <td className="py-2 text-right">{p.distance}m</td>
                                      <td className="py-2 text-right text-gray-500">{p.maxDistance}m</td>
                                      <td className="py-2 text-center pr-2">
                                          {p.isCompliant ? (
                                              <span className="text-green-700 font-bold">OK</span>
                                          ) : (
                                              <span className="text-red-700 font-bold">N/OK</span>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  ) : <p className="text-sm text-gray-400 italic mb-4">Sem registos.</p>}
              </div>

              {/* Widths */}
              <div>
                  <h4 className="text-sm font-bold text-anepc-blue mb-2">3.2 Larguras e Saídas</h4>
                  {state.widthCalculations.length > 0 ? (
                      <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-300">
                              <tr>
                                  <th className="py-2 pl-2">Local</th>
                                  <th className="py-2 text-right">Efetivo</th>
                                  <th className="py-2 text-right">UP</th>
                                  <th className="py-2 text-right">Largura</th>
                                  <th className="py-2 text-right pr-2">Saídas</th>
                              </tr>
                          </thead>
                          <tbody>
                              {state.widthCalculations.map((c, i) => (
                                  <tr key={i} className="border-b border-gray-100">
                                      <td className="py-2 pl-2">{c.name}</td>
                                      <td className="py-2 text-right">{c.occupancy}</td>
                                      <td className="py-2 text-right font-bold">{c.up}</td>
                                      <td className="py-2 text-right">{c.width.toFixed(2)}m</td>
                                      <td className="py-2 text-right pr-2">{c.exits}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  ) : <p className="text-sm text-gray-400 italic">Sem registos.</p>}
              </div>
          </section>

          {/* 4. Smoke Control (New Section) */}
          <section className="mb-10 break-inside-avoid">
             <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-gray-500 tracking-wider">4. Controlo de Fumo</h3>
             {state.smokeCalculations.length > 0 ? (
                 <table className="w-full text-sm text-left border-collapse">
                     <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-300">
                         <tr>
                             <th className="py-2 pl-2">Zona</th>
                             <th className="py-2">Método</th>
                             <th className="py-2 text-right">Área</th>
                             <th className="py-2 text-right">Caudal/Área Útil</th>
                             <th className="py-2 pr-2">Detalhes</th>
                         </tr>
                     </thead>
                     <tbody>
                         {state.smokeCalculations.map((calc, i) => (
                             <tr key={i} className="border-b border-gray-100">
                                 <td className="py-2 pl-2 font-medium">{calc.name}</td>
                                 <td className="py-2">{calc.method === 'apsad' ? 'APSAD R17' : 'Geral'}</td>
                                 <td className="py-2 text-right">{calc.area} m²</td>
                                 <td className="py-2 text-right font-bold text-anepc-blue">
                                     {calc.method === 'apsad' 
                                        ? `${calc.results.areaUseful.toFixed(2)} m²` 
                                        : (calc.results.flowM3S ? `${calc.results.flowM3S?.toFixed(2)} m³/s` : `${calc.results.areaUseful.toFixed(2)} m²`)
                                     }
                                 </td>
                                 <td className="py-2 text-gray-500 text-xs">{calc.notes}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             ) : <p className="text-sm text-gray-400 italic">Sem cálculos de desenfumagem registados.</p>}
          </section>

          {/* 5. Condições Técnicas Gerais (Dynamic) */}
          <section className="break-inside-avoid">
             <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-gray-500 tracking-wider">5. Condições Técnicas dos Sistemas</h3>
             
             {/* Iterate through relevant technical modules */}
             {[5, 6, 8, 9, 11, 12, 13].map((modId) => {
                 const reqs = getTechnicalRequirements(modId, state);
                 const modInfo = MODULES.find(m => m.id === modId);
                 
                 if (reqs.length === 0) return null;

                 return (
                     <div key={modId} className="mb-6 break-inside-avoid">
                         <h4 className="text-sm font-bold text-gray-800 bg-gray-50 p-2 border-l-4 border-anepc-blue mb-2">
                             {modInfo?.title}
                         </h4>
                         <div className="pl-3">
                             {reqs.map((r, i) => (
                                 <div key={i} className="flex flex-col sm:flex-row sm:justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                                     <div className="pr-4">
                                         <span className="font-semibold block sm:inline">{r.title}: </span>
                                         <span className="text-gray-500">{r.description}</span>
                                     </div>
                                     <div className="font-bold text-anepc-blue whitespace-nowrap mt-1 sm:mt-0">
                                         {r.value}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 );
             })}
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>Documento gerado automaticamente pelo Assistente SCIE</p>
              <p>Este relatório serve como guia de projeto e não dispensa a consulta da legislação em vigor.</p>
          </footer>
      </div>
    </div>
  );
};

export default ReportGenerator;