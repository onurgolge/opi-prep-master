
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { OPIConfig, Message, FeedbackSection } from '../types';
import { getSystemPrompt } from '../constants';
import { generateFeedback } from '../services/geminiService';

interface ChatSessionProps {
  config: OPIConfig;
  onFinish: (feedback: FeedbackSection) => void;
  onCancel: () => void;
}

const ChatSession: React.FC<ChatSessionProps> = ({ config, onFinish, onCancel }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const systemInstruction = getSystemPrompt(config.targetLevel, config.language, config.immediateFeedback);
    
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      },
    });

    // Initial greeting from model
    const startInterview = async () => {
      setIsLoading(true);
      try {
        const response = await chatRef.current?.sendMessage({ message: "Hello, I am ready to start." });
        if (response?.text) {
          const msg: Message = {
            id: Date.now().toString(),
            role: 'model',
            content: response.text,
            timestamp: Date.now(),
            groundingMetadata: response.candidates?.[0]?.groundingMetadata
          };
          setMessages([msg]);
          transcriptRef.current += `Tester: ${response.text}\n`;
        }
      } catch (e) {
        console.error("Failed to start chat", e);
      } finally {
        setIsLoading(false);
      }
    };

    startInterview();
  }, [config]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatRef.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    transcriptRef.current += `Candidate: ${inputText}\n`;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: inputText });
      if (response?.text) {
        const modelMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: response.text,
          timestamp: Date.now(),
          groundingMetadata: response.candidates?.[0]?.groundingMetadata
        };
        setMessages(prev => [...prev, modelMsg]);
        transcriptRef.current += `Tester: ${response.text}\n`;
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndTest = async () => {
    setIsFinishing(true);
    try {
      const feedback = await generateFeedback(transcriptRef.current);
      onFinish(feedback);
    } catch (e) {
      console.error("Error generating feedback", e);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">OPI Practice: {config.language}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Target: {config.targetLevel}</span>
            {config.immediateFeedback && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Instant Feedback On</span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
            <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 font-medium">
                Exit
            </button>
            <button 
                onClick={handleEndTest} 
                disabled={isFinishing || messages.length < 2}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                {isFinishing ? (
                    <span className="flex items-center">
                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         Evaluating...
                    </span>
                ) : "End Test & Evaluate"}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              
              {/* Grounding Sources Display */}
              {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                <div className="mt-2 text-xs text-slate-500 bg-white/50 p-2 rounded border border-slate-100 max-w-full">
                  <p className="font-semibold mb-1 opacity-70">Sources used:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                      if (chunk.web?.uri) {
                         return (
                            <a 
                              key={i} 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-block hover:underline truncate text-blue-500 bg-white px-1 rounded shadow-sm border border-slate-100"
                              title={chunk.web.title}
                            >
                              {chunk.web.title || new URL(chunk.web.uri).hostname}
                            </a>
                         );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-2">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            }}
            placeholder="Type your response here..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-14 bg-slate-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSession;
