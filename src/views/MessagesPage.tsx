import { useState, useEffect } from 'react';
import { FiMessageSquare, FiArrowLeft, FiSend } from 'react-icons/fi';
import type { MessageThread } from '../helpers/types/localTypes';
import { useAuth } from '../context/AuthContext';

type ChatMessage = { id: number; from: 'me' | 'them'; text: string; time: string };

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [openThread, setOpenThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [threads, setThreads] = useState<MessageThread[]>([]);

  useEffect(() => {
    // Backend integration: fetch message threads from your API
    // Example: fetch(`/api/messages/threads`).then(res => res.json()).then(setThreads)
  }, []);

  const openConversation = (thread: MessageThread) => {
    setOpenThread(thread);
    setThreads((prev) => prev.map((t) => t.id === thread.id ? { ...t, unreadCount: 0 } : t));
    // Backend integration: fetch messages for this thread from your API
    // Example: fetch(`/api/messages/${thread.id}`).then(res => res.json()).then(setMessages)
  };

  const sendMessage = () => {
    if (!input.trim() || !openThread) return;
    const newMsg: ChatMessage = {
      id: messages.length + 1,
      from: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setThreads((prev) => prev.map((t) =>
      t.id === openThread.id ? { ...t, lastMessage: newMsg.text, lastMessageAt: new Date().toISOString() } : t
    ));
    setInput('');
    // Backend integration: send the message via your API
    // Example: fetch(`/api/messages/${openThread.id}`, { method: 'POST', body: JSON.stringify({ content: input }) })
  };

  // Conversation view
  if (openThread) {
    return (
      <div className="messages-page">
        <div className="chat-header">
          <button className="chat-header__back" onClick={() => setOpenThread(null)}>
            <FiArrowLeft size={20} />
          </button>
          <span className="chat-header__name">{openThread.otherUser.username}</span>
        </div>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.from === 'me' ? 'chat-bubble--me' : 'chat-bubble--them'}`}>
              <p className="chat-bubble__text">{msg.text}</p>
              <span className="chat-bubble__time">{msg.time}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            className="chat-input__field"
            type="text"
            placeholder="Kirjoita viesti..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="chat-input__send" onClick={sendMessage} disabled={!input.trim()}>
            <FiSend size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Thread list view
  return (
    <div className="messages-page">
      <h2 className="messages-page__title">Viestit {user && <>— {user.Firstname || user.username}</>}</h2>
      <div className="messages-list">
        {threads.map((thread) => (
          <button key={thread.id} className="message-item" onClick={() => openConversation(thread)}>
            <div className="message-item__avatar">
              <FiMessageSquare size={24} />
            </div>
            <div className="message-item__content">
              <div className="message-item__header">
                <span className="message-item__name">{thread.otherUser.username}</span>
                <span className="message-item__time">
                  {new Date(thread.lastMessageAt).toLocaleDateString('fi-FI')}
                </span>
              </div>
              <p className="message-item__preview">{thread.lastMessage}</p>
            </div>
            {thread.unreadCount > 0 && (
              <span className="message-item__badge">{thread.unreadCount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;
