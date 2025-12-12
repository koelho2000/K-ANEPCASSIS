import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';

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
  const { setProjectDetails, setMode } = useProject();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && location) {
      setProjectDetails(name, location, author);
      setMode('modules'); // Go to main app
    } else {
        alert("Por favor preencha os campos obrigatórios (Nome e Localização).");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-anepc-blue p-6 text-white text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-folder-plus text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold">Novo Projeto</h2>
            <p className="text-blue-200 text-sm mt-1">Definição dos dados gerais</p>
        </div>
        
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-folder-open mr-2 text-anepc-blue"></i>
                        Nome do Projeto *
                        <Tooltip text="Designação oficial do projeto (ex: Edifício Habitacional Lote 4)." />
                    </label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition"
                        placeholder="Ex: Edifício Habitacional Rua X"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-map-marker-alt mr-2 text-anepc-blue"></i>
                        Localização *
                        <Tooltip text="Localidade ou Concelho. Usado para cabeçalho dos relatórios." />
                    </label>
                    <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition"
                        placeholder="Ex: Lisboa, Portugal"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-user-tie mr-2 text-anepc-blue"></i>
                        Responsável Técnico / Autor
                        <Tooltip text="Nome do técnico autor do projeto ou responsável pela verificação SCIE." />
                    </label>
                    <input 
                        type="text" 
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anepc-blue focus:border-anepc-blue outline-none transition"
                        placeholder="Ex: Eng.º João Silva"
                    />
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