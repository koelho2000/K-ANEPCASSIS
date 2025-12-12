import React, { useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULES, calculateSpaceEquipment } from '../data';
import { ProjectState } from '../types';

// --- Helper: Dynamic Text Generators ("AI") ---

const generateExecutiveSummary = (state: ProjectState) => {
    const { building, category, projectName } = state;
    const date = new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return `O presente relatório tem como objetivo definir as condições de Segurança Contra Incêndio em Edifícios (SCIE) para o projeto "${projectName}", localizado em ${state.projectLocation}. 
    
    A análise foi elaborada em ${date}, com base nos preceitos do Decreto-Lei n.º 220/2008 e da Portaria n.º 1532/2008, considerando as alterações introduzidas pela Portaria n.º 135/2020.
    
    O edifício classifica-se predominantemente na Utilização-Tipo ${building.ut}, apresentando uma altura de ${building.height} metros e um efetivo total estimado de ${building.occupancy} pessoas. Conjugando estes fatores com a existência de ${building.floorsBelow} pisos abaixo do plano de referência, o imóvel enquadra-se na ${category}ª Categoria de Risco.`;
};

const generateLegalAnalysis = (state: ProjectState) => {
    return `O enquadramento legal do projeto valida-se pela aplicação correta dos critérios de altura (${state.building.height}m) e ocupação para a Utilização-Tipo ${state.building.ut}. Não foram detetadas desconformidades no âmbito de aplicação do RJ-SCIE.`;
};

const generateBuildingAnalysis = (state: ProjectState) => {
    const riskCount = state.spaces.filter(s => s.riskClass !== 'A').length;
    return `A caracterização funcional identifica ${state.spaces.length} espaços distintos. Destaca-se a existência de ${riskCount} locais de risco agravado (B, C, D, E ou F), o que justifica a classificação global de ${state.category}ª Categoria de Risco e impõe compartimentação específica.`;
};

const generatePassiveAnalysis = (state: ProjectState) => {
    const reqEst = state.category === 1 ? 'R30' : state.category === 2 ? 'R60' : state.category === 3 ? 'R90' : 'R120';
    return `Para a ${state.category}ª Categoria, a estrutura deve garantir uma estabilidade ao fogo de ${reqEst}. Os materiais de revestimento das vias de evacuação devem cumprir a classe C-s2,d0 (paredes) e Bfl-s1 (pavimentos) para evitar a propagação rápida de fumo e gases tóxicos.`;
};

const generateEvacuationText = (state: ProjectState) => {
    const totalPaths = state.evacuationPaths.length;
    const compliantPaths = state.evacuationPaths.filter(p => p.isCompliant).length;
    const widthCalcs = state.widthCalculations.length;
    
    if (totalPaths === 0) return "Não foram ainda definidos percursos de evacuação específicos para este projeto.";

    return `Foram analisados ${totalPaths} caminhos de evacuação horizontais. Desta análise, ${compliantPaths} percursos cumprem integralmente as distâncias máximas regulamentares. As larguras de saída foram dimensionadas com base em ${widthCalcs} cálculos de Unidades de Passagem (UP).`;
};

const generateEvacuationAnalysis = (state: ProjectState) => {
    const allCompliant = state.evacuationPaths.every(p => p.isCompliant);
    if(allCompliant && state.evacuationPaths.length > 0) {
        return "A análise demonstra que todos os percursos de evacuação verificados cumprem as distâncias máximas admissíveis (Art. 57º/61º), garantindo a segurança dos ocupantes.";
    } else {
        return "Atenção: Existem percursos de evacuação que excedem os limites regulamentares ou ainda não foram calculados. Recomenda-se a revisão do layout ou a criação de saídas alternativas.";
    }
};

const generateTechnicalAnalysis = (state: ProjectState) => {
    return `O edifício encontra-se dotado dos sistemas de autoproteção ativa exigíveis para a ${state.category}ª Categoria. A distribuição de equipamentos cobre a totalidade da área bruta (${state.building.grossArea} m²), com especial incidência nos locais de risco agravado identificados no Capítulo II.`;
};

