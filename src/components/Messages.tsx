// Pure presentational component — all logic lives in useMessages hook
import React from 'react';
import {
  FiArrowLeft,
  FiFile,
  FiInbox,
  FiMessageSquare,
  FiNavigation,
  FiRotateCcw,
  FiSend,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { FaPencilAlt } from 'react-icons/fa';
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
  isComposeOpen: boolean;
  isLoading?: boolean;
  error?: string | null;
  onSwitchTab: (tab: MessageTab) => void;
  onOpenConversation: (thread: MessageThread) => void;
  onCloseConversation: () => void;
  onDeleteThread: (thread: MessageThread) => void;
  onRestoreThread: (thread: MessageThread) => void;
  onOpenCompose: () => void;
  onCloseCompose: () => void;
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
  isComposeOpen,
  isLoading,
  error,
  onSwitchTab,
  onOpenConversation,
  onCloseConversation,
  onDeleteThread,
  onRestoreThread,
  onOpenCompose,
  onCloseCompose,
  onSendMessage,
  onSaveDraft,
  onDeleteDraft,
  onEditDraft,
  onInputChange,
  onNewRecipientChange,
  formatDate,
}) => {
  const showComposeButton = activeTab === 'inbox' || activeTab === 'sent';

  const renderComposeModal = () => {
    if (!isComposeOpen) {
      return null;
    }

    return (
      <div className="compose-modal-overlay" onClick={onCloseCompose}>
        <div className="compose-modal" onClick={(event) => event.stopPropagation()}>
          <div className="compose-modal__header">
            <div>
              <p className="compose-modal__eyebrow">Kirjoittaa uusi viesti</p>
              <h3 className="compose-modal__title">Uusi viesti</h3>
            </div>
            <button
              type="button"
              className="compose-modal__close"
              onClick={onCloseCompose}
              aria-label="Close compose popup"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="compose-section">
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
                  type="button"
                  className="chat-input__send"
                  onClick={onSendMessage}
                  disabled={!input.trim() || !newRecipient.trim()}
                >
                  <FiSend size={20} />
                </button>
                <button
                  type="button"
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
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (openThread) {
      return (
        <div className="msg-content msg-content--chat">
          <div className="chat-header">
            <button type="button" className="chat-header__back" onClick={onCloseConversation}>
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
            <button type="button" className="chat-input__send" onClick={onSendMessage} disabled={!input.trim()}>
              <FiSend size={20} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="msg-content">
        {showComposeButton && (
          <div className="compose-launch">
            <button type="button" className="compose-launch__btn" onClick={onOpenCompose}>
              <FaPencilAlt size={14} />
              Kirjoittaa uusi viesti
            </button>
          </div>
        )}

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
                    <button type="button" className="message-item__action-btn" onClick={() => onEditDraft(draft)} title="Edit">
                      <FiSend size={16} />
                    </button>
                    <button
                      type="button"
                      className="message-item__action-btn message-item__action-btn--danger"
                      onClick={() => onDeleteDraft(draft.id)}
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
                    type="button"
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
                      <button type="button" className="message-item__action-btn" onClick={() => onRestoreThread(thread)} title="Restore">
                        <FiRotateCcw size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="message-item__action-btn message-item__action-btn--danger"
                        onClick={() => onDeleteThread(thread)}
                        title="Delete"
                      >
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
      <h1 className="messages-page__header">Viestit</h1>

      <div className="messages-page__body">
        <aside className="msg-sidebar">
          <nav className="msg-tabs">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`msg-tabs__btn ${activeTab === tab.key ? 'msg-tabs__btn--active' : 'msg-tabs__btn--inactive'}`}
                onClick={() => onSwitchTab(tab.key)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {renderContent()}
      </div>

      {renderComposeModal()}
    </div>
  );
};

export default MessagesComp;
