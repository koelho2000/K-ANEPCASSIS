import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { TechnicianData } from '../types';

const Tooltip = ({ text }: { text: string }) => (
  <div className="relative group inline-flex ml-2 align-middle z-50">
    <i className="fas fa-question-circle text-gray-400 hover:text-anepc-blue cursor-help transition-colors text-xs"></i>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] leading-tight rounded shadow-lg hidden group-hover:block z-50 pointer-events-none text-center font-normal">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const ProjectDetails: React.FC = () => {
  const { setProjectDetails, setMode, state } = useProject();
  
  // Project Info
  const [name, setName] = useState(state.projectName || '');
  const [location, setLocation] = useState(state.projectLocation || '');

  // Technician Info
  const [techName, setTechName] = useState(state.technician?.name || '');
  const [techCC, setTechCC] = useState(state.technician?.cc || '');
  const [techAssoc, setTechAssoc] = useState(state.technician?.association || 'OE');
  const [techNumber, setTechNumber] = useState(state.technician?.professionalNumber || '');
  const [techAddress, setTechAddress] = useState(state.technician?.address || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && location && techName) {
      const technician: TechnicianData = {
          name: techName,
          cc: techCC,
          association: techAssoc,
          professionalNumber: techNumber,
          address: techAddress
      };
      setProjectDetails(name, location, technician);
      setMode('modules'); // Go to main app
    } else {
        alert("Por favor preencha os campos obrigatórios (Nome do Projeto, Localização e Nome do Técnico).");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-anepc-blue p-6 text-white text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-folder-plus text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold">Novo Projeto</h2>
            <p className="text-blue-200 text-sm mt-1">Definição dos dados gerais e responsabilidade técnica</p>
        </div>
        
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Project Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Dados do Edifício</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Projeto *
                        </label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition"
                            placeholder="Ex: Edifício Habitacional Lote 4"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Localização *
                        </label>
                        <input 
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition"
                            placeholder="Ex: Rua Direita, nº 10, Lisboa"
                            required
                        />
                    </div>
                </div>

                {/* Section 2: Technician Info */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                         Dados do Técnico Responsável
                         <Tooltip text="Estes dados serão utilizados para o preenchimento automático do Termo de Responsabilidade." />
                     </h3>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                        <input 
                            type="text" 
                            value={techName}
                            onChange={(e) => setTechName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition"
                            placeholder="Nome do Técnico"
                            required
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cartão de Cidadão (CC)</label>
                            <input 
                                type="text" 
                                value={techCC}
                                onChange={(e) => setTechCC(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition"
                                placeholder="00000000"
                            />
                         </div>
                         <div className="flex gap-4">
                             <div className="w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assoc.</label>
                                <select 
                                    value={techAssoc}
                                    onChange={(e) => setTechAssoc(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition bg-white"
                                >
                                    <option value="OE">OE</option>
                                    <option value="OA">OA</option>
                                    <option value="OET">OET</option>
                                    <option value="Outra">Outra</option>
                                </select>
                             </div>
                             <div className="w-2/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nº Membro</label>
                                <input 
                                    type="text" 
                                    value={techNumber}
                                    onChange={(e) => setTechNumber(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition"
                                    placeholder="Nº Cédula"
                                />
                             </div>
                         </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Morada Profissional</label>
                        <textarea 
                            value={techAddress}
                            onChange={(e) => setTechAddress(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition h-20 resize-none"
                            placeholder="Morada completa para efeitos do termo de responsabilidade"
                        />
                     </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit"
                        className="w-full bg-anepc-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors shadow-md flex justify-center items-center gap-2"
                    >
                        <span>Iniciar Configuração Técnica</span>
                        <i className="fas fa-chevron-right text-xs"></i>
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;