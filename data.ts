import { UtilizationType, RiskCategory, BuildingData, UTDefinition, TechnicalRequirement, ProjectState, Space, EquipmentItem } from './types';

export const UT_DEFINITIONS: UTDefinition[] = [
  { id: UtilizationType.I, name: "Habitacionais", icon: "fa-home", description: "Edifícios de habitação unifamiliar ou multifamiliar.", factors: ["height", "floorsBelow"] },
  { id: UtilizationType.II, name: "Estacionamentos", icon: "fa-car", description: "Parques de estacionamento cobertos ou ao ar livre.", factors: ["height", "grossArea", "floorsBelow"] },
  { id: UtilizationType.III, name: "Administrativos", icon: "fa-briefcase", description: "Escritórios, repartições públicas, bancos.", factors: ["height", "occupancy"] },
  { id: UtilizationType.IV, name: "Escolares", icon: "fa-graduation-cap", description: "Escolas, creches, centros de formação.", factors: ["height", "occupancy"] },
  { id: UtilizationType.V, name: "Hospitalares", icon: "fa-hospital", description: "Hospitais, clínicas, lares de idosos.", factors: ["height", "occupancy"] },
  { id: UtilizationType.VI, name: "Espetáculos", icon: "fa-masks-theater", description: "Teatros, cinemas, auditórios, templos.", factors: ["height", "occupancy", "floorsBelow"] },
  { id: UtilizationType.VII, name: "Hoteleiros", icon: "fa-hotel", description: "Hotéis, alojamento local, restauração.", factors: ["height", "occupancy"] },
  { id: UtilizationType.VIII, name: "Comerciais", icon: "fa-store", description: "Lojas, centros comerciais, gares.", factors: ["height", "grossArea", "floorsBelow"] },
  { id: UtilizationType.IX, name: "Desportivos", icon: "fa-futbol", description: "Pavilhões, estádios, piscinas.", factors: ["height", "occupancy", "floorsBelow"] },
  { id: UtilizationType.X, name: "Museus", icon: "fa-landmark", description: "Museus, galerias de arte.", factors: ["height", "occupancy"] },
  { id: UtilizationType.XI, name: "Bibliotecas", icon: "fa-book", description: "Bibliotecas e arquivos.", factors: ["height", "occupancy"] },
  { id: UtilizationType.XII, name: "Industriais", icon: "fa-industry", description: "Indústrias, oficinas, armazéns.", factors: ["height", "grossArea"] },
];

export const calculateRiskCategory = (data: BuildingData): RiskCategory => {
  const { ut, height, grossArea, occupancy, floorsBelow } = data;

  const check = (h: number, a: number, o: number, f: number) => {
    if (height > h) return false;
    if (a > 0 && grossArea > a) return false;
    if (o > 0 && occupancy > o) return false;
    if (f > -1 && floorsBelow > f) return false;
    return true;
  };

  switch (ut) {
    case UtilizationType.I:
      if (check(9, 0, 0, 1)) return RiskCategory.CAT1;
      if (check(28, 0, 0, 3)) return RiskCategory.CAT2;
      if (check(50, 0, 0, 5)) return RiskCategory.CAT3;
      return RiskCategory.CAT4;

    case UtilizationType.II:
      if (check(9, 3200, 0, 1)) return RiskCategory.CAT1;
      if (check(28, 9600, 0, 3)) return RiskCategory.CAT2;
      if (check(28, 32000, 0, 5)) return RiskCategory.CAT3;
      return RiskCategory.CAT4;

    case UtilizationType.III:
      if (check(9, 0, 100, 100)) return RiskCategory.CAT1;
      if (check(28, 0, 1000, 100)) return RiskCategory.CAT2;
      if (check(50, 0, 5000, 100)) return RiskCategory.CAT3;
      return RiskCategory.CAT4;

    case UtilizationType.IV:
    case UtilizationType.V:
    case UtilizationType.VII:
    case UtilizationType.X:
    case UtilizationType.XI:
      if (check(9, 0, 100, 100)) return RiskCategory.CAT1;
      if (check(28, 0, 1000, 100)) return RiskCategory.CAT2;
      if (check(28, 0, 5000, 100)) return RiskCategory.CAT3;
      return RiskCategory.CAT4;
    
    case UtilizationType.VI:
    case UtilizationType.IX:
      if (check(9, 0, 100, 100)) return RiskCategory.CAT1;
      if (check(28, 0, 1000, 2)) return RiskCategory.CAT2;
      if (check(28, 0, 5000, 3)) return RiskCategory.CAT3;
      return RiskCategory.CAT4;

    case UtilizationType.VIII:
      if (check(9, 300, 0, 1)) return RiskCategory.CAT1;
      if (check(28, 3000, 0, 2)) return RiskCategory.CAT2;
      if (check(28, 10000, 0, 3)) return RiskCategory.CAT3;
      return RiskCategory.CAT4;

    case UtilizationType.XII:
      if (check(9, 1000, 0, 100)) return RiskCategory.CAT1;
      if (check(28, 5000, 0, 100)) return RiskCategory.CAT2;
      if (check(28, 20000, 0, 100)) return RiskCategory.CAT3;
      return RiskCategory.CAT4;
      
    default:
      return RiskCategory.CAT1;
  }
};

