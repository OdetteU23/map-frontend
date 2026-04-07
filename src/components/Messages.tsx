// Pure presentational component — all logic lives in useMessages hook
import React from 'react';
import { FiMessageSquare, FiArrowLeft, FiSend, FiInbox, FiNavigation, FiFile, FiTrash2, FiRotateCcw } from 'react-icons/fi';
//import { getUserDisplayName } from '../helpers/types/localTypes';
import type { MessageThread } from '../helpers/types/localTypes';
import type { User, ServiceProviderProfile } from 'map-hybrid-types-server';
import type { ChatMessage, MessageTab, Draft } from '../hooks/useMessages';

const TAB_CONFIG: { key: MessageTab; label: string; icon: React.ReactNode }[] = [
  { key: 'inbox', label: 'Inbox', icon: <FiInbox size={16} /> },
  { key: 'sent', label: 'Sent', icon: <FiNavigation size={16} /> },
  { key: 'drafts', label: 'Drafts', icon: <FiFile size={16} /> },
  { key: 'deleted', label: 'Deleted', icon: <FiTrash2 size={16} /> },
];

type MessagesProps = {
  user: User | ServiceProviderProfile | null;
  activeTab: MessageTab;
  threads: MessageThread[];
  drafts: Draft[];
  openThread: MessageThread | null;
  messages: ChatMessage[];
  input: string;
  newRecipient: string;
  isLoading?: boolean;
  error?: string | null;
  onSwitchTab: (tab: MessageTab) => void;
  onOpenConversation: (thread: MessageThread) => void;
  onCloseConversation: () => void;
  onDeleteThread: (thread: MessageThread) => void;
  onRestoreThread: (thread: MessageThread) => void;
  onSendMessage: () => void;
  onSaveDraft: () => void;
  onDeleteDraft: (draftId: number) => void;
  onEditDraft: (draft: Draft) => void;
  onInputChange: (value: string) => void;
  onNewRecipientChange: (value: string) => void;
  formatDate: (date: string | Date) => string;
};

const MessagesComp: React.FC<MessagesProps> = ({
  activeTab,
  threads,
  drafts,
  openThread,
  messages,
  input,
  newRecipient,
  isLoading,
  error,
  onSwitchTab,
  onOpenConversation,
  onCloseConversation,
  onDeleteThread,
  onRestoreThread,
  onSendMessage,
  onSaveDraft,
  onDeleteDraft,
  onEditDraft,
  onInputChange,
  onNewRecipientChange,
  formatDate,
}) => {
  // Content for the right panel
  const renderContent = () => {
    // Conversation view
    if (openThread) {
      return (
        <div className="msg-content msg-content--chat">
          <div className="chat-header">
            <button className="chat-header__back" onClick={onCloseConversation}>
              <FiArrowLeft size={20} />
            </button>
            <span className="chat-header__name">{openThread.otherUser.username}</span>
          </div>
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble ${msg.from === 'me' ? 'chat-bubble--me' : 'chat-bubble--them'}`}
              >
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
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            />
            <button className="chat-input__send" onClick={onSendMessage} disabled={!input.trim()}>
              <FiSend size={20} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="msg-content">
        {/* Compose new message (inbox & sent) */}
        {(activeTab === 'inbox' || activeTab === 'sent') && (
          <div className="compose-section">
            <h3 className="compose-section__title">Uusi viesti</h3>
            <input
              className="compose-section__recipient"
              type="text"
              placeholder="Vastaanottajan ID"
              value={newRecipient}
              onChange={(e) => onNewRecipientChange(e.target.value)}
            />
            <div className="compose-section__body">
              <textarea
                className="compose-section__textarea"
                placeholder="Kirjoita viesti..."
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendMessage();
                  }
                }}
              />
              <div className="compose-section__actions">
                <button
                  className="chat-input__send"
                  onClick={onSendMessage}
                  disabled={!input.trim() || !newRecipient.trim()}
                >
                  <FiSend size={20} />
                </button>
                <button
                  className="msg-draft-btn"
                  onClick={onSaveDraft}
                  disabled={!input.trim() || !newRecipient.trim()}
                  title="Save as draft"
                >
                  <FiFile size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drafts tab content */}
        {activeTab === 'drafts' && (
          <div className="messages-list">
            {drafts.length === 0 ? (
              <p className="messages-list__empty">Ei luonnoksia.</p>
            ) : (
              drafts.map((draft) => (
                <div key={draft.id} className="message-item message-item--draft">
                  <div className="message-item__avatar">
                    <FiFile size={24} />
                  </div>
                  <div className="message-item__content">
                    <div className="message-item__header">
                      <span className="message-item__name">To: {draft.recipientId}</span>
                      <span className="message-item__time">{formatDate(draft.updatedAt)}</span>
                    </div>
                    <p className="message-item__preview">{draft.content}</p>
                  </div>
                  <div className="message-item__actions">
                    <button className="message-item__action-btn" onClick={() => onEditDraft(draft)} title="Edit">
                      <FiSend size={16} />
                    </button>
                    <button className="message-item__action-btn message-item__action-btn--danger" onClick={() => onDeleteDraft(draft.id)} title="Delete">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Thread list for inbox / sent / deleted */}
        {activeTab !== 'drafts' && (
          <div className="messages-list">
            {isLoading ? (
              <p className="messages-list__empty">Ladataan viestejä...</p>
            ) : error ? (
              <p className="messages-list__error">{error}</p>
            ) : threads.length === 0 ? (
              <p className="messages-list__empty">
                {activeTab === 'inbox' && 'Ei saapuneita viestejä.'}
                {activeTab === 'sent' && 'Ei lähetettyjä viestejä.'}
                {activeTab === 'deleted' && 'Ei poistettuja viestejä.'}
              </p>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`message-item ${thread.unreadCount > 0 ? 'message-item--unread' : ''}`}
                >
                  <button
                    className="message-item__clickable"
                    onClick={() => onOpenConversation(thread)}
                  >
                    <div className="message-item__avatar">
                      <FiMessageSquare size={24} />
                    </div>
                    <div className="message-item__content">
                      <div className="message-item__header">
                        <span className="message-item__name">{thread.otherUser.username}</span>
                        <span className="message-item__time">
                          {formatDate(thread.lastMessageAt)}
                        </span>
                      </div>
                      <p className="message-item__preview">{thread.lastMessage}</p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="message-item__badge">{thread.unreadCount}</span>
                    )}
                  </button>
                  <div className="message-item__actions">
                    {activeTab === 'deleted' ? (
                      <button className="message-item__action-btn" onClick={() => onRestoreThread(thread)} title="Restore">
                        <FiRotateCcw size={16} />
                      </button>
                    ) : (
                      <button className="message-item__action-btn message-item__action-btn--danger" onClick={() => onDeleteThread(thread)} title="Delete">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="messages-page">
      {/* Centered page header */}
      <h1 className="messages-page__header">Viestit</h1>

      {/* Sidebar + Content below header */}
      <div className="messages-page__body">
        {/* Left sidebar: tabs */}
        <aside className="msg-sidebar">
          <nav className="msg-tabs">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                className={`msg-tabs__btn ${activeTab === tab.key ? 'msg-tabs__btn--active' : 'msg-tabs__btn--inactive'}`}
                onClick={() => onSwitchTab(tab.key)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right content panel */}
        {renderContent()}
      </div>
    </div>
  );
};

export default MessagesComp;