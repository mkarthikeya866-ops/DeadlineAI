import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const startRecording = () => {
    // Basic Web Speech API check
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsRecording(true);
      setAiResponse('');
    };

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      console.log('Voice Input result:', text);
      setTranscript(text);
      setIsRecording(false);

      try {
        const response = await fetch('/api/gemini/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, context: {} })
        });
        const data = await response.json();
        console.log('AI Response:', data.reply);
        setAiResponse(data.reply);
        
        // Speak the response
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.reply);
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error('Failed to get AI response', error);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      } else {
        alert('Speech recognition error: ' + event.error);
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <h3 className="text-sm font-semibold text-slate-100 mb-2">DeadlineAI Voice Assistant 🎙️</h3>
      <button 
        onClick={startRecording} 
        className={`p-4 rounded-full ${isRecording ? 'bg-rose-600' : 'bg-indigo-600'} text-white transition-all`}
      >
        {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>
      {transcript && <p className="text-xs text-slate-400 font-mono">You: {transcript}</p>}
      {aiResponse && <p className="text-xs text-indigo-400 font-mono">Deadline AI: {aiResponse}</p>}
    </div>
  );
}