/**
 * Returns the maximum allowed area for a single fire compartment based on Category and UT.
 * Simplification based on typical limits in RT-SCIE (Portaria 1532/2008 Art 17-23).
 */
export const getMaxCompartmentSize = (category: RiskCategory | null, ut: UtilizationType): number => {
    // Default fallback limits
    if (!category) return 2500;

    // Special cases for Large Occupancies like Industry (XII) or Parking (II)
    if (ut === UtilizationType.XII) {
        if (category === 1 || category === 2) return 4000; // Allows larger sectors
        if (category === 3) return 3000;
        return 2000;
    }
    if (ut === UtilizationType.II) {
        // Parking sectors often defined by smoke control limits (e.g., 3200m2)
        // But structural compartmentation is stricter. Let's use 3200 as a common breakpoint.
        return 3200; 
    }

    // Standard cases (III, IV, V, VI, etc)
    switch (category) {
        case 1: return 2500;
        case 2: return 2500;
        case 3: return 2000;
        case 4: return 1600;
        default: return 2500;
    }
};

// Generates specific technical requirements based on Module ID and Project State
export const getTechnicalRequirements = (moduleId: number, state: ProjectState): TechnicalRequirement[] => {
    const { category, building } = state;
    if (!category) return [];

    const reqs: TechnicalRequirement[] = [];

    switch (moduleId) {
        case 5: // Resistência ao Fogo (Art 15-30)
            const structuralStability = 
                category === 1 ? 'R 30' : 
                category === 2 ? 'R 60' : 
                category === 3 ? 'R 90' : 'R 120';
            
            const floorSeparation = 
                category === 1 ? 'REI 30' : 
                category === 2 ? 'REI 60' : 
                category === 3 ? 'REI 90' : 'REI 120';
            
            reqs.push({ title: 'Estrutura Principal', value: structuralStability, description: 'Estabilidade ao fogo exigida para elementos estruturais principais.' });
            reqs.push({ title: 'Pavimentos', value: floorSeparation, description: 'Integridade e Isolamento na separação entre pisos.' });
            if (building.floorsBelow > 0) {
                 reqs.push({ title: 'Caves (Pisos Enterrados)', value: 'REI 90 (mínimo)', description: 'Agravamento geral para pisos enterrados.' });
            }
            break;

        case 6: // Reação ao Fogo (Art 35-42)
            reqs.push({ title: 'Vias de Evacuação', value: 'C-s2,d0 (Paredes) / Bfl-s1 (Pav)', description: 'Requisito para corredores e caminhos de evacuação protegidos.' });
            reqs.push({ title: 'Locais de Risco A', value: 'D-s2,d0', description: 'Requisito geral para revestimentos em locais de risco reduzido.' });
            reqs.push({ title: 'Locais de Risco B/C', value: 'C-s2,d0', description: 'Requisito para locais com público ou carga térmica.' });
            break;

        case 8: // Meios de Socorro (Art 163-171)
            reqs.push({ title: 'Extintores Portáteis', value: '1 / 15m ou 500m²', description: 'Distância máxima a percorrer de 15m. Mínimo 2 por piso.' });
            if (category >= 2) {
                 reqs.push({ title: 'Rede de Incêndio (RIA)', value: 'Obrigatório (25mm)', description: 'Carretéis armados tipo teatro junto aos acessos e saídas.' });
            }
            if (building.ut === UtilizationType.II || building.ut === UtilizationType.XII) {
                reqs.push({ title: 'Extintores de Pó Químico', value: 'ABC', description: 'Recomendado para fogos tipo B (Líquidos combustíveis) e C (Gás).' });
            }
            break;

        case 9: // Características Portas (Art 50-54)
            reqs.push({ title: 'Sentido de Abertura', value: building.occupancy > 50 ? 'Para o Exterior' : 'Indiferente', description: 'Para locais com mais de 50 pessoas, abertura no sentido da fuga.' });
            reqs.push({ title: 'Dispositivos de Fecho', value: 'Barras Antipânico', description: 'Obrigatório em saídas com efetivo > 50 pessoas.' });
            if (category >= 3) {
                 reqs.push({ title: 'Portas Corta-Fogo', value: 'PC E 30 C', description: 'Isolamento de caixas de escada e zonas de risco.' });
            }
            break;

        case 10: // Câmaras Corta-Fogo (Art 21)
            if (category >= 3 || building.height > 28) {
                reqs.push({ title: 'Acesso a Escadas', value: 'Obrigatório', description: 'Interposição de câmara corta-fogo no acesso às escadas protegidas.' });
            } else {
                reqs.push({ title: 'Acesso a Escadas', value: 'Não Obrigatório', description: 'Acesso direto permitido para categorias inferiores.' });
            }
            break;

        case 11: // Deteção e Alarme (Art 135-144)
            if (category === 1) {
                reqs.push({ title: 'Configuração', value: 'Tipo 4 (Manual)', description: 'Botoneiras de alarme manuais e sinalizadores sonoros.' });
            } else {
                reqs.push({ title: 'Configuração', value: 'Tipo 3 ou 2 (Automática)', description: 'Deteção automática em vias de evacuação e locais de risco.' });
            }
            if (building.hasSleepArea) {
                 reqs.push({ title: 'Locais de Dormida', value: 'Deteção Obrigatória', description: 'Detetores pontuais autónomos ou ligados à central.' });
            }
            break;

        case 12: // Sistemas de Extinção (Art 163-176)
             if (category >= 3 || (building.ut === UtilizationType.II && building.grossArea > 9600)) {
                 reqs.push({ title: 'Sprinklers', value: 'Obrigatório', description: 'Rede automática de água.' });
             } else {
                 reqs.push({ title: 'Sprinklers', value: 'Não Exigível', description: 'Regra geral (verificar riscos específicos).' });
             }
             break;

        case 13: // Sinalização e Iluminação (Art 108-118)
            reqs.push({ title: 'Iluminação de Emergência', value: 'Obrigatório', description: 'Caminhos de evacuação, saídas, locais de risco e pontos de alarme.' });
            reqs.push({ title: 'Sinalização', value: 'Fotoluminescente', description: 'Placas de saída, extintores, quadro elétrico, botoneiras.' });
            break;

        default:
            break;
    }

    return reqs;
}

