import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Ai.css';
import { AlertTriangle } from 'lucide-react';
import { handlePanicButton } from '../utils/panicButton';

const AIEmergencyPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Hello! I'm your AI Emergency Assistant. Describe your emergency situation, and I'll provide step-by-step guidance. You can type or use voice input. How can I help you today?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cancel speech when voice is disabled
  useEffect(() => {
    if (!voiceEnabled) {
      window.speechSynthesis.cancel();
    }
  }, [voiceEnabled]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message; // Store message before clearing

    // Add user message to chat
    const userMsg = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          userId: localStorage.getItem('userId') || 'default'
        })
      });

      const data = await response.json();
      if (data.success) {
        const botMessage = {
          role: 'bot',
          content: data.reply
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Read bot response out loud if voice is enabled
        if (voiceEnabled) {
          speakMessage(data.reply);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Connection error. Make sure the backend is running on port 5000.'
      }]);
    }

    setLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondata = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition immediately
      startSpeechRecognition();
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Please allow microphone access to use voice input');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startSpeechRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setMessage('🎤 Listening... ');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Show live transcription
      const displayText = finalTranscript + interimTranscript;
      if (displayText) {
        setMessage(displayText);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
    };

    recognition.start();
  };

  const speakMessage = (text) => {
    // Stop any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  const sendQuickAction = async (buttonText) => {
    // Add user message to chat
    const userMsg = { role: 'user', content: buttonText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: buttonText,
          userId: localStorage.getItem('userId') || 'default'
        })
      });

      const data = await response.json();
      if (data.success) {
        const botMessage = {
          role: 'bot',
          content: data.reply
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Read bot response out loud if voice is enabled
        if (voiceEnabled) {
          speakMessage(data.reply);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Connection error. Make sure the backend is running on port 5000.'
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="ai-page">
      {/* Main Content */}
      <main className="ai-main-content">
        <div className="ai-title-section">
          <h1>AI Emergency Assistant</h1>
          <p className="ai-subtitle">Get instant emergency guidance with voice support</p>
        </div>

        <div className="ai-action-buttons">
          <button 
            className={`ai-voice-btn ${voiceEnabled ? 'active' : ''}`}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
        </div>

        {/* Emergency Quick Actions */}
        <div className="ai-quick-actions">
          <button 
            className="ai-quick-btn"
            onClick={() => sendQuickAction('Someone fainted')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Someone fainted
          </button>
          <button 
            className="ai-quick-btn"
            onClick={() => sendQuickAction('Car accident')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Car accident
          </button>
          <button 
            className="ai-quick-btn"
            onClick={() => sendQuickAction('Fire emergency')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            Fire emergency
          </button>
          <button 
            className="ai-quick-btn"
            onClick={() => sendQuickAction('Flood situation')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
            Flood situation
          </button>
        </div>

        {/* Chat Container */}
        <div className="ai-chat-container">
          <div className="ai-chat-status">
            <span className="ai-status-indicator"></span>
            Emergency Chat Active
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role === 'bot' ? 'ai-bot-message' : 'ai-user-message'}`}>
                {msg.role === 'bot' && (
                  <div className="ai-message-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                )}
                <div className="ai-message-content">
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-message ai-bot-message">
                <div className="ai-message-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="ai-message-content">
                  <p>Typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="ai-input-container" onSubmit={sendMessage}>
            <button 
              type="button" 
              className="ai-mic-btn"
              onClick={isRecording ? stopRecording : startRecording}
              style={{ backgroundColor: isRecording ? '#ff4444' : '' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <input 
              type="text" 
              className="ai-message-input" 
              placeholder="Describe your emergency..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="ai-send-btn" disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>

          <p className="ai-input-hint">Type or click the mic button to speak</p>
        </div>

        {/* Emergency Numbers */}
        <div className="ai-emergency-numbers">
          <span className="ai-numbers-label">Emergency Numbers:</span>
          <button className="ai-emergency-badge rescue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Rescue: 1122
          </button>
          <button className="ai-emergency-badge police">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Police: 15
          </button>
          <button className="ai-emergency-badge fire">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Fire: 16
          </button>
          <button className="ai-emergency-badge edhi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Edhi: 115
          </button>
        </div>
      </main>

     

      

      <button className="fab" onClick={() => handlePanicButton(navigate)}>
        <AlertTriangle size={24} />
      </button>
      
    </div>
  );
};

export default AIEmergencyPage;