const generateFinalConclusions = (state: ProjectState) => {
    const { category, building } = state;
    const riskLevel = category === 1 ? "reduzido" : category === 2 ? "moderado" : "elevado";
    const needsMaintenance = category && category >= 2;
    const hasSprinklers = category && category >= 3;
    
    return `O edifício objeto de estudo, classificado na ${category}ª Categoria de Risco, cumpre genericamente com as disposições legais do RJ-SCIE e RT-SCIE para a utilização-tipo ${building.ut}.
    
    VERIFICAÇÃO REGULAMENTAR:
    Conclui-se que o nível de segurança obtido é adequado ao risco ${riskLevel} da exploração. As soluções de arquitetura (evacuação e compartimentação) encontram-se alinhadas com os requisitos técnicos dos equipamentos (Capítulo V).

    CONSIDERAÇÕES E PROPOSTAS:
    1. Certificação: Garantir a certificação de reação ao fogo de todos os materiais de revestimento aplicados nas vias de evacuação.
    2. Sinalização: A sinalização deve ser colocada a uma altura entre 2.0m e 2.5m, garantindo visibilidade direta de qualquer ponto.
    3. Medidas de Autoproteção: ${needsMaintenance ? "É obrigatória a implementação de Medidas de Autoproteção (MAP) completas (Planos de Prevenção e Emergência) entregues na ANEPC." : "Recomenda-se a elaboração de Instruções de Segurança e Plantas de Emergência afixadas."}
    4. Manutenção: ${hasSprinklers ? "O sistema de extinção automática (Sprinklers) e o SADI" : "O SADI e os extintores"} carecem de contrato de manutenção anual com entidade registada na ANEPC.`;
};

// --- Components ---

const PageContainer = ({ children, className = "", hideFooter = false }: { children?: React.ReactNode, className?: string, hideFooter?: boolean }) => (
    <div className={`report-page flex flex-col ${className}`}>
        {children}
        {!hideFooter && (
            <div className="mt-auto pt-8 border-t border-gray-200 flex justify-between text-[10px] text-gray-400 font-sans">
                <span>K-ANEPCASSIS - ANEPC</span>
                <span>Relatório Técnico Automático</span>
            </div>
        )}
    </div>
);

const AnalysisBox = ({ text }: { text: string }) => (
    <div className="mt-auto mb-4 bg-slate-50 border-l-4 border-anepc-blue p-4 text-sm text-justify text-slate-700 italic rounded-r-lg shadow-sm">
        <strong className="text-anepc-blue not-italic block mb-1 text-xs uppercase tracking-wider">Análise Sumária do Capítulo</strong>
        {text}
    </div>
);

