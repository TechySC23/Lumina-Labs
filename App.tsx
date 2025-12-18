import React, { useState, useMemo } from 'react';
import { LensType } from './types';
import { FOCAL_LENGTH } from './constants';
import SimulationCanvas from './components/SimulationCanvas';
import AIAssistant from './components/AIAssistant';
import EducationalContent from './components/EducationalContent';

const App = () => {
  const [objectX, setObjectX] = useState(-150);
  const [objectHeight, setObjectHeight] = useState(60);
  const [lensType, setLensType] = useState<LensType>(LensType.CONVEX);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [perfMode, setPerfMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'lab' | 'learn'>('lab');
  const [isTutorOpen, setIsTutorOpen] = useState(true);

  // --- Physics Calculations ---
  // ObjectX is in "canvas units". Focal Length is 100 canvas units.
  // Let's assume 100 canvas units = 10 cm. So 1 unit = 0.1 cm.
  const PIXEL_TO_CM = 0.1;
  
  const currentF = lensType === LensType.CONVEX ? FOCAL_LENGTH : -FOCAL_LENGTH;
  const currentV = (currentF * objectX) / (currentF + objectX);
  const currentMag = Math.abs(currentV / objectX); // absolute magnification
  const m = currentV / objectX; // signed magnification
  const imageSize = currentMag * objectHeight;

  // --- Detailed Indicators ---
  const positionDesc = useMemo(() => {
     const absU = Math.abs(objectX);
     const f = FOCAL_LENGTH;
     if (absU > 350) return "At Infinity";
     if (absU > 2 * f) return "Beyond 2F";
     if (Math.abs(absU - 2 * f) < 10) return "At 2F";
     if (absU > f && absU < 2 * f) return "Between F & 2F";
     if (Math.abs(absU - f) < 10) return "At Focus (F)";
     if (absU < f) return "Between F & O";
     return "Unknown";
  }, [objectX]);

  const sizeDesc = useMemo(() => {
     if (currentMag < 0.1) return "Point Size";
     if (currentMag < 0.9) return "Diminished";
     if (currentMag >= 0.9 && currentMag <= 1.1) return "Same Size";
     if (currentMag > 5) return "Highly Enlarged";
     if (currentMag > 1.1) return "Magnified";
     return "Unknown";
  }, [currentMag]);

  const natureDesc = useMemo(() => {
    // Single lens logic
    if (lensType === LensType.CONCAVE) return "Virtual & Erect";
    if (objectX > -FOCAL_LENGTH) return "Virtual & Erect"; // Object inside F
    return "Real & Inverted";
  }, [lensType, objectX]);

  return (
    <div className={`h-screen flex flex-col transition-colors duration-500 overflow-hidden ${isDarkMode ? 'dark bg-[#050505] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* Mobile Orientation Overlay */}
      <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center hidden md:hidden portrait:flex">
         <div className="animate-pulse mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-blue-500">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-13.5-3h19.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H1.5A1.5 1.5 0 0 0 0 6v9a1.5 1.5 0 0 0 1.5 1.5ZM12 21a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
            </svg>
         </div>
         <h2 className="text-2xl font-bold font-display mb-2">Please Rotate Your Device</h2>
         <p className="opacity-60 text-sm">Lumina requires landscape mode for the best simulation experience.</p>
      </div>

      {/* 1. Navigation Header */}
      <nav className={`flex-none sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${isDarkMode ? 'bg-[#050505]/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="w-full px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              L
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden md:block">Lumina</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Center Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/50 dark:bg-slate-800/50">
              {['lab', 'learn'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all touch-manipulation min-h-[32px] md:min-h-[auto] ${
                    activeTab === tab 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

             {/* Toggle Tutor */}
             <button
              onClick={() => setIsTutorOpen(!isTutorOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border touch-manipulation min-h-[32px] md:min-h-[auto] ${
                  isTutorOpen 
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' 
                  : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500'
              }`}
             >
               AI Tutor
             </button>

            {/* Performance Switcher */}
             <button 
              onClick={() => setPerfMode(!perfMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border touch-manipulation min-h-[32px] md:min-h-[auto] ${
                perfMode 
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
              }`}
            >
              <span>{perfMode ? '⚡' : '✨'}</span>
              <span className="hidden md:inline">{perfMode ? 'Performance' : 'Quality'}</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all touch-manipulation min-h-[32px] min-w-[32px] md:min-h-[auto] md:min-w-[auto] ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout: Flex Row */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Content Area (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative landscape:p-4">
            
            {/* Lens Control Plateau */}
            <div className="mb-8 flex justify-center">
              <div className={`p-1.5 rounded-2xl inline-flex relative border plateau ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white/60 border-white'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none" />
                {[LensType.CONVEX, LensType.CONCAVE].map((type) => (
                   <button
                     key={type}
                     onClick={() => setLensType(type)}
                     className={`relative px-6 md:px-8 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 touch-manipulation min-h-[44px] md:min-h-[auto] ${
                       lensType === type 
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                       : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-500/5'
                     }`}
                   >
                     {type} Lens
                   </button>
                ))}
              </div>
            </div>

            {activeTab === 'lab' && (
              <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up pb-20">
                  
                  {/* Canvas Container */}
                  <div className={`rounded-[2rem] p-6 plateau border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-white'}`}>
                    <SimulationCanvas 
                      objectX={objectX} 
                      lensType={lensType} 
                      isDarkMode={isDarkMode}
                      objectHeight={objectHeight}
                      perfMode={perfMode}
                    />

                    {/* Controls */}
                    <div className="mt-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Position Control */}
                      <div>
                        <div className="flex justify-between items-end mb-4">
                           <div>
                             <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">Object Position (u)</label>
                             <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-display font-bold tabular-nums text-blue-500">{(objectX * PIXEL_TO_CM).toFixed(1)}</span>
                                <span className="text-xs opacity-50">cm</span>
                             </div>
                           </div>
                        </div>
                        <input 
                          type="range" 
                          min="-450" 
                          max="-10" 
                          step="1"
                          value={objectX} 
                          onChange={(e) => setObjectX(Number(e.target.value))}
                          className="w-full h-8 md:h-3 rounded-full appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all touch-pan-x"
                        />
                        <div className="flex justify-between mt-2 text-[10px] uppercase font-bold opacity-40">
                           <span>Far (45cm)</span>
                           <span>Near (1cm)</span>
                        </div>
                      </div>

                      {/* Height Control */}
                      <div>
                        <div className="flex justify-between items-end mb-4">
                           <div>
                             <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">Object Height (h)</label>
                             <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-display font-bold tabular-nums text-emerald-500">{(objectHeight * PIXEL_TO_CM).toFixed(1)}</span>
                                <span className="text-xs opacity-50">cm</span>
                             </div>
                           </div>
                        </div>
                        <input 
                          type="range" 
                          min="20" 
                          max="120" 
                          value={objectHeight} 
                          onChange={(e) => setObjectHeight(Number(e.target.value))}
                          className="w-full h-8 md:h-3 rounded-full appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all touch-pan-x"
                        />
                        <div className="flex justify-between mt-2 text-[10px] uppercase font-bold opacity-40">
                           <span>2 cm</span>
                           <span>12 cm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     {/* Basic Numeric Stats */}
                     {[
                       { label: 'Focal Length (f)', value: (lensType === LensType.CONVEX ? '+' : '') + (currentF * PIXEL_TO_CM).toFixed(0), unit: 'cm' },
                       { label: 'Image Pos (v)', value: Math.abs(currentV) > 1000 ? '∞' : (currentV * PIXEL_TO_CM).toFixed(1), unit: 'cm' },
                       { label: 'Magnification (m)', value: m.toFixed(2), unit: 'x' },
                       { label: 'Image Height (hi)', value: imageSize > 1000 ? '∞' : (imageSize * PIXEL_TO_CM).toFixed(1), unit: 'cm' },
                     ].map((stat, i) => (
                       <div key={i} className={`p-4 rounded-2xl plateau border flex flex-col items-center justify-center text-center transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-white'}`}>
                         <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{stat.label}</span>
                         <div className={`text-xl font-display font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            {stat.value}<span className="text-xs ml-0.5 opacity-50 font-normal">{stat.unit}</span>
                         </div>
                       </div>
                     ))}
                  </div>

                  {/* Qualitative Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-100'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1 text-blue-500">Position</span>
                        <span className="font-bold text-sm">{positionDesc}</span>
                     </div>
                     <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-purple-900/20 border-purple-800/50' : 'bg-purple-50 border-purple-100'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1 text-purple-500">Nature</span>
                        <span className="font-bold text-sm">{natureDesc}</span>
                     </div>
                     <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-emerald-50 border-emerald-100'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1 text-emerald-500">Relative Size</span>
                        <span className="font-bold text-sm">{sizeDesc}</span>
                     </div>
                  </div>
              </div>
            )}

            {activeTab === 'learn' && (
              <div className="animate-fade-in-up max-w-7xl mx-auto pb-20">
                <EducationalContent 
                  lensType={lensType} 
                  isDarkMode={isDarkMode} 
                  objectX={objectX} 
                  focalLength={FOCAL_LENGTH} 
                />
              </div>
            )}
        </main>

        {/* Dedicated Toggleable AI Sidebar */}
        <div className={`transition-all duration-300 ease-in-out border-l z-20 overflow-hidden ${isTutorOpen ? 'w-full md:w-96 translate-x-0 opacity-100 fixed md:static inset-0 md:inset-auto' : 'w-0 translate-x-10 opacity-0'} ${isDarkMode ? 'bg-[#0a0a0a] border-slate-800' : 'bg-white border-slate-200'}`}>
           <div className="w-full md:w-96 h-full flex flex-col"> {/* Inner container needed to prevent content squishing during transition */}
              <AIAssistant 
                simulationState={{ objectX, objectHeight, focalLength: FOCAL_LENGTH, lensType }}
                isDarkMode={isDarkMode}
                onClose={() => setIsTutorOpen(false)}
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;