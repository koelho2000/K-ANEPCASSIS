import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULES, UT_DEFINITIONS } from '../data';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentModule, setMode } = useProject();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredModules = query 
    ? MODULES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredUTs = query
    ? UT_DEFINITIONS.filter(ut => 
        ut.name.toLowerCase().includes(query.toLowerCase()) || 
        ut.id.toLowerCase().includes(query.toLowerCase()) ||
        ut.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectModule = (id: number) => {
    setCurrentModule(id);
    setMode('modules');
    onClose();
    setQuery('');
  };

  const handleSelectUT = () => {
      setCurrentModule(1);
      setMode('modules');
      onClose();
      setQuery('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all" 
        onClick={e => e.stopPropagation()}
      >
        <div className="relative border-b border-gray-100">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            ref={inputRef}
            type="text"
            className="w-full p-4 pl-12 text-lg outline-none placeholder-gray-400 text-gray-800"
            placeholder="Pesquisar módulos ou regulamentos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
          />
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <span className="text-xs font-medium border border-gray-200 rounded px-2 py-1">ESC</span>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto bg-gray-50">
            {!query && (
                <div className="p-8 text-center text-gray-500">
                    <p>Digite para pesquisar...</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded cursor-pointer hover:border-blue-300" onClick={() => setQuery('Saídas')}>Saídas</span>
                        <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded cursor-pointer hover:border-blue-300" onClick={() => setQuery('Fumo')}>Fumo</span>
                        <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded cursor-pointer hover:border-blue-300" onClick={() => setQuery('Extintores')}>Extintores</span>
                    </div>
                </div>
            )}

            {query && filteredModules.length === 0 && filteredUTs.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    Sem resultados para "{query}"
                </div>
            )}

            {filteredModules.length > 0 && (
                <div className="p-2">
                    <h4 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Módulos</h4>
                    {filteredModules.map(m => (
                        <div 
                            key={m.id} 
                            onClick={() => handleSelectModule(m.id)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer group transition-colors"
                        >
                            <div className="w-8 h-8 rounded bg-blue-100 text-anepc-blue flex items-center justify-center group-hover:bg-anepc-blue group-hover:text-white transition-colors">
                                <i className={`fas ${m.icon}`}></i>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{m.title}</div>
                                <div className="text-xs text-gray-500">Módulo {m.id}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredUTs.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                    <h4 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilizações-Tipo</h4>
                    {filteredUTs.map(ut => (
                        <div 
                            key={ut.id} 
                            onClick={handleSelectUT}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer group transition-colors"
                        >
                             <div className="w-8 h-8 rounded bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-gray-200">
                                <i className={`fas ${ut.icon}`}></i>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{ut.name} (UT {ut.id})</div>
                                <div className="text-xs text-gray-500 line-clamp-1">{ut.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        <div className="p-3 bg-gray-100 text-xs text-gray-500 border-t border-gray-200 flex justify-between">
            <span>Selecione para navegar</span>
            <span>K-ANEPCASSIS</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;