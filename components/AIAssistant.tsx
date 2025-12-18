import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ChatMessage, SimulationState, AIModelMode, AISettings, AILevel, AILength } from '../types';
import { askPhysicsTutor } from '../services/gemini';

interface AIAssistantProps {
  simulationState: SimulationState;
  isDarkMode: boolean;
  onClose?: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ simulationState, isDarkMode, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "Hello! I'm your optical physics assistant. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelMode, setModelMode] = useState<AIModelMode>('balanced');
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings State
  const [aiSettings, setAiSettings] = useState<AISettings>({
    level: 'Class 11-12',
    length: 'Medium'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const context = `Lens Type: ${simulationState.lensType}, Object Position: ${simulationState.objectX.toFixed(1)}cm, Object Height: ${simulationState.objectHeight}px, Focal Length: ${simulationState.focalLength}cm.`;
    const responseText = await askPhysicsTutor(input, context, modelMode, aiSettings);

    const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`h-full flex flex-col transition-all overflow-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-slate-200' : 'bg-white text-slate-800'}`}>
      {/* Header */}
      <div className={`p-4 border-b flex-none ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between z-10 relative`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
            AI
          </div>
          <div>
            <h3 className="font-display font-bold text-sm">Tutor</h3>
            <p className="text-[10px] opacity-60">Gemini</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
            {/* Settings Toggle */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.047 7.047 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
               </svg>
            </button>
            {onClose && (
                <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-60">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                   </svg>
                </button>
            )}
        </div>
      </div>

      {/* Settings Panel Popover */}
      {showSettings && (
        <div className={`p-4 border-b flex-none animate-in slide-in-from-top-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
           <div className="space-y-4">
             <div>
               <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-2">Knowledge Level</label>
               <select 
                 value={aiSettings.level}
                 onChange={(e) => setAiSettings({...aiSettings, level: e.target.value as AILevel})}
                 className={`w-full text-xs p-2 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'}`}
               >
                 {['Class 6-8', 'Class 9-10', 'Class 11-12', 'College', 'University', 'Expert'].map(l => (
                   <option key={l} value={l}>{l}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-2">Response Length</label>
               <select 
                 value={aiSettings.length}
                 onChange={(e) => setAiSettings({...aiSettings, length: e.target.value as AILength})}
                 className={`w-full text-xs p-2 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'}`}
               >
                 {['Brief', 'Short', 'Medium', 'Long', 'Detailed'].map(l => (
                   <option key={l} value={l}>{l}</option>
                 ))}
               </select>
             </div>
              <div>
               <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-2">Thinking Model</label>
               <select 
                 value={modelMode}
                 onChange={(e) => setModelMode(e.target.value as AIModelMode)}
                 className={`w-full text-xs p-2 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'}`}
               >
                <option value="instant">⚡ Instant (Flash Lite)</option>
                <option value="fast">🚀 Fast (Flash)</option>
                <option value="balanced">✨ Balanced (3.0 Flash)</option>
                <option value="genius">🧠 Genius (3.0 Pro)</option>
               </select>
             </div>
           </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`relative max-w-[90%] p-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20' 
                : (isDarkMode ? 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700' : 'bg-slate-50 text-slate-700 shadow-sm border border-slate-100 rounded-bl-none')
            }`}>
              {msg.role === 'model' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-code:text-[11px]">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
            {/* Copy Button */}
            <button 
                onClick={() => copyToClipboard(msg.text)}
                className={`mt-1 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
            >
                Copy
            </button>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className={`px-4 py-3 rounded-2xl rounded-bl-none text-xs flex items-center gap-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50 shadow-sm'}`}>
              {(modelMode === 'balanced' || modelMode === 'genius') && <span className="text-[10px] uppercase font-bold text-purple-400 mr-1">Thinking</span>}
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t flex-none ${isDarkMode ? 'border-slate-800 bg-[#0a0a0a]' : 'border-slate-100 bg-white'}`}>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className={`flex gap-2 p-1.5 rounded-full border transition-all focus-within:ring-2 focus-within:ring-blue-500/50 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={modelMode === 'genius' ? "Ask a complex physics question..." : "Ask about the image..."}
            className="flex-1 bg-transparent px-4 text-sm outline-none"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;