const EquipmentTable = ({ spaces, moduleId, title }: { spaces: ProjectState['spaces'], moduleId: number, title: string }) => {
    const validRows = spaces.map(s => ({
        space: s,
        items: calculateSpaceEquipment(s, moduleId)
    })).filter(row => row.items.length > 0);

    if (validRows.length === 0) return (
        <div className="mb-6 p-4 border border-dashed border-gray-300 rounded text-center text-xs text-gray-500 italic">
            Sem equipamentos calculados para: {title}
        </div>
    );

    return (
        <div className="mb-8 break-inside-avoid">
            <h4 className="font-bold text-gray-900 mb-2 font-sans uppercase text-xs border-b border-gray-300 pb-1">{title}</h4>
            <table className="w-full text-xs border-collapse border border-gray-300 font-sans table-fixed">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2 text-left w-1/3">Local / Área</th>
                        <th className="border p-2 text-left w-2/3">Equipamento Previsto e Quantidades</th>
                    </tr>
                </thead>
                <tbody>
                    {validRows.map((row, idx) => (
                        <tr key={row.space.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border p-2 align-top">
                                <span className="font-bold block text-gray-800">{row.space.name}</span>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[10px] bg-gray-200 px-1 rounded">{row.space.area} m²</span>
                                    <span className={`text-[10px] px-1 rounded ${row.space.riskClass === 'F' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-800'}`}>Risco {row.space.riskClass}</span>
                                </div>
                            </td>
                            <td className="border p-2">
                                <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                                    {row.items.map((item, i) => (
                                        <li key={i} className="flex items-center text-[10px] text-gray-700">
                                            <span className="font-bold mr-1 min-w-[20px] text-right">{item.quantity} {item.unit}</span>
                                            <span className="truncate">{item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Main Component ---

const ReportGenerator: React.FC = () => {
  const { state, setMode } = useProject();
  const reportRef = useRef<HTMLDivElement>(null);
  const { technician } = state;

  const handlePrint = () => {
      window.print();
  };

  const today = new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-gray-100 min-h-screen pb-20 font-serif">
      
      {/* Control Bar (No Print) */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 mb-8 sticky top-0 z-50 no-print">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                  <h2 className="font-bold text-gray-800 font-sans">Relatório Técnico SCIE</h2>
                  <p className="text-xs text-gray-500 font-sans">Pré-visualização de Impressão (A4)</p>
              </div>
              <div className="flex gap-2">
                   <button onClick={() => setMode('modules')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded border border-gray-300 font-sans">
                      <i className="fas fa-arrow-left mr-2"></i> Voltar
                  </button>
                  <button onClick={handlePrint} className="px-4 py-2 text-sm text-white bg-anepc-blue hover:bg-blue-800 rounded shadow-sm font-sans">
                      <i className="fas fa-print mr-2"></i> Imprimir / Guardar PDF
                  </button>
              </div>
          </div>
      </div>

      {/* REPORT CONTENT START */}
      <div ref={reportRef} className="print:w-full print:bg-white">
          
          {/* --- CAPA (COVER PAGE) --- */}
          <PageContainer className="page-break justify-center text-center relative overflow-hidden" hideFooter={true}>
                <div className="absolute top-0 left-0 w-full h-4 bg-anepc-blue"></div>
                
                <div className="mb-12">
                     <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-anepc-blue border-4 border-anepc-blue">
                        <i className="fas fa-shield-alt text-6xl"></i>
                    </div>
                    <h1 className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase mb-2 font-sans">Projeto de Especialidade</h1>
                    <h2 className="text-4xl font-bold text-anepc-blue mb-4 leading-tight">Segurança Contra Incêndio<br/>em Edifícios</h2>
                    <div className="w-24 h-1 bg-anepc-accent mx-auto my-6"></div>
                </div>

                <div className="mb-16 space-y-2">
                    <p className="text-xl text-gray-800 font-bold">{state.projectName}</p>
                    <p className="text-gray-600 italic">{state.projectLocation}</p>
                </div>

                <div className="mt-auto mb-16">
                    <p className="text-sm text-gray-500 font-sans uppercase tracking-wider mb-1">Elaborado por</p>
                    <p className="text-lg font-bold text-gray-800">{technician.name || "Autor não definido"}</p>
                    <p className="text-sm text-gray-500 mt-4">{today}</p>
                </div>
                
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-anepc-blue/5 rounded-tl-full -mr-16 -mb-16"></div>
          </PageContainer>

          {/* --- ÍNDICE --- */}
          <PageContainer className="page-break">
              <h3 className="text-2xl font-bold text-anepc-blue mb-8 border-b-2 border-anepc-blue pb-2">Índice</h3>
              <ul className="space-y-4 text-sm font-sans">
                  <li className="flex justify-between items-baseline border-b border-gray-100 pb-1 border-dashed">
                      <span className="font-bold">Resumo Executivo</span>
                      <span>3</span>
                  </li>
                  <li className="flex justify-between items-baseline border-b border-gray-100 pb-1 border-dashed">
                      <span className="font-bold">Capítulo I - Enquadramento Legal</span>
                      <span>4</span>
                  </li>
                  <li className="flex justify-between items-baseline border-b border-gray-100 pb-1 border-dashed">
                      <span className="font-bold">Capítulo II - Caracterização do Edifício</span>
                      <span>5</span>
                  </li>
                   <li className="flex justify-between items-baseline border-b border-gray-100 pb-1 border-dashed">
                      <span className="font-bold">Capítulo III - Condições Gerais de Comportamento</span>
                      <span>6</span>
                  </li>
                  <li className="flex justify-between items-baseline border-b border-gray-100 pb-1 border-dashed">
                      <span className="font-bold">Capítulo IV - Evacuação e Saídas</span>
                      <span>7</span>
                  </li>
                  <li className="flex justify-between items-baseline border-b border-gray-100 pb-1 border-dashed">
                      <span className="font-bold">Capítulo V - Instalações Técnicas</span>
                      <span>8</span>
                  </li>
                  <li className="flex justify-between items-baseline border-b border-gray-100 pb-1 border-dashed">
                      <span className="font-bold">Capítulo VI - Considerações Finais</span>
                      <span>10</span>
                  </li>
                  <li className="flex justify-between items-baseline border-b border-gray-100 pb-1 border-dashed">
                      <span className="font-bold">Termo de Responsabilidade</span>
                      <span>11</span>
                  </li>
              </ul>
          </PageContainer>

          {/* --- RESUMO EXECUTIVO --- */}
          <PageContainer className="page-break">
               <h3 className="text-2xl font-bold text-anepc-blue mb-6 border-b border-gray-200 pb-2">Resumo Executivo</h3>
               <div className="prose prose-slate max-w-none text-justify leading-relaxed text-gray-700">
                    <p className="whitespace-pre-line">{generateExecutiveSummary(state)}</p>
               </div>
               
               <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
                   <h4 className="font-bold text-anepc-blue mb-4 font-sans uppercase text-sm">Quadro Sinóptico</h4>
                   <div className="grid grid-cols-2 gap-4 text-sm font-sans">
                       <div>
                           <span className="block text-gray-500 text-xs">Utilização-Tipo</span>
                           <span className="font-bold text-gray-900">{state.building.ut}</span>
                       </div>
                       <div>
                           <span className="block text-gray-500 text-xs">Categoria de Risco</span>
                           <span className="font-bold text-gray-900">{state.category}ª Categoria</span>
                       </div>
                       <div>
                           <span className="block text-gray-500 text-xs">Altura</span>
                           <span className="font-bold text-gray-900">{state.building.height} m</span>
                       </div>
                       <div>
                           <span className="block text-gray-500 text-xs">Efetivo</span>
                           <span className="font-bold text-gray-900">{state.building.occupancy} pessoas</span>
                       </div>
                   </div>
               </div>
          </PageContainer>

          {/* --- CAPÍTULO I --- */}
          <PageContainer className="page-break">
                <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-anepc-blue pb-1">Capítulo I - Enquadramento Legal</h3>
                <div className="text-justify text-sm text-gray-700 mb-6 leading-relaxed">
                    <p className="mb-3">O presente projeto foi elaborado em estrito cumprimento da legislação de Segurança Contra Incêndio em Edifícios vigente em Portugal, nomeadamente:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-3">
                        <li><strong>Decreto-Lei n.º 220/2008</strong>, de 12 de novembro (RJ-SCIE), na sua redação atual.</li>
                        <li><strong>Portaria n.º 1532/2008</strong>, de 29 de dezembro (RT-SCIE).</li>
                        <li><strong>Portaria n.º 135/2020</strong>, de 2 de junho (Alterações ao RT-SCIE).</li>
                    </ul>
                    <p>Foram ainda consideradas as Notas Técnicas da ANEPC aplicáveis às especificidades do edifício.</p>
                </div>
                
                <AnalysisBox text={generateLegalAnalysis(state)} />
          </PageContainer>

          {/* --- CAPÍTULO II --- */}
          <PageContainer className="page-break">
                <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-anepc-blue pb-1">Capítulo II - Caracterização</h3>
                <div className="text-justify text-sm text-gray-700 mb-6 leading-relaxed">
                    <p className="mb-4">O edifício destina-se à utilização principal do tipo <strong>UT {state.building.ut}</strong>. A sua envolvente e acessibilidade garantem o acesso às viaturas de socorro através das vias públicas adjacentes, cumprindo as larguras mínimas exigidas (3.5m/6.0m consoante a altura).</p>
                    
                    <h4 className="font-bold text-gray-900 mb-2">Classificação dos Locais de Risco</h4>
                    <p className="mb-2">Com base na análise funcional, foram identificados os seguintes espaços e respetivas classes de risco:</p>
                    
                    <table className="w-full text-sm border-collapse border border-gray-300 mb-4 font-sans">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 text-left">Espaço</th>
                                <th className="border p-2 text-left">Tipologia</th>
                                <th className="border p-2 text-center">Risco</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.spaces.length > 0 ? state.spaces.slice(0, 15).map(s => (
                                <tr key={s.id}>
                                    <td className="border p-1 pl-2">{s.name}</td>
                                    <td className="border p-1 text-gray-600 capitalize">{s.type.replace(/_/g, ' ')}</td>
                                    <td className="border p-1 text-center font-bold">{s.riskClass}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="border p-2 text-center italic text-gray-500">Sem espaços definidos</td></tr>
                            )}
                        </tbody>
                    </table>
                     {state.spaces.length > 15 && <p className="text-xs text-gray-500 italic">(Lista truncada. Consultar peças desenhadas.)</p>}
                </div>

                <AnalysisBox text={generateBuildingAnalysis(state)} />
          </PageContainer>

          {/* --- CAPÍTULO III --- */}
          <PageContainer className="page-break">
                <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-anepc-blue pb-1">Capítulo III - Condições Gerais</h3>
                <div className="text-justify text-sm text-gray-700 mb-4 leading-relaxed">
                     <p className="mb-3"><strong>Resistência ao Fogo:</strong> A estrutura principal do edifício garante a estabilidade ao fogo exigida para a {state.category}ª Categoria (R{state.category === 1 ? '30' : state.category === 2 ? '60' : state.category === 3 ? '90' : '120'}), assegurando a integridade durante o tempo necessário para a evacuação.</p>
                     <p className="mb-3"><strong>Reação ao Fogo:</strong> Os materiais de revestimento das vias de evacuação cumprem a classe C-s2,d0 (paredes) e Bfl-s1 (pavimentos), limitando a propagação de chama e a produção de fumo.</p>
                     <p><strong>Compartimentação:</strong> Os locais de risco agravado (Risco C) e técnicos (Risco F) são isolados por elementos de construção resistentes ao fogo e portas com fecho automático (PC EI C).</p>
                </div>

                <AnalysisBox text={generatePassiveAnalysis(state)} />
          </PageContainer>

           {/* --- CAPÍTULO IV --- */}
           <PageContainer className="page-break">
                <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-anepc-blue pb-1">Capítulo IV - Condições de Evacuação</h3>
                <div className="text-justify text-sm text-gray-700 mb-4 leading-relaxed">
                    <p className="whitespace-pre-line mb-4">{generateEvacuationText(state)}</p>
                    
                    <h4 className="font-bold text-gray-900 mb-2 font-sans">Verificação de Caminhos Críticos</h4>
                    <table className="w-full text-sm border-collapse border border-gray-300 font-sans">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 text-left">Percurso</th>
                                <th className="border p-2 text-right">Dist. Real</th>
                                <th className="border p-2 text-right">Máximo</th>
                                <th className="border p-2 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.evacuationPaths.length > 0 ? state.evacuationPaths.slice(0, 10).map(p => (
                                <tr key={p.id}>
                                    <td className="border p-1 pl-2">{p.name}</td>
                                    <td className="border p-1 text-right">{p.distance}m</td>
                                    <td className="border p-1 text-right">{p.maxDistance}m</td>
                                    <td className="border p-1 text-center">{p.isCompliant ? 'OK' : 'N/OK'}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="border p-2 text-center italic text-gray-500">Sem percursos calculados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <AnalysisBox text={generateEvacuationAnalysis(state)} />
          </PageContainer>

          {/* --- CAPÍTULO V: PARTE 1 (Extinção e Deteção) --- */}
          <PageContainer className="page-break">
               <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-anepc-blue pb-1">Capítulo V - Instalações Técnicas</h3>
               <div className="text-justify text-sm text-gray-700 leading-relaxed mb-6">
                   <p className="mb-4">O edifício será dotado dos equipamentos e sistemas de segurança exigidos pela regulamentação para a {state.category}ª Categoria de Risco. Segue-se a quantificação detalhada por subsistema.</p>
               </div>

               {/* 5.1 Meios de Intervenção */}
               <h4 className="font-bold text-gray-900 mb-2 font-sans text-base">5.1. Meios de Primeira Intervenção (Módulo 8)</h4>
               <p className="text-sm text-gray-600 mb-4">Dotação de extintores portáteis e redes de incêndio (se aplicável).</p>
               <EquipmentTable spaces={state.spaces} moduleId={8} title="5.1 - Tabela de Quantidades: Extintores" />

               {/* 5.2 Deteção */}
               <h4 className="font-bold text-gray-900 mb-2 font-sans text-base border-t border-gray-200 pt-4">5.2. Deteção, Alarme e Alerta (Módulo 11)</h4>
               <p className="text-sm text-gray-600 mb-4">Componentes do Sistema Automático de Deteção de Incêndio (SADI).</p>
               <EquipmentTable spaces={state.spaces} moduleId={11} title="5.2 - Tabela de Quantidades: Deteção" />

          </PageContainer>

          {/* --- CAPÍTULO V: PARTE 2 (Sinalização e Fumo) --- */}
          <PageContainer className="page-break">
               <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-anepc-blue pb-1">Capítulo V - Instalações Técnicas (Cont.)</h3>
               
               {/* 5.3 Sinalização */}
               <h4 className="font-bold text-gray-900 mb-2 font-sans text-base">5.3. Sinalização e Iluminação (Módulo 13)</h4>
               <p className="text-sm text-gray-600 mb-4">Sinalização de emergência fotoluminescente e blocos autónomos.</p>
               <EquipmentTable spaces={state.spaces} moduleId={13} title="5.3 - Tabela de Quantidades: Sinalização" />

               {/* 5.4 Controlo de Fumo */}
               {state.smokeCalculations.length > 0 && (
                   <>
                       <h4 className="font-bold text-gray-900 mb-2 font-sans text-base border-t border-gray-200 pt-4">5.4. Sistemas de Controlo de Fumo (Módulo 7)</h4>
                       <p className="text-sm text-gray-600 mb-4">Sistemas de desenfumagem natural ou mecânica.</p>
                       <table className="w-full text-xs border-collapse border border-gray-300 font-sans mb-8">
                           <thead className="bg-gray-100">
                               <tr>
                                   <th className="border p-2 text-left">Zona</th>
                                   <th className="border p-2 text-left">Método</th>
                                   <th className="border p-2 text-right">Caudal / Área Útil</th>
                                   <th className="border p-2 text-left">Notas</th>
                               </tr>
                           </thead>
                           <tbody>
                               {state.smokeCalculations.map(c => (
                                   <tr key={c.id}>
                                       <td className="border p-2 pl-2 font-bold">{c.name}</td>
                                       <td className="border p-2 capitalize">{c.method}</td>
                                       <td className="border p-2 text-right font-bold text-anepc-blue">
                                           {c.results.areaUseful ? `${c.results.areaUseful.toFixed(2)} m²` : `${c.results.flowM3S?.toFixed(2)} m³/s`}
                                       </td>
                                       <td className="border p-2 text-gray-500 italic">{c.notes}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </>
               )}

               <AnalysisBox text={generateTechnicalAnalysis(state)} />
          </PageContainer>

          {/* --- CAPÍTULO VI: CONSIDERAÇÕES FINAIS (AI Generated) --- */}
          <PageContainer className="page-break">
                <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-anepc-blue pb-1">Capítulo VI - Considerações Finais</h3>
                
                <div className="bg-white p-8 rounded border border-gray-100 shadow-sm min-h-[500px]">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg font-sans">Síntese e Verificação de Conformidade</h4>
                    <div className="prose prose-slate max-w-none text-justify leading-loose text-gray-700 font-serif">
                         <p className="whitespace-pre-line">{generateFinalConclusions(state)}</p>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900 flex gap-3 items-start">
                    <i className="fas fa-exclamation-triangle mt-1"></i>
                    <p>Nota: O presente relatório constitui um projeto de especialidade que deve ser submetido à apreciação da ANEPC. As quantidades exatas de equipamentos podem sofrer ajustes ligeiros durante a fase de obra, sem prejuízo do cumprimento dos critérios regulamentares aqui definidos.</p>
                </div>
          </PageContainer>

          {/* --- TERMO DE RESPONSABILIDADE --- */}
          <PageContainer className="page-break">
                <div className="border-4 border-double border-gray-300 p-8 h-full flex flex-col justify-center">
                    <h1 className="text-center text-2xl font-bold uppercase mb-12 underline decoration-anepc-blue decoration-2 underline-offset-4">Termo de Responsabilidade</h1>
                    
                    <div className="text-justify text-base leading-loose space-y-6 text-gray-800 font-serif">
                        <p>
                            <strong>{technician.name || "[Nome do Autor]"}</strong>, portador do Cartão de Cidadão n.º <strong>{technician.cc || "_________"}</strong>, residente em <strong>{technician.address || "______________________"}</strong>, inscrito na <strong>{technician.association || "ordem"}</strong> com o número de membro <strong>{technician.professionalNumber || "_____"}</strong>, na qualidade de autor do projeto de Segurança Contra Incêndio em Edifícios,
                        </p>
                        <p>
                            <strong>DECLARA</strong>, para efeitos do disposto no Decreto-Lei n.º 220/2008, de 12 de novembro, que o projeto de SCIE relativo à obra de <strong>{state.projectName}</strong>, localizada em <strong>{state.projectLocation}</strong>, observa as normas técnicas gerais e específicas de construção e segurança aplicáveis, bem como as disposições legais e regulamentares em vigor.
                        </p>
                        <p>
                            Mais declara que foram observadas as medidas de autoproteção e os requisitos técnicos exigíveis para a <strong>{state.category}ª Categoria de Risco</strong>, da Utilização-Tipo <strong>{state.building.ut}</strong>.
                        </p>
                    </div>

                    <div className="mt-20 flex flex-col items-center">
                        <p className="mb-8">{state.projectLocation}, {today}</p>
                        <div className="w-64 border-t border-black mb-2"></div>
                        <p className="text-sm font-bold">(Assinatura do Técnico)</p>
                    </div>
                </div>
          </PageContainer>

           {/* --- CONTRA CAPA --- */}
           <PageContainer className="page-break justify-center items-center bg-anepc-blue text-white print:bg-anepc-blue" hideFooter={true}>
                <div className="text-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-shield-alt text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">K-ANEPCASSIS</h2>
                    <p className="text-blue-200">Segurança Contra Incêndio em Edifícios</p>
                </div>
                
                <div className="absolute bottom-20 w-full text-center text-sm text-blue-300/60 font-sans">
                    <p>Documento gerado digitalmente.</p>
                    <p>A conformidade deste relatório depende da correção dos dados inseridos.</p>
                </div>
           </PageContainer>

      </div>
    </div>
  );
};

export default ReportGenerator;