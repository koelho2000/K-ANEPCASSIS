import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-anepc-blue text-white p-6 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-2xl">
                    <i className="fas fa-info"></i>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Manual de Utilização</h2>
                    <p className="text-blue-200 text-sm">K-ANEPCASSIS v2.1.0</p>
                </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                <i className="fas fa-times text-xl"></i>
            </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 space-y-8 font-sans text-gray-700 leading-relaxed">
            
            {/* 1. Introdução */}
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Sobre a Aplicação</h3>
                <p className="mb-4">
                    A <strong>K-ANEPCASSIS</strong> é uma ferramenta profissional de apoio ao projeto de Segurança Contra Incêndio em Edifícios (SCIE), desenvolvida para arquitetos, engenheiros e projetistas. 
                </p>
                <p>
                    O objetivo principal é automatizar o cálculo da <strong>Categoria de Risco</strong>, dimensionar as <strong>condições de evacuação</strong> e listar os <strong>requisitos técnicos</strong> dos equipamentos de segurança, garantindo a conformidade com a legislação portuguesa em vigor.
                </p>
            </section>

            {/* 2. Fluxo de Trabalho */}
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Guia Rápido (Fluxo de Trabalho)</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <span className="text-xs font-bold text-anepc-blue uppercase block mb-1">Passo 1</span>
                        <h4 className="font-bold text-gray-800 mb-2"><i className="fas fa-layer-group mr-2"></i>Categoria de Risco</h4>
                        <p className="text-sm">
                            Defina a Utilização-Tipo (I a XII), altura do edifício, efetivo total e pisos abaixo do solo. A aplicação calcula automaticamente se o edifício é de 1.ª, 2.ª, 3.ª ou 4.ª Categoria.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                         <span className="text-xs font-bold text-anepc-blue uppercase block mb-1">Passo 2</span>
                        <h4 className="font-bold text-gray-800 mb-2"><i className="fas fa-th-large mr-2"></i>Caracterização de Espaços</h4>
                        <p className="text-sm">
                            Crie a lista de compartimentos (Módulo 2). A app sugere o efetivo com base na densidade de ocupação (Art. 54º) e determina a Classe de Risco (A a F) de cada sala.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                         <span className="text-xs font-bold text-anepc-blue uppercase block mb-1">Passo 3</span>
                        <h4 className="font-bold text-gray-800 mb-2"><i className="fas fa-calculator mr-2"></i>Cálculos Específicos</h4>
                        <p className="text-sm">
                            Utilize os módulos 3, 4 e 7 para verificar distâncias de evacuação, larguras de saídas (UP) e dimensionar sistemas de controlo de fumo (Desenfumagem).
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                         <span className="text-xs font-bold text-anepc-blue uppercase block mb-1">Passo 4</span>
                        <h4 className="font-bold text-gray-800 mb-2"><i className="fas fa-file-alt mr-2"></i>Relatório Técnico</h4>
                        <p className="text-sm">
                            Gere um relatório completo em PDF, pronto a imprimir, que inclui a memória descritiva, tabelas de quantidades (extintores, sinalização, etc.) e o termo de responsabilidade.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. Legislação */}
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Base Legal e Normativa</h3>
                <p className="mb-2 text-sm">Os algoritmos da K-ANEPCASSIS baseiam-se estritamente nos seguintes diplomas:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <li><strong>Decreto-Lei n.º 220/2008</strong> (RJ-SCIE) - Regime Jurídico.</li>
                    <li><strong>Portaria n.º 1532/2008</strong> (RT-SCIE) - Regulamento Técnico.</li>
                    <li><strong>Portaria n.º 135/2020</strong> - Alteração aos diplomas anteriores (novas regras de evacuação e medidas).</li>
                    <li><strong>Norma APSAD R17</strong> - Metodologia auxiliar para cálculo de desenfumagem natural.</li>
                </ul>
            </section>

             {/* 4. Funcionalidades Avançadas */}
             <section>
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Funcionalidades Inteligentes</h3>
                <div className="space-y-3 text-sm">
                    <p>
                        <strong className="text-gray-900">Quantificação Automática de Equipamentos:</strong><br/>
                        Com base nos espaços criados no Módulo 2, a aplicação gera automaticamente as tabelas de quantidades para os Capítulos V do relatório (Extintores, Deteção, Iluminação de Emergência), aplicando rácios padrão (ex: 1 extintor/200m²).
                    </p>
                    <p>
                        <strong className="text-gray-900">Verificação de Conformidade:</strong><br/>
                        Nos módulos de evacuação, a aplicação alerta visualmente se uma distância excede o máximo permitido por lei, considerando se o percurso é em "Impasse" ou possui "Saídas Distintas".
                    </p>
                </div>
            </section>

            {/* 5. Disclaimer */}
            <section className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg text-sm text-yellow-900">
                <h4 className="font-bold flex items-center gap-2 mb-1"><i className="fas fa-exclamation-triangle"></i> Isenção de Responsabilidade</h4>
                <p>
                    Esta aplicação é uma ferramenta de auxílio ao projeto e não substitui o julgamento técnico de um profissional qualificado. 
                    Embora todos os esforços tenham sido feitos para garantir a precisão dos cálculos face à legislação, a responsabilidade final pelo projeto de SCIE e pela verificação dos resultados cabe exclusivamente ao autor do projeto.
                </p>
            </section>

             <div className="text-center text-xs text-gray-400 pt-8 border-t border-gray-100">
                Desenvolvido por koelho2000 &copy; {new Date().getFullYear()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;