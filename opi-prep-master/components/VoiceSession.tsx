
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { OPIConfig, FeedbackSection } from '../types';
import { getSystemPrompt } from '../constants';
import { decodeAudioData, createPcmBlob, base64ToUint8Array } from '../services/audioUtils';
import { generateFeedback } from '../services/geminiService';
import AudioVisualizer from './AudioVisualizer';

interface VoiceSessionProps {
  config: OPIConfig;
  onFinish: (feedback: FeedbackSection) => void;
  onCancel: () => void;
}

const VoiceSession: React.FC<VoiceSessionProps> = ({ config, onFinish, onCancel }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  
  const audioStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Transcription state for feedback
  const [transcription, setTranscription] = useState<string>("");
  const transcriptBufferRef = useRef<string>("");

  const cleanup = useCallback(() => {
     // Stop audio contexts
     inputAudioContextRef.current?.close();
     outputAudioContextRef.current?.close();
     
     // Stop stream
     audioStreamRef.current?.getTracks().forEach(track => track.stop());
     
     // Stop sources
     sourcesRef.current.forEach(source => source.stop());
     sourcesRef.current.clear();
     
     setIsConnected(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const initSession = async () => {
    try {
      setError(null);
      setHasStarted(true);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      // Input: Request 16kHz if possible for the model
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      
      // Output: Use system default sample rate for best compatibility
      const outputCtx = new AudioContextClass();
      
      // CRITICAL: Resume output context within this user-triggered flow
      await outputCtx.resume();

      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // Setup Analysers for Visualization
      const inputAnalyser = inputCtx.createAnalyser();
      inputAnalyser.fftSize = 256;
      inputAnalyserRef.current = inputAnalyser;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 256;
      outputAnalyserRef.current = outputAnalyser;

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const systemInstruction = getSystemPrompt(config.targetLevel, config.language, config.immediateFeedback);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemInstruction,
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            inputAudioTranscription: {}, 
            outputAudioTranscription: {},
        },
        callbacks: {
            onopen: () => {
                setIsConnected(true);
                // Connect Mic to Processor
                const source = inputCtx.createMediaStreamSource(stream);
                const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmBlob = createPcmBlob(inputData);
                    
                    // Send to Gemini
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                
                // Visualizer connection
                source.connect(inputAnalyser);
                inputAnalyser.connect(scriptProcessor);
                scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
                // Handle Audio
                const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio && outputCtx) {
                     try {
                        const audioBuffer = await decodeAudioData(
                            base64ToUint8Array(base64Audio),
                            outputCtx,
                            24000 // Model output rate is typically 24kHz
                        );
                        
                        // Playback logic
                        const currentTime = outputCtx.currentTime;
                        if (nextStartTimeRef.current < currentTime) {
                            nextStartTimeRef.current = currentTime;
                        }
                        
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        
                        // Connect for playback and viz
                        source.connect(outputCtx.destination);
                        source.connect(outputAnalyser);
                        
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        
                        sourcesRef.current.add(source);
                        source.onended = () => sourcesRef.current.delete(source);
                     } catch (decodeErr) {
                        console.error("Audio Decode Error:", decodeErr);
                     }
                }
                
                // Handle Transcription for Report
                if (msg.serverContent?.outputTranscription?.text) {
                    transcriptBufferRef.current += `Tester: ${msg.serverContent.outputTranscription.text}\n`;
                    setTranscription(prev => prev + `Tester: ${msg.serverContent.outputTranscription.text}\n`);
                }
                if (msg.serverContent?.inputTranscription?.text) {
                    transcriptBufferRef.current += `Candidate: ${msg.serverContent.inputTranscription.text}\n`;
                    setTranscription(prev => prev + `Candidate: ${msg.serverContent.inputTranscription.text}\n`);
                }
            },
            onclose: () => {
                setIsConnected(false);
            },
            onerror: (err) => {
                console.error("Live API Error:", err);
                setError("Connection error. Please try again.");
            }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (e) {
      console.error("Initialization Error", e);
      setError("Failed to access microphone or connect to AI. Please ensure permissions are granted.");
      setHasStarted(false);
    }
  };

  const handleEndSession = async () => {
    setIsFinishing(true);
    // Disconnect live session
    cleanup();
    
    // Generate Report
    try {
        if (!transcriptBufferRef.current) {
            transcriptBufferRef.current = "Audio session completed. Transcription was unavailable.";
        }
        const feedback = await generateFeedback(transcriptBufferRef.current);
        onFinish(feedback);
    } catch (e) {
        console.error("Error generating feedback", e);
    } finally {
        setIsFinishing(false);
    }
  };

  if (!hasStarted) {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-white relative overflow-hidden items-center justify-center p-6">
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-50"></div>
         <div className="relative z-10 max-w-md text-center space-y-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(37,99,235,0.5)]">
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Ready for Live Practice?</h2>
              <p className="text-blue-200">
                You are about to start a real-time voice interview. 
                Ensure you are in a quiet environment.
              </p>
            </div>
            
            <div className="space-y-4">
               <button 
                  onClick={initSession}
                  className="w-full py-4 px-8 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
               >
                  Start Live Session
               </button>
               <button 
                  onClick={onCancel}
                  className="w-full py-3 text-slate-400 hover:text-white transition font-medium"
               >
                  Go Back
               </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-50"></div>
      
      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold tracking-tight">Live Voice Assessment</h2>
           <div className="flex items-center gap-2">
              <p className="text-blue-200 text-sm">Target: {config.targetLevel} | {config.language}</p>
              {config.immediateFeedback && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">Immediate Feedback</span>
              )}
           </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-mono animate-pulse border border-red-500/30">
              ● LIVE
           </div>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 relative z-10 flex flex-col justify-center items-center p-8 space-y-12">
         
         <div className="relative w-64 h-64 flex justify-center items-center">
            {/* Pulsing Rings */}
            <div className={`absolute inset-0 rounded-full border-2 border-blue-500/30 ${isConnected ? 'animate-ping' : ''}`} style={{animationDuration: '3s'}}></div>
            <div className={`absolute inset-4 rounded-full border border-blue-400/20 ${isConnected ? 'animate-pulse' : ''}`}></div>
            
            {/* Avatar / Status */}
            <div className="w-48 h-48 bg-slate-800 rounded-full shadow-2xl border-4 border-slate-700 flex justify-center items-center overflow-hidden">
                {isConnected ? (
                   <div className="text-6xl animate-pulse">🎙️</div>
                ) : (
                   <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                )}
            </div>
         </div>
         
         {/* Audio Visualizers */}
         <div className="w-full max-w-lg space-y-4">
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                 <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Tester Audio</p>
                 <AudioVisualizer analyser={outputAnalyserRef.current} isActive={isConnected} />
             </div>
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                 <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Your Microphone</p>
                 <AudioVisualizer analyser={inputAnalyserRef.current} isActive={isConnected} />
             </div>
         </div>
         
         {!isConnected && !error && (
             <p className="text-blue-300 animate-pulse">Connecting to AI Tester...</p>
         )}

         {isConnected && (
             <p className="text-slate-400 text-sm">Say <span className="text-white font-bold">"Hello"</span> to begin the interview.</p>
         )}
         
         {error && (
             <div className="text-red-400 bg-red-900/20 px-4 py-2 rounded border border-red-500/30">
                 {error}
             </div>
         )}
      </div>

      {/* Controls */}
      <div className="relative z-10 bg-slate-800/80 p-6 backdrop-blur-md border-t border-slate-700 flex justify-center gap-6">
          <button 
             onClick={onCancel}
             className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition"
          >
              Cancel
          </button>
          <button 
             onClick={handleEndSession}
             disabled={isFinishing || !isConnected}
             className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/30 transition transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
          >
             {isFinishing ? 'Analyzing...' : 'End & Evaluate'}
          </button>
      </div>
    </div>
  );
};

export default VoiceSession;
