
import React, { useState } from 'react';
import { FeedbackSection } from '../types';

interface FeedbackReportProps {
  feedback: FeedbackSection;
  onRestart: () => void;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ feedback, onRestart }) => {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-100 mt-8 animate-fade-in mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">OPI Performance Report</h2>
        <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-lg">
          Estimated Rating: {feedback.rating}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Strengths
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start text-slate-700">
                <span className="mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
          <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {feedback.areasForImprovement.map((item, idx) => (
              <li key={idx} className="flex items-start text-slate-700">
                <span className="mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* New Vocabulary and Grammar Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
          <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Recommended Vocabulary
          </h3>
          <ul className="space-y-2">
            {feedback.vocabulary && feedback.vocabulary.length > 0 ? feedback.vocabulary.map((item, idx) => (
              <li key={idx} className="flex items-start text-slate-700 text-sm bg-white p-2 rounded shadow-sm">
                <span className="text-indigo-500 font-bold mr-2">→</span>
                {item}
              </li>
            )) : <li className="text-slate-500 italic">No specific vocabulary suggestions.</li>}
          </ul>
        </div>

        <div className="bg-rose-50 p-6 rounded-lg border border-rose-100">
          <h3 className="text-xl font-semibold text-rose-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Grammar Focus
          </h3>
          <ul className="space-y-2">
            {feedback.grammar && feedback.grammar.length > 0 ? feedback.grammar.map((item, idx) => (
              <li key={idx} className="flex items-start text-slate-700 text-sm bg-white p-2 rounded shadow-sm">
                 <span className="text-rose-500 font-bold mr-2">!</span>
                {item}
              </li>
            )) : <li className="text-slate-500 italic">No specific grammar issues found.</li>}
          </ul>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Detailed Analysis</h3>
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{feedback.detailedAnalysis}</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
         <h3 className="text-xl font-semibold text-blue-800 mb-4">Pedagogical Tips</h3>
         <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.tips.map((tip, idx) => (
              <li key={idx} className="bg-white p-3 rounded shadow-sm text-slate-700 text-sm border-l-4 border-blue-400">
                {tip}
              </li>
            ))}
         </ul>
      </div>

      {/* Transcript Section */}
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-800">Interview Transcript</h3>
            <button 
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
                {showTranscript ? "Hide Transcript" : "Show Transcript"}
            </button>
        </div>
        
        {showTranscript && (
            <div className="bg-white p-4 rounded border border-slate-300 max-h-96 overflow-y-auto font-mono text-sm text-slate-600 whitespace-pre-wrap">
                {feedback.transcript}
            </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={onRestart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
        >
          Start New Practice
        </button>
      </div>
    </div>
  );
};

export default FeedbackReport;