// Helper: Calculate Equipment for a specific space and module
export const calculateSpaceEquipment = (space: Space, moduleId: number): EquipmentItem[] => {
    const items: EquipmentItem[] = [];
    const area = space.area || 0;
    const occ = space.occupancy || 0;
    
    // Helper booleans
    const isKitchen = space.type === 'cozinha';
    const isTech = ['tecnico', 'bastidor', 'central_termica', 'gerador', 'transformador', 'centro_controlo', 'posto_seguranca', 'lixos'].includes(space.type);
    const isGarage = space.type === 'garagem';
    const isPublic = ['restaurante', 'comercio', 'auditorio', 'atrio', 'sala_aula', 'reuniao'].includes(space.type);
    const isSleep = ['dormitorio', 'enfermaria'].includes(space.type);
    const highOccupancy = occ > 50;

    switch (moduleId) {
        case 8: // Meios de Socorro
            if (isKitchen) {
                items.push({ name: 'Extintor CO2 2kg', quantity: 1, unit: 'un', typeClass: 'bg-gray-800 text-white', reason: 'Risco Elétrico/Higiene' });
                items.push({ name: 'Manta Ignífuga', quantity: 1, unit: 'un', typeClass: 'bg-orange-100 text-orange-800', reason: 'Fogo em Roupas/Óleos' });
                // Optional ABF
                if (area > 20) items.push({ name: 'Extintor ABF (Espuma)', quantity: 1, unit: 'un', typeClass: 'bg-yellow-100 text-yellow-800', reason: 'Gorduras' });
            } else if (isTech) {
                const qtd = Math.max(1, Math.ceil(area / 50)); // Higher density for tech rooms
                items.push({ name: 'Extintor CO2 5kg', quantity: qtd, unit: 'un', typeClass: 'bg-gray-800 text-white', reason: 'Equipamento Elétrico' });
            } else if (isGarage) {
                const qtd = Math.max(1, Math.ceil(area / 150)); // Powder usually covers more
                items.push({ name: 'Extintor Pó ABC 6kg', quantity: qtd, unit: 'un', typeClass: 'bg-blue-100 text-blue-800', reason: 'Risco B (Combustíveis)' });
            } else {
                // General Rule: 1 per 200m2 approx (ensures <15m distance)
                const qtd = Math.max(1, Math.ceil(area / 200));
                items.push({ name: 'Extintor Pó ABC 6kg', quantity: qtd, unit: 'un', typeClass: 'bg-blue-100 text-blue-800', reason: 'Regra Geral' });
            }
            break;

        case 9: // Portas
            if (highOccupancy) {
                items.push({ name: 'Barra Antipânico', quantity: 'Sim', unit: 'req', typeClass: 'bg-red-100 text-red-800', reason: '> 50 Pessoas' });
                items.push({ name: 'Abertura para Exterior', quantity: 'Sim', unit: 'req', typeClass: 'bg-red-100 text-red-800', reason: 'Sentido de Fuga' });
            }
            if (isTech || isKitchen || space.type === 'arquivo' || space.type === 'armazem') {
                items.push({ name: 'Porta Corta-Fogo (EI)', quantity: 'EI 60 C', unit: 'classe', typeClass: 'bg-orange-100 text-orange-800', reason: 'Isolamento Risco C/F' });
                items.push({ name: 'Mola Fecho Automático', quantity: 'Sim', unit: 'req', typeClass: 'bg-gray-100 text-gray-800', reason: 'Compartimentação' });
            } else {
                 items.push({ name: 'Porta Standard', quantity: '-', unit: '', typeClass: 'text-gray-400', reason: 'Sem req. especial' });
            }
            break;

        case 11: // Deteção
            if (isKitchen || isGarage || space.type === 'central_termica' || space.type === 'gerador') {
                const qtd = Math.max(1, Math.ceil(area / 30)); // Heat detectors cover less area (~30m2)
                items.push({ name: 'Detetor Térmico', quantity: qtd, unit: 'un', typeClass: 'bg-orange-100 text-orange-800', reason: 'Evitar Falsos Alarmes' });
            } else if (space.type === 'atrio' && (space.height || 3) > 6) {
                items.push({ name: 'Deteção Linear (Feixe)', quantity: 'Estudo', unit: 'proj', typeClass: 'bg-purple-100 text-purple-800', reason: 'Pé-direito elevado' });
            } else {
                const qtd = Math.max(1, Math.ceil(area / 60)); // Smoke detectors cover ~60-80m2
                items.push({ name: 'Detetor Ótico Fumo', quantity: qtd, unit: 'un', typeClass: 'bg-blue-100 text-blue-800', reason: 'Cobertura ~60m²' });
            }
            
            // Manual Call Points (Botoneiras) - Simplified rule: 1 per space if large or risk
            if (area > 200 || isPublic || highOccupancy) {
                 items.push({ name: 'Botoneira Alarme', quantity: Math.ceil(area / 500) || 1, unit: 'un', typeClass: 'bg-red-100 text-red-800', reason: 'Junto a saídas' });
            }
            
            // Sounders
            if (isSleep) {
                items.push({ name: 'Sinalizador Sonoro Base', quantity: 1, unit: 'un', typeClass: 'bg-yellow-100 text-yellow-800', reason: 'Alarme no quarto' });
            }
            break;

        case 12: // Extinção Fixa
            if (isGarage) {
                items.push({ name: 'Sprinklers', quantity: 'Obrigatório', unit: 'sis', typeClass: 'bg-blue-600 text-white', reason: 'Estacionamento Coberto' });
            } else if (space.type === 'palco' && area > 100) {
                 items.push({ name: 'Sprinklers (Dilúvio)', quantity: 'Sim', unit: 'sis', typeClass: 'bg-blue-600 text-white', reason: 'Palco > 100m²' });
            } else if (space.type === 'bastidor' || space.type === 'centro_controlo') {
                 items.push({ name: 'Extinção Gás (FM200)', quantity: 'Rec.', unit: 'sis', typeClass: 'bg-gray-200 text-gray-800', reason: 'Proteger Eletrónica' });
            } else if (isKitchen) {
                 items.push({ name: 'Extinção Hotte', quantity: 'Rec.', unit: 'sis', typeClass: 'bg-yellow-100 text-yellow-800', reason: 'Gorduras' });
            } else {
                items.push({ name: 'Não Aplicável', quantity: '-', unit: '', typeClass: 'text-gray-400', reason: '' });
            }
            break;

        case 13: // Sinalização
            // Exit Signs
            items.push({ name: 'Sinal Saída (Fotolum.)', quantity: Math.max(1, Math.ceil(area / 150)), unit: 'un', typeClass: 'bg-green-100 text-green-800', reason: 'Sobre vãos' });
            
            // Emergency Lighting
            if (area > 60 || highOccupancy) {
                 const qtd = Math.ceil(area / 50); // Rough estimate for anti-panic lighting
                 items.push({ name: 'Bloco Autónomo (Ambiente)', quantity: qtd, unit: 'un', typeClass: 'bg-yellow-50 text-yellow-800', reason: 'Anti-pânico (>60m²)' });
            } else {
                items.push({ name: 'Bloco Autónomo (Sinal)', quantity: 1, unit: 'un', typeClass: 'bg-gray-100 text-gray-800', reason: 'Balizagem porta' });
            }
            break;
            
        default:
            break;
    }
    return items;
};

export const MODULES = [
  { id: 1, title: "Categoria de Risco", icon: "fa-layer-group" },
  { id: 2, title: "Locais de Risco", icon: "fa-triangle-exclamation" },
  { id: 3, title: "Distâncias de Evacuação", icon: "fa-person-running" },
  { id: 4, title: "Larguras e Saídas", icon: "fa-door-open" },
  { id: 5, title: "Resistência ao Fogo", icon: "fa-shield-halved" },
  { id: 6, title: "Reação ao Fogo", icon: "fa-fire" },
  { id: 7, title: "Controlo de Fumo", icon: "fa-wind" },
  { id: 8, title: "Meios de Socorro", icon: "fa-truck-medical" },
  { id: 9, title: "Características Portas", icon: "fa-dungeon" },
  { id: 10, title: "Câmaras Corta-Fogo", icon: "fa-square-check" },
  { id: 11, title: "Deteção e Alarme", icon: "fa-bell" },
  { id: 12, title: "Sistemas de Extinção", icon: "fa-fire-extinguisher" },
  { id: 13, title: "Sinalização e Iluminação", icon: "fa-lightbulb" },
  { id: 14, title: "Legislação & Tabelas", icon: "fa-book-open" },
  { id: 15, title: "Resumo & Conformidade", icon: "fa-clipboard-check" },
];