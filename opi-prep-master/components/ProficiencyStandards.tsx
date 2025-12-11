import React from 'react';

interface ProficiencyStandardsProps {
  onClose: () => void;
}

const ProficiencyStandards: React.FC<ProficiencyStandardsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">ILR / OPI Proficiency Levels</h2>
            <p className="text-slate-500 text-sm mt-1">Based on Interagency Language Roundtable & DLIELC Guidelines</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500 hover:text-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Introduction */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-blue-900 font-semibold mb-2">The "Probing" Method</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              The test works by pushing you to your linguistic "ceiling". 
              If you sustain performance at a level for <strong>3 consecutive tasks</strong>, the tester moves up.
              If you show breakdown (grammar, hesitation, fallback to native language) <strong>2 times</strong>, the tester moves down.
            </p>
          </div>

          {/* Major Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Level 1 */}
            <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition shadow-sm">
              <div className="flex items-center mb-3">
                <span className="bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider mr-2">Level 1</span>
                <h3 className="text-lg font-bold text-slate-800">Survival Proficiency</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                <li>Participate in very simple conversations.</li>
                <li><strong>Topics:</strong> Personal welfare, survival needs (meals, lodging), simple travel, family.</li>
                <li><strong>Accuracy:</strong> Intelligible to native speakers used to dealing with non-natives. Requires repetition.</li>
                <li><strong>Tasks:</strong> Q&A, simple requests.</li>
              </ul>
            </div>

            {/* Level 2 */}
            <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition shadow-sm">
              <div className="flex items-center mb-3">
                <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider mr-2">Level 2</span>
                <h3 className="text-lg font-bold text-slate-800">Limited Working Proficiency</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                <li>Participate in routine conversations and professional discussions.</li>
                <li><strong>Topics:</strong> Current events, work, family, concrete topics.</li>
                <li><strong>Tasks:</strong> Instructions ("How to fix..."), Descriptions ("Describe your home..."), Narration in Past/Current/Future.</li>
                <li><strong>Accuracy:</strong> Paragraph-length speech. Understandable to native speakers not used to foreigners.</li>
              </ul>
            </div>

            {/* Level 3 */}
            <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition shadow-sm">
              <div className="flex items-center mb-3">
                <span className="bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider mr-2">Level 3</span>
                <h3 className="text-lg font-bold text-slate-800">General Professional Proficiency</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                <li>Discuss social, economic, cultural, and scientific issues.</li>
                <li><strong>Tasks:</strong> Support opinions, hypothesize ("What if..."), discuss abstract concepts.</li>
                <li><strong>Accuracy:</strong> Extended discourse, precise vocabulary, rare errors that do not disturb the native speaker.</li>
              </ul>
            </div>

            {/* Level 4 (Reference) */}
            <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition shadow-sm opacity-75">
              <div className="flex items-center mb-3">
                <span className="bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider mr-2">Level 4</span>
                <h3 className="text-lg font-bold text-slate-800">Advanced Professional</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                <li>Fluid and precise technical vocabulary.</li>
                <li>Culturally appropriate and nuanced.</li>
                <li>Comparable to an educated native speaker.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProficiencyStandards;