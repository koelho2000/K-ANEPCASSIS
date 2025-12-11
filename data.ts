import { UtilizationType, RiskCategory, BuildingData, UTDefinition, TechnicalRequirement, ProjectState } from './types';

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