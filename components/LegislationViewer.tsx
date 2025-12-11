import React, { useState, useMemo } from 'react';

interface LegislationItem {
  id: string;
  category: string;
  title: string;
  tags: string[];
  url?: string; // New field for external links
  content: React.ReactNode;
}

// Helper component for section headers in tables
const TableHeader = ({ children, width }: { children?: React.ReactNode, width?: string }) => (
  <th className={`px-4 py-2 bg-anepc-blue text-white font-semibold border border-blue-800 text-sm ${width || ''}`}>{children}</th>
);

const TableCell = ({ children, className = "", rowSpan = 1, colSpan = 1, isHeader = false }: { children?: React.ReactNode, className?: string, rowSpan?: number, colSpan?: number, isHeader?: boolean }) => {
    if (isHeader) {
        return <th rowSpan={rowSpan} colSpan={colSpan} className={`px-4 py-2 border border-gray-300 text-sm font-bold bg-gray-50 text-left text-gray-800 ${className}`}>{children}</th>;
    }
    return <td rowSpan={rowSpan} colSpan={colSpan} className={`px-4 py-2 border border-gray-300 text-sm text-gray-700 ${className}`}>{children}</td>;
};

const LEGISLATION_DB: LegislationItem[] = [
    // --- DL 220/2008 (RJ-SCIE) ---
    {
        id: 'dl220-def',
        category: 'DL 220/2008 (RJ-SCIE)',
        title: 'Definições Importantes (Art. 8º)',
        tags: ['definições', 'altura', 'efetivo', 'plano referencia'],
        url: 'https://diariodarepublica.pt/dr/detalhe/decreto-lei/220-2008-243980',
        content: (
            <div className="space-y-4 text-sm text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <strong className="text-gray-900 block mb-1">Altura do Edifício</strong>
                        <p>Diferença de cota entre o plano de referência e o último piso acima do solo suscetível de ocupação. (Exclui zonas técnicas no topo).</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <strong className="text-gray-900 block mb-1">Plano de Referência</strong>
                        <p>Plano de nível, à cota de pavimento, que permite o acesso das viaturas de socorro e o desenvolvimento de operações de salvamento.</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <strong className="text-gray-900 block mb-1">Efetivo</strong>
                        <p>Número máximo estimado de pessoas que podem ocupar em simultâneo um dado espaço, calculado em função da densidade de ocupação.</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <strong className="text-gray-900 block mb-1">Locais de Risco</strong>
                        <p>Classificação dos espaços (A a F) em função da sua utilização, carga de incêndio e risco específico.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'dl220-riscos',
        category: 'DL 220/2008 (RJ-SCIE)',
        title: 'Classificação de Locais de Risco (Art. 10º)',
        tags: ['risco', 'locais', 'A', 'B', 'C', 'D', 'E', 'F'],
        url: 'https://diariodarepublica.pt/dr/detalhe/decreto-lei/220-2008-243980',
        content: (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <TableHeader width="10%">Risco</TableHeader>
                            <TableHeader>Descrição Resumida</TableHeader>
                            <TableHeader>Exemplos</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <TableCell className="font-bold text-center bg-green-50 text-green-800">A</TableCell>
                            <TableCell>Sem riscos especiais</TableCell>
                            <TableCell>Habitação, escritórios administrativos.</TableCell>
                        </tr>
                        <tr>
                            <TableCell className="font-bold text-center bg-yellow-50 text-yellow-800">B</TableCell>
                            <TableCell>Acessíveis ao público (&gt;100 pessoas ou características específicas)</TableCell>
                            <TableCell>Auditórios, átrios, salas de espera, restaurantes.</TableCell>
                        </tr>
                        <tr>
                            <TableCell className="font-bold text-center bg-orange-50 text-orange-800">C</TableCell>
                            <TableCell>Risco Agravado (Carga térmica ou substâncias)</TableCell>
                            <TableCell>Armazéns, arquivos, oficinas, cozinhas, cenários.</TableCell>
                        </tr>
                        <tr>
                            <TableCell className="font-bold text-center bg-red-50 text-red-800">D</TableCell>
                            <TableCell>Pessoas acamadas / mobilidade reduzida</TableCell>
                            <TableCell>Enfermarias, lares de idosos, unidades de cuidados.</TableCell>
                        </tr>
                        <tr>
                            <TableCell className="font-bold text-center bg-purple-50 text-purple-800">E</TableCell>
                            <TableCell>Locais de dormida</TableCell>
                            <TableCell>Quartos de hotel, camaratas, residências.</TableCell>
                        </tr>
                        <tr>
                            <TableCell className="font-bold text-center bg-gray-100 text-gray-800">F</TableCell>
                            <TableCell>Serviços técnicos e controlo</TableCell>
                            <TableCell>Centrais térmicas, quadros elétricos, centros de gestão.</TableCell>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },

    // --- PORTARIA 1532/2008 (RT-SCIE) ---
    {
        id: 'rt-scie-reacao',
        category: 'Portaria 1532/2008 (RT-SCIE)',
        title: 'Classes de Reação ao Fogo (Euroclasses)',
        tags: ['reação', 'fogo', 'materiais', 'euroclasses'],
        url: 'https://diariodarepublica.pt/dr/detalhe/portaria/1532-2008-244583',
        content: (
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Classificação europeia (EN 13501-1) obrigatória para materiais de construção.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                <TableHeader>Euroclasse</TableHeader>
                                <TableHeader>Classificação Antiga (M)</TableHeader>
                                <TableHeader>Comportamento</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <TableCell className="font-bold">A1</TableCell>
                                <TableCell>M0</TableCell>
                                <TableCell className="text-left">Incombustível. Não contribui para o fogo.</TableCell>
                            </tr>
                            <tr>
                                <TableCell className="font-bold">A2</TableCell>
                                <TableCell>M0 / M1</TableCell>
                                <TableCell className="text-left">Incombustível / Combustibilidade muito limitada.</TableCell>
                            </tr>
                            <tr>
                                <TableCell className="font-bold">B</TableCell>
                                <TableCell>M1</TableCell>
                                <TableCell className="text-left">Combustível. Contribuição muito limitada para o fogo.</TableCell>
                            </tr>
                            <tr>
                                <TableCell className="font-bold">C</TableCell>
                                <TableCell>M2</TableCell>
                                <TableCell className="text-left">Combustível. Contribuição limitada para o fogo.</TableCell>
                            </tr>
                            <tr>
                                <TableCell className="font-bold">D</TableCell>
                                <TableCell>M3</TableCell>
                                <TableCell className="text-left">Combustível. Contribuição aceitável para o fogo.</TableCell>
                            </tr>
                            <tr>
                                <TableCell className="font-bold">E</TableCell>
                                <TableCell>M4</TableCell>
                                <TableCell className="text-left">Combustível. Contribuição elevada.</TableCell>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 border border-blue-100 mt-2">
                    <p><strong>Sub-classificações Adicionais:</strong></p>
                    <ul className="list-disc pl-4 mt-1">
                        <li><strong>Fumo (s):</strong> s1 (fraca emissão), s2 (média), s3 (elevada).</li>
                        <li><strong>Gotejamento (d):</strong> d0 (nulo), d1 (lento), d2 (elevado).</li>
                    </ul>
                    <p className="mt-1 italic">Exemplo típico para vias de evacuação: <strong>C-s2,d0</strong> (Paredes) / <strong>Bfl-s1</strong> (Pavimentos).</p>
                </div>
            </div>
        )
    },
     {
        id: 'rt-scie-larguras',
        category: 'Portaria 1532/2008 (RT-SCIE)',
        title: 'Cálculo de Larguras de Evacuação (UP)',
        tags: ['evacuação', 'larguras', 'UP', 'calculo'],
        url: 'https://diariodarepublica.pt/dr/detalhe/portaria/1532-2008-244583',
        content: (
            <div className="space-y-4 text-sm">
                <p>A largura útil dos caminhos de evacuação e das saídas é medida em Unidades de Passagem (UP).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="border border-gray-200 rounded-lg p-4">
                         <h4 className="font-bold text-gray-800 mb-2">Correspondência Métrica</h4>
                         <ul className="space-y-2">
                             <li className="flex justify-between border-b border-gray-100 pb-1">
                                 <span>1 UP</span>
                                 <span className="font-bold text-anepc-blue">0,90 m</span>
                             </li>
                             <li className="flex justify-between border-b border-gray-100 pb-1">
                                 <span>2 UP</span>
                                 <span className="font-bold text-anepc-blue">1,40 m</span>
                             </li>
                             <li className="flex justify-between pb-1">
                                 <span>N UP (N > 2)</span>
                                 <span className="font-bold text-anepc-blue">N × 0,60 m</span>
                             </li>
                         </ul>
                     </div>
                     <div className="border border-gray-200 rounded-lg p-4">
                         <h4 className="font-bold text-gray-800 mb-2">Dimensionamento (Regra Geral)</h4>
                         <p className="mb-2">O número de UP calcula-se arredondando por excesso:</p>
                         <div className="bg-gray-100 p-2 rounded text-center font-mono font-bold">
                             UP = Efetivo / 100
                         </div>
                         <p className="text-xs text-gray-500 mt-2">Nota: Para efetivos pequenos (&le; 50), aceita-se 1 UP (0,90m) em certas condições, mas 2 UP é o padrão para saídas principais de edifícios públicos.</p>
                     </div>
                </div>
            </div>
        )
    },

    // --- PORTARIA 135/2020 ---
    {
        id: 'port135-intro',
        category: 'Portaria 135/2020 (Alterações)',
        title: 'Principais Alterações ao RT-SCIE',
        tags: ['alteração', 'decreto-lei', '220/2008'],
        url: 'https://diariodarepublica.pt/dr/detalhe/portaria/135-2020-135182189',
        content: (
            <div className="space-y-4 text-sm text-gray-700">
                <p><strong>Portaria n.º 135/2020 de 2 de junho</strong></p>
                <p>Alterações principais:</p>
                <ul className="list-disc pl-5">
                    <li><strong>Vias de Acesso:</strong> Largura mínima de 3,5m (H≤9m) ou 6m (H>9m).</li>
                    <li><strong>Condições de Evacuação:</strong> Ajuste nas distâncias máximas a percorrer.</li>
                    <li><strong>Instalações Técnicas:</strong> Novos requisitos para postos de carregamento de veículos elétricos.</li>
                    <li><strong>Anexo II:</strong> Criação de regulamento específico para Recintos Itinerantes ou Provisórios.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'port135-evacuacao',
        category: 'Portaria 135/2020 (Alterações)',
        title: 'Novas Distâncias de Evacuação (Art. 57º e 61º)',
        tags: ['evacuação', 'distancia', 'impasse'],
        url: 'https://diariodarepublica.pt/dr/detalhe/portaria/135-2020-135182189',
        content: (
            <div className="space-y-4">
                <div className="overflow-x-auto">
                     <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                <TableHeader>Local</TableHeader>
                                <TableHeader>Impasse</TableHeader>
                                <TableHeader>Saídas Distintas</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                             <tr>
                                <TableCell isHeader>Locais de Permanência</TableCell>
                                <TableCell>15 m</TableCell>
                                <TableCell>30 m*</TableCell>
                            </tr>
                            <tr>
                                <TableCell isHeader>Vias Horizontais</TableCell>
                                <TableCell>15 m (10m risco D/E)</TableCell>
                                <TableCell>30 m (20m risco B, pisos altos/baixos)</TableCell>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-gray-500 mt-2">* Em locais amplos (>800m²) a distância pode ser aumentada em 50%.</p>
                </div>
            </div>
        )
    },

    // --- APSAD R17 ---
    {
        id: 'apsad-summary',
        category: 'Norma APSAD R17',
        title: 'Resumo Regra R17 (Desenfumagem Natural)',
        tags: ['apsad', 'fumo', 'exutores', 'cantao'],
        url: 'https://cnpp.com',
        content: (
            <div className="space-y-4 text-sm text-gray-700">
                <p><strong>Objetivo:</strong> Dimensionamento de sistemas de desenfumagem natural em edifícios industriais e comerciais.</p>
                
                <h4 className="font-bold text-gray-800">Conceitos Chave:</h4>
                <ul className="list-disc pl-5">
                    <li><strong>Cantão (S_canton):</strong> Zona delimitada por sancas de fumo. Área máx: 1600 m². Comprimento máx: 60 m.</li>
                    <li><strong>Altura (H):</strong> Média entre o ponto mais alto e mais baixo da cobertura.</li>
                    <li><strong>Área Útil (S_ui):</strong> Área efetiva de passagem de fumo dos exutores.</li>
                </ul>

                <h4 className="font-bold text-gray-800 mt-4">Fórmula Simplificada:</h4>
                <div className="bg-gray-50 p-3 rounded font-mono border border-gray-200 text-center">
                    S_ui = S_canton × α
                </div>
                <p className="text-xs text-gray-500 mt-1">O coeficiente Alpha (α) varia tipicamente entre 0.5% e 2.5% dependendo da altura e risco.</p>
            </div>
        )
    },
    {
        id: 'apsad-table',
        category: 'Norma APSAD R17',
        title: 'Tabela Indicativa Coeficientes Alpha',
        tags: ['tabela', 'alpha', 'coeficiente'],
        content: (
            <div className="overflow-x-auto">
                 <table className="w-full text-center border-collapse text-xs">
                    <thead>
                        <tr>
                            <TableHeader>Altura H (m)</TableHeader>
                            <TableHeader>Risco 1 (Baixo)</TableHeader>
                            <TableHeader>Risco 2 (Médio)</TableHeader>
                            <TableHeader>Risco 3 (Alto)</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><TableCell>3 m</TableCell><TableCell>0.50 %</TableCell><TableCell>0.80 %</TableCell><TableCell>1.20 %</TableCell></tr>
                        <tr><TableCell>6 m</TableCell><TableCell>0.75 %</TableCell><TableCell>1.20 %</TableCell><TableCell>1.80 %</TableCell></tr>
                        <tr><TableCell>9 m</TableCell><TableCell>1.00 %</TableCell><TableCell>1.50 %</TableCell><TableCell>2.10 %</TableCell></tr>
                        <tr><TableCell>> 12 m</TableCell><TableCell>1.20 %</TableCell><TableCell>1.80 %</TableCell><TableCell>2.50 %</TableCell></tr>
                    </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">* Valores meramente indicativos para pré-dimensionamento.</p>
            </div>
        )
    },

    // --- TABELAS CATEGORIAS DE RISCO (DL 220/2008) ---
    {
        id: 'ut1-cat',
        category: 'Categorias de Risco (Tabelas)',
        title: 'UT I - Habitacionais',
        tags: ['risco', 'categoria', 'habitacao', 'UT I'],
        content: (
            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <TableHeader width="20%">Critérios</TableHeader>
                            <TableHeader width="20%">1.ª Cat</TableHeader>
                            <TableHeader width="20%">2.ª Cat</TableHeader>
                            <TableHeader width="20%">3.ª Cat</TableHeader>
                            <TableHeader width="20%">4.ª Cat</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <TableCell isHeader>Altura do Edifício</TableCell>
                            <TableCell>≤ 9 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>≤ 50 m</TableCell>
                            <TableCell>&gt; 50 m</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Pisos abaixo plano ref.</TableCell>
                            <TableCell>≤ 1</TableCell>
                            <TableCell>≤ 3</TableCell>
                            <TableCell>≤ 5</TableCell>
                            <TableCell>&gt; 5</TableCell>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },
    {
        id: 'ut2-cat',
        category: 'Categorias de Risco (Tabelas)',
        title: 'UT II - Estacionamentos',
        tags: ['risco', 'categoria', 'garagem', 'UT II'],
        content: (
            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <TableHeader width="20%">Critérios</TableHeader>
                            <TableHeader width="20%">1.ª Cat</TableHeader>
                            <TableHeader width="20%">2.ª Cat</TableHeader>
                            <TableHeader width="20%">3.ª Cat</TableHeader>
                            <TableHeader width="20%">4.ª Cat</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <TableCell isHeader>Altura do Edifício</TableCell>
                            <TableCell>≤ 9 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>&gt; 28 m</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Área Bruta Total</TableCell>
                            <TableCell>≤ 3.200 m²</TableCell>
                            <TableCell>≤ 9.600 m²</TableCell>
                            <TableCell>≤ 32.000 m²</TableCell>
                            <TableCell>&gt; 32.000 m²</TableCell>
                        </tr>
                         <tr>
                            <TableCell isHeader>Pisos abaixo plano ref.</TableCell>
                            <TableCell>≤ 1</TableCell>
                            <TableCell>≤ 3</TableCell>
                            <TableCell>≤ 5</TableCell>
                            <TableCell>&gt; 5</TableCell>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },
    {
        id: 'ut3-cat',
        category: 'Categorias de Risco (Tabelas)',
        title: 'UT III - Administrativos',
        tags: ['risco', 'categoria', 'escritorio', 'UT III'],
        content: (
            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <TableHeader width="20%">Critérios</TableHeader>
                            <TableHeader width="20%">1.ª Cat</TableHeader>
                            <TableHeader width="20%">2.ª Cat</TableHeader>
                            <TableHeader width="20%">3.ª Cat</TableHeader>
                            <TableHeader width="20%">4.ª Cat</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <TableCell isHeader>Altura do Edifício</TableCell>
                            <TableCell>≤ 9 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>≤ 50 m</TableCell>
                            <TableCell>&gt; 50 m</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Efetivo Total</TableCell>
                            <TableCell>≤ 100</TableCell>
                            <TableCell>≤ 1.000</TableCell>
                            <TableCell>≤ 5.000</TableCell>
                            <TableCell>&gt; 5.000</TableCell>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },
    {
        id: 'ut-group-1-cat',
        category: 'Categorias de Risco (Tabelas)',
        title: 'UT IV, V, VII, X, XI - Escolares, Hospitalares, Hotéis, Museus, Bibliotecas',
        tags: ['risco', 'categoria', 'escolar', 'hotel', 'hospital', 'UT IV', 'UT V', 'UT VII', 'UT X', 'UT XI'],
        content: (
            <div className="overflow-x-auto">
                <p className="text-xs text-gray-500 mb-2">Aplicável a: Escolares, Hospitalares, Lares de Idosos, Hoteleiros, Restauração, Museus e Bibliotecas.</p>
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <TableHeader width="20%">Critérios</TableHeader>
                            <TableHeader width="20%">1.ª Cat</TableHeader>
                            <TableHeader width="20%">2.ª Cat</TableHeader>
                            <TableHeader width="20%">3.ª Cat</TableHeader>
                            <TableHeader width="20%">4.ª Cat</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <TableCell isHeader>Altura do Edifício</TableCell>
                            <TableCell>≤ 9 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>&gt; 28 m</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Efetivo Total</TableCell>
                            <TableCell>≤ 100</TableCell>
                            <TableCell>≤ 1.000</TableCell>
                            <TableCell>≤ 5.000</TableCell>
                            <TableCell>&gt; 5.000</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Pisos abaixo plano ref.</TableCell>
                            <TableCell>≤ 1</TableCell>
                            <TableCell>≤ 2</TableCell>
                            <TableCell>≤ 3</TableCell>
                            <TableCell>&gt; 3</TableCell>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },
    {
        id: 'ut-group-2-cat',
        category: 'Categorias de Risco (Tabelas)',
        title: 'UT VI, IX - Espetáculos e Desportivos',
        tags: ['risco', 'categoria', 'espetaculos', 'desportivo', 'UT VI', 'UT IX'],
        content: (
            <div className="overflow-x-auto">
                <p className="text-xs text-gray-500 mb-2">Aplicável a: Teatros, Cinemas, Auditórios, Salas de Conferência, Recintos Desportivos, Pavilhões.</p>
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <TableHeader width="20%">Critérios</TableHeader>
                            <TableHeader width="20%">1.ª Cat</TableHeader>
                            <TableHeader width="20%">2.ª Cat</TableHeader>
                            <TableHeader width="20%">3.ª Cat</TableHeader>
                            <TableHeader width="20%">4.ª Cat</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <TableCell isHeader>Altura do Edifício</TableCell>
                            <TableCell>≤ 9 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>&gt; 28 m</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Efetivo Total</TableCell>
                            <TableCell>≤ 100</TableCell>
                            <TableCell>≤ 1.000</TableCell>
                            <TableCell>≤ 5.000</TableCell>
                            <TableCell>&gt; 5.000</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Pisos abaixo plano ref.</TableCell>
                            <TableCell>≤ 1</TableCell>
                            <TableCell>≤ 2</TableCell>
                            <TableCell>≤ 3</TableCell>
                            <TableCell>&gt; 3</TableCell>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },
    {
        id: 'ut8-cat',
        category: 'Categorias de Risco (Tabelas)',
        title: 'UT VIII - Comerciais e Gares',
        tags: ['risco', 'categoria', 'comercio', 'lojas', 'UT VIII'],
        content: (
            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <TableHeader width="20%">Critérios</TableHeader>
                            <TableHeader width="20%">1.ª Cat</TableHeader>
                            <TableHeader width="20%">2.ª Cat</TableHeader>
                            <TableHeader width="20%">3.ª Cat</TableHeader>
                            <TableHeader width="20%">4.ª Cat</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <TableCell isHeader>Altura do Edifício</TableCell>
                            <TableCell>≤ 9 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>&gt; 28 m</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Área Bruta Total</TableCell>
                            <TableCell>≤ 300 m²</TableCell>
                            <TableCell>≤ 3.000 m²</TableCell>
                            <TableCell>≤ 10.000 m²</TableCell>
                            <TableCell>&gt; 10.000 m²</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Pisos abaixo plano ref.</TableCell>
                            <TableCell>≤ 1</TableCell>
                            <TableCell>≤ 2</TableCell>
                            <TableCell>≤ 3</TableCell>
                            <TableCell>&gt; 3</TableCell>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },
    {
        id: 'ut12-cat',
        category: 'Categorias de Risco (Tabelas)',
        title: 'UT XII - Industriais',
        tags: ['risco', 'categoria', 'industria', 'armazens', 'UT XII'],
        content: (
             <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <TableHeader width="20%">Critérios</TableHeader>
                            <TableHeader width="20%">1.ª Cat</TableHeader>
                            <TableHeader width="20%">2.ª Cat</TableHeader>
                            <TableHeader width="20%">3.ª Cat</TableHeader>
                            <TableHeader width="20%">4.ª Cat</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <TableCell isHeader>Altura do Edifício</TableCell>
                            <TableCell>≤ 9 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>≤ 28 m</TableCell>
                            <TableCell>&gt; 28 m</TableCell>
                        </tr>
                        <tr>
                            <TableCell isHeader>Área Bruta Total</TableCell>
                            <TableCell>≤ 1.000 m²</TableCell>
                            <TableCell>≤ 5.000 m²</TableCell>
                            <TableCell>≤ 20.000 m²</TableCell>
                            <TableCell>&gt; 20.000 m²</TableCell>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },
];

const UT_LIST = [
    'DL 220/2008 (RJ-SCIE)',
    'Portaria 1532/2008 (RT-SCIE)',
    'Portaria 135/2020 (Alterações)',
    'Categorias de Risco (Tabelas)',
    'Norma APSAD R17'
];

const LegislationViewer: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('DL 220/2008 (RJ-SCIE)');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        return LEGISLATION_DB.filter(item => {
            const matchesCategory = item.category === selectedCategory;
            const matchesSearch = 
                searchTerm === '' ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tags.some(t => t.includes(searchTerm.toLowerCase()));
            
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchTerm]);

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] gap-4">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-72 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Documentos Legais</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {UT_LIST.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setSearchTerm(''); }}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 flex justify-between items-center ${
                                selectedCategory === cat 
                                    ? 'bg-anepc-blue text-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <span>{cat}</span>
                            {selectedCategory === cat && <i className="fas fa-chevron-right text-xs opacity-50"></i>}
                        </button>
                    ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 text-center">
                    Fonte: Diário da República Eletrónico
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Search Header */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-anepc-blue rounded-lg flex items-center justify-center">
                            <i className="fas fa-book"></i>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{selectedCategory}</h2>
                            <p className="text-xs text-gray-500">Visualização de critérios e tabelas</p>
                        </div>
                    </div>
                    
                    <div className="relative w-full sm:w-64">
                        <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-sm"></i>
                        <input 
                            type="text" 
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-anepc-blue focus:border-anepc-blue"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {filteredItems.length > 0 ? (
                        <div className="space-y-8">
                            {filteredItems.map(item => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center flex-wrap gap-2">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-800">{item.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.url && (
                                                <a 
                                                    href={item.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-2 py-1 bg-blue-50 text-anepc-blue text-xs font-bold rounded hover:bg-blue-100 transition-colors border border-blue-200"
                                                    title="Abrir documento oficial"
                                                >
                                                    <i className="fas fa-external-link-alt mr-1"></i> Fonte Oficial
                                                </a>
                                            )}
                                            {item.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] rounded-full uppercase hidden sm:inline-block">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 overflow-x-auto">
                                        {item.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <i className="fas fa-search text-4xl mb-3 opacity-20"></i>
                            <p>Nenhum resultado encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegislationViewer;