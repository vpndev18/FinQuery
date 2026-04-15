import React, { useState, useEffect, useRef } from 'react';
import { chatWithAi, getAiForecast } from '../services/api';

const AiChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your AI Financial Analyst. How can I help you today?", isAi: true }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = inputValue;
        setInputValue("");
        setMessages(prev => [...prev, { text: userMessage, isAi: false }]);
        setIsLoading(true);

        const result = await chatWithAi(userMessage);

        if (result.success) {
            setMessages(prev => [...prev, { text: result.data.response, isAi: true }]);
        } else {
            setMessages(prev => [...prev, { text: "Sorry, I encountered an error: " + result.error, isAi: true }]);
        }
        setIsLoading(false);
    };

    const handleForecast = async () => {
        setIsLoading(true);
        setIsOpen(true);
        setMessages(prev => [...prev, { text: "Generating your spend forecast...", isAi: false }]);

        const result = await getAiForecast();

        if (result.success) {
            setMessages(prev => [...prev, { text: result.data.response, isAi: true }]);
        } else {
            setMessages(prev => [...prev, { text: "Could not generate forecast: " + result.error, isAi: true }]);
        }
        setIsLoading(false);
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {/* Chat Window */}
            {isOpen && (
                <div className="card animate-fade-in" style={{
                    width: '350px',
                    height: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    marginBottom: '15px'
                }}>
                    <div style={{
                        padding: '1rem',
                        background: 'var(--primary-gradient)',
                        color: 'white',
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h4 style={{ margin: 0 }}>AI Analyst</h4>
                        <button onClick={() => setIsOpen(false)} style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                        }}>&times;</button>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem'
                    }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.isAi ? 'flex-start' : 'flex-end',
                                background: m.isAi ? '#f0f2f5' : 'var(--primary-color)',
                                color: m.isAi ? 'var(--text-primary)' : 'white',
                                padding: '0.8rem',
                                borderRadius: m.isAi ? '12px 12px 12px 0' : '12px 12px 0 12px',
                                maxWidth: '85%',
                                fontSize: '0.9rem',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {m.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', background: '#f0f2f5', padding: '0.8rem', borderRadius: '12px 12px 12px 0' }}>
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '1rem', borderTop: '1px solid #eee' }}>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                            <button
                                onClick={handleForecast}
                                className="btn"
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '4px 8px',
                                    background: '#e3f2fd',
                                    color: '#1976d2',
                                    border: '1px solid #bbdefb'
                                }}
                            >
                                ✨ Get Forecast
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about your spending..."
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                className="btn btn-primary"
                                disabled={isLoading}
                                style={{ padding: '0.6rem 1rem' }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Bubble */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '30px',
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
                {isOpen ? '💬' : '🤖'}
            </button>
        </div>
    );
};

export default AiChatbot;
