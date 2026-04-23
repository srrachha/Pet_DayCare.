import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, MessageSquare, X } from 'lucide-react';

const MessageCenter = ({ currentUser, isAdmin }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      const interval = setInterval(() => fetchMessages(selectedUser.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(scrollToBottom, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
      
      // If admin, and no conversation selected, maybe show all users?
      // For now, just show who we have messages with
    } catch (err) {
      console.error('Error fetching conversations', err);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/messages', {
        receiver_id: selectedUser.id,
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '400px',
      height: '500px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '20px',
      boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid var(--glass-border)',
      zIndex: 1000,
      overflow: 'hidden'
    }} className="fade-in">
      <div style={{
        padding: '1.25rem',
        backgroundColor: 'var(--accent-primary)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>{selectedUser ? `Chat with ${selectedUser.username}` : 'Messages'}</h3>
        <X size={20} cursor="pointer" onClick={() => { setIsOpen(false); setSelectedUser(null); }} />
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {!selectedUser ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {conversations.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                No active conversations.
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.id} 
                  onClick={() => setSelectedUser(conv)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="white" />
                  </div>
                  <span style={{ fontWeight: '600' }}>{conv.username}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setSelectedUser(null)}
              style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none' }}
            >
              ← Back to conversations
            </button>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  alignSelf: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.sender_id === currentUser.id ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  backgroundColor: msg.sender_id === currentUser.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                  fontSize: '0.9rem'
                }}>
                  {msg.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '10px' }}>
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCenter;
