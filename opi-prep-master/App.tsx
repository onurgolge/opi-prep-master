
import React, { useState } from 'react';
import { OPIConfig, ProficiencyLevel, PracticeMode, FeedbackSection } from './types';
import ChatSession from './components/ChatSession';
import VoiceSession from './components/VoiceSession';
import FeedbackReport from './components/FeedbackReport';
import ProficiencyStandards from './components/ProficiencyStandards';

const App: React.FC = () => {
  const [config, setConfig] = useState<OPIConfig | null>(null);
  const [feedback, setFeedback] = useState<FeedbackSection | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showStandards, setShowStandards] = useState(false);

  // Configuration State
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyLevel>(ProficiencyLevel.INTERMEDIATE);
  // Default to English, no selection needed
  const selectedLang = 'English';
  const [selectedMode, setSelectedMode] = useState<PracticeMode>(PracticeMode.VOICE);
  const [immediateFeedback, setImmediateFeedback] = useState(false);

  const startTest = () => {
    setConfig({
      targetLevel: selectedLevel,
      language: selectedLang,
      mode: selectedMode,
      immediateFeedback: immediateFeedback
    });
    setHasStarted(true);
    setFeedback(null);
  };

  const handleFinish = (result: FeedbackSection) => {
    setFeedback(result);
    setHasStarted(false);
    setConfig(null);
  };

  const handleCancel = () => {
    setHasStarted(false);
    setConfig(null);
  };

  const handleRestart = () => {
    setFeedback(null);
    setConfig(null);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Grading Criteria Modal */}
      {showStandards && (
        <ProficiencyStandards onClose={() => setShowStandards(false)} />
      )}

      {!hasStarted && !feedback ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">OPI Prep Master</h1>
              <p className="text-slate-500 mt-2">Ace your Oral Proficiency Interview (ILR/DLIELC Style)</p>
              
              <button 
                onClick={() => setShowStandards(true)}
                className="mt-4 text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline flex items-center justify-center w-full"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                View Proficiency Levels
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Proficiency Level</label>
                <select 
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as ProficiencyLevel)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value={ProficiencyLevel.NOVICE}>Level 0+/1 (Novice/Survival)</option>
                  <option value={ProficiencyLevel.INTERMEDIATE}>Level 1+/2 (Intermediate/Limited)</option>
                  <option value={ProficiencyLevel.ADVANCED}>Level 2+/3 (Advanced/Professional)</option>
                  <option value={ProficiencyLevel.SUPERIOR}>Level 3+/4 (Superior/Distinguished)</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedLevel === ProficiencyLevel.NOVICE && "Level 1: Simple questions, survival needs."}
                  {selectedLevel === ProficiencyLevel.INTERMEDIATE && "Level 2: Instructions, descriptions, narration in paragraphs."}
                  {selectedLevel === ProficiencyLevel.ADVANCED && "Level 3: Abstract topics, supported opinions, hypothesis."}
                  {selectedLevel === ProficiencyLevel.SUPERIOR && "Level 4: High-level professional discourse."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Practice Mode</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedMode(PracticeMode.TEXT)}
                    className={`p-4 rounded-xl border-2 transition flex flex-col items-center ${selectedMode === PracticeMode.TEXT ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 text-slate-600'}`}
                  >
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <span className="font-semibold text-sm">Text Chat</span>
                  </button>
                  <button
                    onClick={() => setSelectedMode(PracticeMode.VOICE)}
                    className={`p-4 rounded-xl border-2 transition flex flex-col items-center ${selectedMode === PracticeMode.VOICE ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 text-slate-600'}`}
                  >
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                    <span className="font-semibold text-sm">Voice Live</span>
                  </button>
                </div>
              </div>

              <div 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition"
                onClick={() => setImmediateFeedback(!immediateFeedback)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700 text-sm">Immediate Feedback</span>
                  <span className="text-xs text-slate-500">Get real-time corrections and tips</span>
                </div>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${immediateFeedback ? 'bg-blue-600' : 'bg-slate-300'}`}>
                   <span className={`${immediateFeedback ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                </div>
              </div>

              <button 
                onClick={startTest}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
              >
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      ) : feedback ? (
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <FeedbackReport feedback={feedback} onRestart={handleRestart} />
        </div>
      ) : (
        <div className="flex-1 h-full">
          {config?.mode === PracticeMode.TEXT ? (
            <ChatSession config={config} onFinish={handleFinish} onCancel={handleCancel} />
          ) : config?.mode === PracticeMode.VOICE ? (
            <VoiceSession config={config!} onFinish={handleFinish} onCancel={handleCancel} />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default App;
