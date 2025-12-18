import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CORE_RULES, GLOSSARY_TERMS, SCENARIOS } from '../constants';
import { DefinitionResult, LensType, AISettings, AILevel, AILength } from '../types';
import { getDefinitionWithGrounding } from '../services/gemini';

interface EducationalContentProps {
  lensType: LensType;
  isDarkMode: boolean;
  objectX: number;
  focalLength: number;
}

const EducationalContent: React.FC<EducationalContentProps> = ({ lensType, isDarkMode, objectX, focalLength }) => {
  const [activeDef, setActiveDef] = useState<DefinitionResult | null>(null);
  const [loadingDef, setLoadingDef] = useState(false);
  const [glossarySettings, setGlossarySettings] = useState<AISettings>({
      level: 'Class 11-12',
      length: 'Medium'
  });
  const [showSettings, setShowSettings] = useState(false);

  const handleTermClick = async (term: string) => {
    setLoadingDef(true);
    setActiveDef(null);
    const result = await getDefinitionWithGrounding(term, glossarySettings);
    setActiveDef(result);
    setLoadingDef(false);
  };

  const copyDefinition = () => {
      if (activeDef?.definition) {
          navigator.clipboard.writeText(activeDef.definition);
      }
  };

  const currentScenarioIndex = SCENARIOS[lensType].findIndex(s => s.condition(objectX, focalLength));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Rules & Scenarios */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Rules Card */}
        <div className={`p-8 rounded-[2rem] plateau border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-white'}`}>
          <h2 className={`text-2xl font-display font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-lg shadow-blue-500/30 font-mono">3</span>
            Fundamental Rules
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {CORE_RULES.map((rule, i) => (
              <div key={i} className="relative group p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`absolute top-4 left-4 w-1 h-8 rounded-full ${rule.colorClass}`} />
                <div className="pl-4">
                  <h4 className={`font-bold text-sm mb-2 font-display ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{rule.title}</h4>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenarios Table */}
        <div className={`p-8 rounded-[2rem] plateau border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-white'}`}>
           <h2 className={`text-2xl font-display font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Lens Scenarios</h2>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'} text-[10px] font-bold uppercase tracking-widest opacity-60`}>
                    <th className="pb-4 pl-4">Object Position</th>
                    <th className="pb-4">Image Nature</th>
                    <th className="pb-4 text-right pr-4">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/5">
                  {SCENARIOS[lensType].map((s, i) => {
                    const isActive = i === currentScenarioIndex;
                    return (
                      <tr key={i} className={`transition-colors duration-300 ${isActive ? (isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50') : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'} ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <td className="py-4 pl-4 font-semibold opacity-90 relative">
                           {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />}
                           {s.pos}
                        </td>
                        <td className="py-4 opacity-70">{s.nature}</td>
                        <td className="py-4 pr-4 text-right font-bold opacity-80">{s.size}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
        </div>
      </div>

      {/* Right Column: Interactive Glossary */}
      <div className="lg:col-span-4 space-y-8">
        <div className={`h-full p-8 rounded-[2rem] plateau border flex flex-col transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-white'}`}>
           <div className="flex items-center justify-between mb-4">
               <h2 className={`text-xl font-display font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                 <span className="text-xl">📚</span> Smart Glossary
               </h2>
               <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500'}`}
               >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                     <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.047 7.047 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                   </svg>
               </button>
           </div>
           
           {/* Settings Panel */}
           {showSettings && (
             <div className={`mb-6 p-4 rounded-xl text-xs space-y-3 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                 <div>
                   <label className="font-bold opacity-50 block mb-1">Level</label>
                   <select 
                     value={glossarySettings.level}
                     onChange={(e) => setGlossarySettings({...glossarySettings, level: e.target.value as AILevel})}
                     className={`w-full p-1.5 rounded border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                   >
                     {['Class 6-8', 'Class 9-10', 'Class 11-12', 'College', 'University', 'Expert'].map(l => <option key={l} value={l}>{l}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="font-bold opacity-50 block mb-1">Length</label>
                   <select 
                     value={glossarySettings.length}
                     onChange={(e) => setGlossarySettings({...glossarySettings, length: e.target.value as AILength})}
                     className={`w-full p-1.5 rounded border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                   >
                     {['Brief', 'Short', 'Medium', 'Long', 'Detailed'].map(l => <option key={l} value={l}>{l}</option>)}
                   </select>
                 </div>
             </div>
           )}
           
           <div className="flex flex-wrap gap-2 mb-6">
             {GLOSSARY_TERMS.map(term => (
               <button
                key={term}
                onClick={() => handleTermClick(term)}
                disabled={loadingDef}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  activeDef?.term === term 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' 
                  : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700')
                }`}
               >
                 {term}
               </button>
             ))}
           </div>

           {/* Definition Output Area */}
           <div className={`flex-1 rounded-2xl p-6 relative group ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
              {loadingDef ? (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activeDef ? (
                <div className="animate-fade-in relative h-full flex flex-col">
                  <h3 className="font-bold text-lg mb-2 text-blue-500">{activeDef.term}</h3>
                  <div className={`flex-1 overflow-y-auto pr-2 prose prose-sm dark:prose-invert max-w-none prose-p:my-1 text-sm leading-relaxed opacity-90 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {activeDef.definition}
                      </ReactMarkdown>
                  </div>
                  
                  {activeDef.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200/20">
                      <span className="text-[10px] uppercase font-bold opacity-50 block mb-2">Sources</span>
                      <ul className="space-y-1">
                        {activeDef.sources.slice(0, 2).map((source, i) => (
                           <li key={i}>
                             <a href={source.web?.uri} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                               {source.web?.title}
                             </a>
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Copy Button */}
                   <button 
                     onClick={copyDefinition}
                     className={`absolute top-0 right-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}
                     title="Copy Definition"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                        <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                     </svg>
                   </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <span className="text-3xl mb-2">👆</span>
                  <p className="text-xs">Select a term above</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EducationalContent);