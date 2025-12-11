import React, { useState, useMemo, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { RiskLocation, Space } from '../types';

const Tooltip = ({ text }: { text: string }) => (
  <div className="relative group inline-flex ml-2 align-middle z-50">
    <i className="fas fa-question-circle text-gray-400 hover:text-anepc-blue cursor-help transition-colors text-[10px]"></i>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] leading-tight rounded shadow-lg hidden group-hover:block z-50 pointer-events-none text-center font-normal">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

// DENSIDADES DE OCUPAÇÃO (Baseado no Art. 54º da Portaria 1532/2008)
// factor: m² por pessoa (dividir área por isto)
// ou se factor < 1, funciona como pessoas por m² (mas aqui normalizamos para m²/pessoa para consistência de código, exceto casos especiais)
const DENSITY_TABLE: Record<string, { factor: number; label: string; desc: string }> = {
    // Administrativos
    'escritorio': { factor: 10, label: '1 pax / 10 m²', desc: 'Escritórios e gabinetes (Art. 54º)' },
    'reuniao': { factor: 1, label: '1 pax / 1 m²', desc: 'Salas de reunião/conferência (s/ lugares fixos)' },
    'sala_aula': { factor: 1.5, label: '1 pax / 1.5 m²', desc: 'Salas de formação/escolar' },
    'atrio': { factor: 3, label: '1 pax / 3 m²', desc: 'Átrios e gares (piso não saída)' },

    // Público e Comércio
    'comercio': { factor: 3, label: '1 pax / 3 m²', desc: 'Lojas e Centros Comerciais (pisos gerais)' },
    'restaurante': { factor: 1.5, label: '1 pax / 1.5 m²', desc: 'Zona de público (sentado)' },
    'auditorio': { factor: 1, label: '1 pax / m²', desc: 'Salas polivalentes / Espetáculos (estimativa s/ lugares fixos)' },
    'biblioteca': { factor: 10, label: '1 pax / 10 m²', desc: 'Salas de leitura e arquivos' },
    'ginasio': { factor: 4, label: '1 pax / 4 m²', desc: 'Áreas desportivas de prática' },

    // Alojamento (Regra: Nº camas, mas aqui usamos área média para estimativa)
    'dormitorio': { factor: 10, label: '~1 pax / 10 m²', desc: 'Estimativa por área (Deve usar nº camas real)' },
    'sala_estar': { factor: 2, label: '1 pax / 2 m²', desc: 'Salas de estar e convívio' },
    'enfermaria': { factor: 10, label: '~1 pax / 10 m²', desc: 'Estimativa (Deve usar nº camas real)' },
    'consultorio': { factor: 10, label: '1 pax / 10 m²', desc: 'Gabinetes de consulta' },

    // Serviço e Indústria
    'cozinha': { factor: 10, label: '1 pax / 10 m²', desc: 'Cozinhas industriais' },
    'lavandaria': { factor: 10, label: '1 pax / 10 m²', desc: 'Zonas de serviço' },
    'armazem': { factor: 40, label: '1 pax / 40 m²', desc: 'Armazéns e depósitos' },
    'oficina': { factor: 15, label: '1 pax / 15 m²', desc: 'Oficinas e laboratórios industriais' },
    'laboratorio': { factor: 10, label: '1 pax / 10 m²', desc: 'Laboratórios de investigação' },
    'garagem': { factor: 40, label: '1 pax / 40 m²', desc: 'Estacionamento' },
    'sanitarios': { factor: 0, label: '-', desc: 'Não contribui para efetivo (normalmente)' },

    // Técnicos
    'tecnico': { factor: 0, label: 'Ocup. Nula', desc: 'Acesso apenas a manutenção' },
    'bastidor': { factor: 0, label: 'Ocup. Nula', desc: 'Acesso apenas a manutenção' },
    'posto_seguranca': { factor: 5, label: '1 pax / 5 m²', desc: 'Postos de trabalho permanentes' },
    'central_termica': { factor: 0, label: 'Ocup. Nula', desc: 'Local Técnico' },
    'gerador': { factor: 0, label: 'Ocup. Nula', desc: 'Local Técnico' },
    'transformador': { factor: 0, label: 'Ocup. Nula', desc: 'Local Técnico' },
    'lixos': { factor: 0, label: 'Ocup. Nula', desc: 'Local Técnico' },

    // Outros
    'circulacao': { factor: 0, label: '-', desc: 'Zonas de passagem (exceto se usadas p/ espera)' },
};

const Module2Spaces: React.FC = () => {
  const { state, addSpace, removeSpace } = useProject();
  
  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newOccupancy, setNewOccupancy] = useState('');
  const [isBedridden, setIsBedridden] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isRiskAggravated, setIsRiskAggravated] = useState(false);

  // Calculator State
  const [suggestedOccupancy, setSuggestedOccupancy] = useState<number | null>(null);

  // Effect to calculate occupancy when Type or Area changes
  useEffect(() => {
      if (newType && newArea && !isNaN(parseFloat(newArea))) {
          const density = DENSITY_TABLE[newType];
          const areaVal = parseFloat(newArea);
          
          if (density && density.factor > 0) {
              // Round up (ceil) as per safety regulations usually implies conservative estimates
              const calc = Math.ceil(areaVal / density.factor);
              setSuggestedOccupancy(calc);
          } else {
              setSuggestedOccupancy(null);
          }
      } else {
          setSuggestedOccupancy(null);
      }
  }, [newType, newArea]);

  // Lógica Refatorada de Cálculo de Risco
  const calculateRisk = (occ: number, bed: boolean, sleep: boolean, aggravated: boolean, type: string): RiskLocation => {
    // 1. Locais de Risco F (Centros nevrálgicos e técnicos perigosos)
    const riskFTypes = ['posto_seguranca', 'centro_controlo', 'central_termica', 'gerador', 'transformador'];
    if (riskFTypes.includes(type)) {
        return RiskLocation.F;
    }
    
    // Se marcado como agravado e for local técnico, assume-se perigosidade elevada (F)
    if (aggravated && ['tecnico', 'energia', 'bastidor', 'lixos', 'manutencao'].includes(type)) {
        return RiskLocation.F;
    }

    // 2. Locais de Risco D (Acamados) - Prioridade sobre E
    if (bed) return RiskLocation.D;
    
    // 3. Locais de Risco E (Dormida)
    if (sleep) return RiskLocation.E;
    
    // 4. Locais de Risco C (Público ou Carga de Incêndio)
    // Cozinhas, Arquivos e Armazéns são tipicamente C (ou C+ se agravado)
    const riskCTypes = [
        'cozinha', 'arquivo', 'armazem', 'auditorio', 'comercio', 
        'biblioteca', 'oficina', 'laboratorio', 'palco', 'lixos', 
        'restaurante', 'lavandaria'
    ];
    if (riskCTypes.includes(type)) {
        return RiskLocation.C;
    }
    
    // Se marcado como agravado (mesmo que escritório), sobe para C no mínimo
    if (aggravated) return RiskLocation.C;

    // 5. Critério Populacional
    if (occ > 200) return RiskLocation.C; 
    if (occ > 100) return RiskLocation.B;
    
    // 6. Risco A (Default)
    return RiskLocation.A;
  };

  const handleSubmit = () => {
    if (!newName || !newType) {
        alert("Preencha o nome e o tipo do espaço.");
        return;
    }

    const occ = parseInt(newOccupancy) || 0;
    const area = parseFloat(newArea) || 0;
    const risk = calculateRisk(occ, isBedridden, isSleeping, isRiskAggravated, newType);
    
    // Determinar notas adicionais automaticamente
    let autoNotes = [];
    if (isBedridden) autoNotes.push('Acamados');
    if (isSleeping) autoNotes.push('Dormida');
    if (isRiskAggravated) {
        if (risk === RiskLocation.F) autoNotes.push('Risco F (Técnico/Controlo)');
        else autoNotes.push('Risco C+ (Agravado)');
    }
    
    const spaceData: Space = {
        id: isEditing || Date.now().toString(),
        name: newName,
        type: newType,
        area: area,
        occupancy: occ,
        riskClass: risk,
        notes: autoNotes.join(', ')
    };

    if (isEditing) {
        removeSpace(isEditing);
        addSpace(spaceData);
        setIsEditing(null);
    } else {
        addSpace(spaceData);
    }
    
    resetForm();
  };

  const startEdit = (space: Space) => {
    setIsEditing(space.id);
    setNewName(space.name);
    setNewType(space.type);
    setNewArea(space.area.toString());
    setNewOccupancy(space.occupancy.toString());
    setIsBedridden(space.riskClass === RiskLocation.D);
    setIsSleeping(space.riskClass === RiskLocation.E);
    // Tenta inferir se era agravado pelas notas ou pela classe F em tipos técnicos
    setIsRiskAggravated(
        space.riskClass === RiskLocation.F || 
        (space.notes && space.notes.includes('Agravado')) ||
        false
    );
  };

  const resetForm = () => {
    setIsEditing(null);
    setNewName('');
    setNewType('');
    setNewArea('');
    setNewOccupancy('');
    setIsBedridden(false);
    setIsSleeping(false);
    setIsRiskAggravated(false);
    setSuggestedOccupancy(null);
  };

  const handleDuplicate = (space: Space) => {
    // Cria uma cópia profunda para garantir novo ID
    const newId = Date.now().toString();
    const duplicatedSpace: Space = {
        ...space,
        id: newId,
        name: `${space.name} (Cópia)`
    };
    addSpace(duplicatedSpace);
  };

  const totalOccupancy = useMemo(() => {
    return state.spaces.reduce((acc, curr) => acc + (curr.occupancy || 0), 0);
  }, [state.spaces]);

  const totalArea = useMemo(() => {
    return state.spaces.reduce((acc, curr) => acc + (curr.area || 0), 0);
  }, [state.spaces]);

  const getRiskColor = (risk: RiskLocation, notes?: string) => {
      // Destaque visual para C+ (Agravado)
      if (risk === RiskLocation.C && notes && notes.includes('Agravado')) {
          return "bg-orange-600 text-white font-bold border-2 border-orange-800";
      }

      const colors = {
          [RiskLocation.A]: "bg-green-100 text-green-800",
          [RiskLocation.B]: "bg-yellow-100 text-yellow-800",
          [RiskLocation.C]: "bg-orange-100 text-orange-800",
          [RiskLocation.D]: "bg-red-100 text-red-800",
          [RiskLocation.E]: "bg-purple-100 text-purple-800",
          [RiskLocation.F]: "bg-gray-800 text-white",
      };
      return colors[risk];
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center">
            <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Espaços</span>
            <span className="text-3xl font-bold text-gray-800">{state.spaces.length}</span>
            <span className="text-xs text-gray-400 mt-1">{totalArea.toFixed(1)} m² total</span>
        </div>
        <div className="bg-anepc-light p-4 rounded-xl shadow-sm border border-blue-200 flex flex-col justify-center items-center">
            <span className="text-sm text-blue-600 font-medium uppercase tracking-wider">Efetivo Total</span>
            <span className="text-3xl font-bold text-anepc-blue">{totalOccupancy} <span className="text-sm font-normal">pax</span></span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center">
            <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Maior Risco</span>
            <span className="text-xl font-bold text-gray-800">
                {state.spaces.length > 0 
                  ? state.spaces.reduce((prev, current) => (prev > current.riskClass ? prev : current.riskClass), "A") 
                  : "-"}
            </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Editar Espaço' : 'Adicionar Novo Espaço'}
            </h2>
            {isEditing && (
                <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 underline">
                    Cancelar Edição
                </button>
            )}
        </div>
        
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
            <div className="grid md:grid-cols-12 gap-4 mb-4">
                <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nome do Espaço *
                        <Tooltip text="Designação única do compartimento (ex: Sala 1.04, Arquivo Geral)." />
                    </label>
                    <input 
                        type="text" 
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full border-gray-300 rounded-md text-sm focus:ring-anepc-blue focus:border-anepc-blue text-gray-900"
                        placeholder="Ex: Sala de Reuniões"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tipo *
                        <Tooltip text="A tipologia influencia diretamente o Local de Risco e a Densidade de Ocupação." />
                    </label>
                    <select 
                        value={newType} 
                        onChange={e => setNewType(e.target.value)}
                        className="w-full border-gray-300 rounded-md text-sm focus:ring-anepc-blue focus:border-anepc-blue text-gray-900"
                    >
                        <option value="">Selecione o tipo...</option>
                        
                        <optgroup label="Administrativo e Ensino">
                            <option value="escritorio">Escritório / Gabinete</option>
                            <option value="reuniao">Sala de Reuniões</option>
                            <option value="sala_aula">Sala de Aula / Formação</option>
                            <option value="atrio">Átrio / Recepção</option>
                        </optgroup>

                        <optgroup label="Público e Comércio">
                            <option value="comercio">Comércio / Loja / Showroom</option>
                            <option value="restaurante">Restaurante / Bar / Refeitório</option>
                            <option value="auditorio">Auditório / Sala Polivalente</option>
                            <option value="biblioteca">Biblioteca</option>
                            <option value="ginasio">Ginásio / Sala Desporto</option>
                        </optgroup>

                        <optgroup label="Alojamento e Saúde">
                            <option value="dormitorio">Dormitório / Quarto</option>
                            <option value="sala_estar">Sala de Estar / Convívio</option>
                            <option value="enfermaria">Enfermaria</option>
                            <option value="consultorio">Consultório Médico</option>
                        </optgroup>

                        <optgroup label="Serviço e Indústria">
                            <option value="cozinha">Cozinha / Copa</option>
                            <option value="lavandaria">Lavandaria</option>
                            <option value="armazem">Armazém / Arquivo</option>
                            <option value="oficina">Oficina / Fabrico</option>
                            <option value="laboratorio">Laboratório</option>
                            <option value="garagem">Garagem / Estacionamento</option>
                            <option value="sanitarios">Inst. Sanitárias / Vestiários</option>
                        </optgroup>

                        <optgroup label="Técnicos e Segurança">
                            <option value="tecnico">Sala Técnica Genérica</option>
                            <option value="bastidor">Sala de Servidores / Bastidor</option>
                            <option value="posto_seguranca">Posto de Segurança</option>
                            <option value="centro_controlo">Centro de Controlo (CN)</option>
                            <option value="central_termica">Central Térmica</option>
                            <option value="gerador">Grupo Gerador</option>
                            <option value="transformador">Posto de Transformação</option>
                            <option value="lixos">Casa de Lixos</option>
                        </optgroup>

                        <optgroup label="Outros">
                            <option value="recinto_improvisado">Recinto Itinerante / Provisório</option>
                            <option value="circulacao">Circulação Horizontal (Corredor)</option>
                            <option value="escada">Caixa de Escada</option>
                        </optgroup>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Área (m²)
                        <Tooltip text="Área útil do compartimento. Usada para cálculos de densidade." />
                    </label>
                    <input 
                        type="number" 
                        value={newArea}
                        onChange={e => setNewArea(e.target.value)}
                        className="w-full border-gray-300 rounded-md text-sm focus:ring-anepc-blue focus:border-anepc-blue text-gray-900"
                        placeholder="0"
                        min="0"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Efetivo (pess.)
                        <Tooltip text="Lotação prevista. Pode usar a calculadora automática baseada no Art. 54º." />
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={newOccupancy}
                            onChange={e => setNewOccupancy(e.target.value)}
                            className="w-full border-gray-300 rounded-md text-sm focus:ring-anepc-blue focus:border-anepc-blue text-gray-900 pr-8"
                            placeholder="0"
                            min="0"
                        />
                        {/* Calculator Indicator Icon */}
                        {suggestedOccupancy !== null && (
                             <div className="absolute right-2 top-1/2 -translate-y-1/2 text-anepc-blue animate-pulse">
                                 <i className="fas fa-calculator text-xs"></i>
                             </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Density Calculator Helper */}
            {suggestedOccupancy !== null && newType && (
                 <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                     <div className="flex items-start gap-3">
                         <div className="bg-white p-2 rounded-full text-anepc-blue shadow-sm mt-1 sm:mt-0">
                             <i className="fas fa-users-cog"></i>
                         </div>
                         <div>
                             <p className="text-xs font-bold text-blue-800 uppercase">Sugestão de Efetivo (Art. 54º RT-SCIE)</p>
                             <p className="text-sm text-gray-700">
                                 Baseado na densidade de <strong>{DENSITY_TABLE[newType]?.label}</strong> para este tipo de espaço.
                             </p>
                             <p className="text-xs text-gray-500 italic">{DENSITY_TABLE[newType]?.desc}</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-3 w-full sm:w-auto">
                         <div className="text-right hidden sm:block">
                             <span className="block text-2xl font-bold text-blue-900 leading-none">{suggestedOccupancy}</span>
                             <span className="text-[10px] text-blue-600 font-bold uppercase">Pessoas</span>
                         </div>
                         <button 
                             onClick={() => setNewOccupancy(suggestedOccupancy.toString())}
                             className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded shadow-sm transition-colors flex items-center justify-center gap-2"
                             title="Aplicar este valor ao campo Efetivo"
                         >
                             <i className="fas fa-check"></i> Aplicar {suggestedOccupancy} pax
                         </button>
                     </div>
                 </div>
            )}

            <div className="grid md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 flex flex-wrap gap-4">
                     <label className="inline-flex items-center text-sm cursor-pointer text-gray-700 font-medium select-none bg-white px-3 py-2 rounded border border-gray-200 hover:bg-gray-50">
                        <input type="checkbox" checked={isSleeping} onChange={e => setIsSleeping(e.target.checked)} className="rounded text-anepc-blue mr-2 focus:ring-anepc-blue"/>
                        Dormida
                        <Tooltip text="Classifica como Risco E. Obriga a deteção de incêndio e maiores restrições de materiais." />
                     </label>
                     <label className="inline-flex items-center text-sm cursor-pointer text-gray-700 font-medium select-none bg-white px-3 py-2 rounded border border-gray-200 hover:bg-gray-50">
                        <input type="checkbox" checked={isBedridden} onChange={e => setIsBedridden(e.target.checked)} className="rounded text-anepc-blue mr-2 focus:ring-anepc-blue"/>
                        Acamados
                        <Tooltip text="Classifica como Risco D. Impõe limites de evacuação mais estritos (10m em impasse)." />
                     </label>
                     <label className="inline-flex items-center text-sm cursor-pointer text-gray-700 font-medium select-none bg-white px-3 py-2 rounded border border-gray-200 hover:bg-gray-50">
                        <input type="checkbox" checked={isRiskAggravated} onChange={e => setIsRiskAggravated(e.target.checked)} className="rounded text-anepc-blue mr-2 focus:ring-anepc-blue"/>
                        Risco Agravado / Carga Térmica
                        <Tooltip text="Força a classificação para Risco C (ou F em locais técnicos), independentemente do tipo base." />
                     </label>
                </div>
                <div className="md:col-span-4">
                    <button 
                        onClick={handleSubmit}
                        className={`w-full ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-anepc-blue hover:bg-blue-800'} text-white rounded-md py-2 text-sm transition shadow-sm font-medium`}
                    >
                        <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-1`}></i> 
                        {isEditing ? 'Guardar Alterações' : 'Adicionar Espaço'}
                    </button>
                </div>
            </div>
        </div>

        <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Lista de Espaços Classificados</h3>
            
            {state.spaces.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <i className="fas fa-building text-3xl mb-2 opacity-30"></i>
                    <p>Nenhum espaço adicionado.</p>
                </div>
            ) : (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Área</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Efetivo</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Risco</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {state.spaces.map(space => (
                                <tr key={space.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{space.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{space.type.replace(/_/g, ' ')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{space.area || '-'} m²</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{space.occupancy}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 text-xs leading-5 font-bold rounded-md ${getRiskColor(space.riskClass, space.notes)}`}>
                                            {space.riskClass}
                                            {space.riskClass === 'C' && space.notes && space.notes.includes('Agravado') ? '+' : ''}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => startEdit(space)}
                                            className="text-orange-500 hover:text-orange-700 mr-3 transition-colors"
                                            title="Editar"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            onClick={() => handleDuplicate(space)} 
                                            className="text-anepc-blue hover:text-blue-800 mr-3 transition-colors"
                                            title="Duplicar"
                                        >
                                            <i className="fas fa-copy"></i>
                                        </button>
                                        <button 
                                            onClick={() => removeSpace(space.id)} 
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
            )}
        </div>
      </div>
    </div>
  );
};

export default Module2Spaces;