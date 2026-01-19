import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatBotWidget.css'; // Make sure this CSS file exists
import { apiUrl } from './services/ApplicantAPIService.js'; // Adjust the import path as necessary
 
const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cancelTokenSource, setCancelTokenSource] = useState(null);//update
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hey there 👋\nHow can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const chatIconRef = useRef(null);
 
 
  const toggleChat = () => setIsOpen(!isOpen);
 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target) &&
        chatIconRef.current &&
        !chatIconRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
 
 
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
 
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
 
  const sendMessage = async () => {
    if (!input.trim()) return;
 
    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
 
    //update
    const source = axios.CancelToken.source();
    setCancelTokenSource(source);
    try {
      const res = await axios.post(
        `${apiUrl}/api/gemini/chat`,
        {
          contents: [{ parts: [{ text: input }] }]
        },
        {
          cancelToken: source.token, // update
        }
      );
      const botReply = res.data.candidates[0].content.parts[0].text;
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('Error fetching response:', error);
      //update
      if (axios.isCancel(error)) {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Cancelled.' }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
      }
    } finally {
      setLoading(false);
      setCancelTokenSource(null); // update
    }
  };
  //update
  const handleCancel = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel();
      setLoading(false);
      setCancelTokenSource(null);
    }
  };
 
  return (
    <>
      {/* Chat Icon Button */}
 <button
  className="chat-icon"
  ref={chatIconRef}
  onClick={toggleChat}
  aria-label="Toggle chat window"
>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 495.07 470.51" width="48" height="48">
          <defs>
            <style>
              {`
                .cls-1 { fill: #fff; }
                .cls-2 { fill: #ff7c06; }
              `}
            </style>
          </defs>
          <g>
            <g>
              <path className="cls-1" d="M168.85,326.15c-47.33-46.48-68.8-115.22-58.41-180.15,1.51-9.43-8.4-16.47-16.81-11.95C-3.27,186.15-31.31,316.75,39.69,404.33c2.52,3.11,3.3,7.29,1.99,11.07l-12.99,37.38c-3.15,9.06,5.55,17.76,14.61,14.61l46.54-16.17c2.95-1.03,6.19-.8,8.97.62,73.5,37.62,167.09,16.41,218.41-46.18,6.03-7.35.88-18.36-8.62-18.69-52.37-1.81-102.38-23.27-139.75-60.83Z" />
              <path className="cls-1" d="M456.09,290.48C549.3,174.85,464.58-.69,315.96,0c-99.51-.42-179.69,82.6-179.04,179.04,0,98.72,80.32,179.04,179.04,179.04,27.96.1,55.16-6.52,80.21-18.87,2.74-1.35,5.91-1.54,8.8-.53l46.65,16.21c9.06,3.15,17.76-5.55,14.61-14.61l-13.05-37.56c-1.29-3.72-.59-7.84,1.87-10.93l1.04-1.3Z" />
            </g>
            <g>
              <path className="cls-2" d="M241.01,241.51h-7.08c-7.89,0-13.43-7.77-10.85-15.23l40.11-116.18c1.6-4.63,5.96-7.74,10.85-7.74h21.54c4.9,0,9.26,3.11,10.86,7.74l40.05,116.18c2.57,7.46-2.97,15.22-10.86,15.22h-7.08c-4.98,0-9.38-3.2-10.92-7.94l-32.28-99.41h-1.09l-32.34,99.42c-1.54,4.73-5.95,7.93-10.92,7.93ZM258.87,186.81h51.5c6.34,0,11.48,5.14,11.48,11.48h0c0,6.34-5.14,11.48-11.48,11.48h-51.5c-6.34,0-11.48-5.14-11.48-11.48h0c0-6.34,5.14-11.48,11.48-11.48Z" />
              <path className="cls-2" d="M397.88,113.84v116.18c0,6.34-5.14,11.48-11.48,11.48h-6.45c-6.34,0-11.48-5.14-11.48-11.48v-116.18c0-6.34,5.14-11.48,11.48-11.48h6.45c6.34,0,11.48,5.14,11.48,11.48Z" />
            </g>
          </g>
        </svg>
      </button>
 
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbox" ref={chatRef}>
          <div className="chat-header">JobGenie AI
            <div className="chat-actions">
              {/* Refresh Button */}
              <svg
                onClick={() => {
                  setMessages([{ sender: 'bot', text: 'Hey there 👋\nHow can I help you today?' }]);
                  setInput('');
                }}
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ cursor: 'pointer', marginRight: '22px', marginTop: '5px' }}
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15A9 9 0 1 1 23 10" />
              </svg>
 
              {/* Close Button */}
              <svg
                onClick={() => setIsOpen(false)}
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ cursor: 'pointer' }}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </div>
          <div className="chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                <div className="bubble-content">{msg.text}</div>
              </div>
            ))}
 
            {loading && (
              <div className="chat-bubble bot">
                <div className="bubble-content">Thinking...</div>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            {/* update */}
            <textarea
              type="text"
              placeholder="Message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && !e.shiftKey) {
                  e.preventDefault();//update
                  sendMessage();
                }
              }}
              rows={1}
            />
            {loading ? (
              <button onClick={handleCancel} className='button-cancel'>Cancel</button>
            ) : (
              <button onClick={sendMessage}>➤</button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
 
export default ChatBotWidget;
 