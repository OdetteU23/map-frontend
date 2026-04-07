import { useState, useEffect, useCallback } from 'react';
import type { MessageThread } from '../helpers/types/localTypes';
import { isUser } from '../helpers/types/localTypes';
import { useAuth } from '../context/AuthContext';
import { api } from '../helpers/data/fetchData';
import type { Message } from 'map-hybrid-types-server';

type ChatMessage = { id: number; from: 'me' | 'them'; text: string; time: string };
type MessageTab = 'inbox' | 'sent' | 'drafts' | 'deleted';
type Draft = { id: number; recipientId: string; content: string; updatedAt: Date };

const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('fi-FI');

const buildThreads = (
  rawMessages: Message[],
  myId: number,
  filter: 'inbox' | 'sent',
  readIds: Set<number>,
): MessageThread[] => {
  const map = new Map<number | string, { otherUser: { id: number; username: string }; msgs: Message[] }>();

  const filtered = filter === 'inbox'
    ? rawMessages.filter((m) => m.receiver_id === myId)
    : rawMessages.filter((m) => m.sender_id === myId);

  for (const msg of filtered) {
    const otherId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
    const otherIdNum = typeof otherId === 'number' ? otherId : 0;
    if (!map.has(otherIdNum)) {
      map.set(otherIdNum, { otherUser: { id: otherIdNum, username: `User ${otherIdNum}` }, msgs: [] });
    }
    map.get(otherIdNum)!.msgs.push(msg);
  }

  return Array.from(map.entries()).map(([, { otherUser, msgs }]) => {
    const sorted = msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const unreadCount = filter === 'inbox'
      ? sorted.filter((m) => !readIds.has(m.id)).length
      : 0;
    return {
      id: sorted[0].id,
      otherUser,
      lastMessage: sorted[0].content,
      lastMessageAt: sorted[0].created_at,
      unreadCount,
    };
  });
};

const useMessages = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MessageTab>('inbox');
  const [openThread, setOpenThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [rawMessages, setRawMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState('');
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const myId = user && isUser(user) ? user.id : 0;
  const isLoading = status === 'idle' || status === 'loading';

  useEffect(() => {
    if (!user || !isUser(user) || !user.username) return;

    let cancelled = false;
    api.media.fetchMessages(user.username)
      .then((data) => {
        if (!cancelled) {
          setRawMessages(data);
          setStatus('done');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch messages:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Viestien haku epäonnistui');
          setStatus('error');
        }
      });
    return () => { cancelled = true; };
  }, [user, myId]);

  const activeMessages = rawMessages.filter((m) => !deletedIds.has(m.id));

  // Build threads for current tab
  const inboxThreads = buildThreads(activeMessages, myId, 'inbox', readIds);
  const sentThreads = buildThreads(activeMessages, myId, 'sent', readIds);

  // Deleted messages as threads
  const deletedMessages = rawMessages.filter((m) => deletedIds.has(m.id));
  const deletedThreads = buildThreads(deletedMessages, myId, 'inbox', readIds)
    .concat(buildThreads(deletedMessages, myId, 'sent', readIds));

  const threads =
    activeTab === 'inbox' ? inboxThreads :
    activeTab === 'sent' ? sentThreads :
    activeTab === 'deleted' ? deletedThreads :
    []; // drafts handled separately

  const switchTab = useCallback((tab: MessageTab) => {
    setActiveTab(tab);
    setOpenThread(null);
    setMessages([]);
  }, []);

  const openConversation = (thread: MessageThread) => {
    setOpenThread(thread);

    // Mark all messages in this thread as read
    const threadMsgIds = rawMessages
      .filter((m) =>
        (m.sender_id === thread.otherUser.id && m.receiver_id === myId) ||
        (m.sender_id === myId && m.receiver_id === thread.otherUser.id)
      )
      .map((m) => m.id);
    setReadIds((prev) => {
      const next = new Set(prev);
      threadMsgIds.forEach((id) => next.add(id));
      return next;
    });

    // Load conversation messages
    const convoMsgs = rawMessages
      .filter((m) =>
        (m.sender_id === thread.otherUser.id || m.receiver_id === thread.otherUser.id) &&
        (m.sender_id === myId || m.receiver_id === myId)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m) => ({
        id: m.id,
        from: (m.sender_id === myId ? 'me' : 'them') as 'me' | 'them',
        text: m.content,
        time: formatTime(m.created_at),
      }));
    setMessages(convoMsgs);
  };

  const closeConversation = () => {
    setOpenThread(null);
    setMessages([]);
  };

  const deleteThread = (thread: MessageThread) => {
    const threadMsgIds = rawMessages
      .filter((m) =>
        (m.sender_id === thread.otherUser.id && m.receiver_id === myId) ||
        (m.sender_id === myId && m.receiver_id === thread.otherUser.id)
      )
      .map((m) => m.id);
    setDeletedIds((prev) => {
      const next = new Set(prev);
      threadMsgIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const restoreThread = (thread: MessageThread) => {
    const threadMsgIds = rawMessages
      .filter((m) =>
        (m.sender_id === thread.otherUser.id && m.receiver_id === myId) ||
        (m.sender_id === myId && m.receiver_id === thread.otherUser.id)
      )
      .map((m) => m.id);
    setDeletedIds((prev) => {
      const next = new Set(prev);
      threadMsgIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  // Draft management
  const saveDraft = () => {
    if (!input.trim() || !newRecipient.trim()) return;
    const draft: Draft = {
      id: Date.now(),
      recipientId: newRecipient.trim(),
      content: input.trim(),
      updatedAt: new Date(),
    };
    setDrafts((prev) => [...prev, draft]);
    setInput('');
    setNewRecipient('');
  };

  const deleteDraft = (draftId: number) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const editDraft = (draft: Draft) => {
    setNewRecipient(draft.recipientId);
    setInput(draft.content);
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
    setActiveTab('inbox'); // switch to compose view
  };

  const sendMessage = () => {
    if (!input.trim() || !myId) return;

    if (openThread) {
      const newMsg: ChatMessage = {
        id: messages.length + 1,
        from: 'me',
        text: input.trim(),
        time: new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newMsg]);
      setInput('');
      api.media.sendMessage({
        sender_id: myId,
        receiver_id: openThread.otherUser.id,
        content: input.trim(),
      }).catch(console.error);
      return;
    }

    if (!newRecipient.trim()) return;
    const recipientId = parseInt(newRecipient.trim(), 10) || 0;
    const content = input.trim();
    setInput('');
    setNewRecipient('');
    api.media.sendMessage({
      sender_id: myId,
      receiver_id: recipientId,
      content,
    })
      .then(() => {
        const sentMsg: Message = {
          id: Date.now(),
          sender_id: myId,
          receiver_id: recipientId,
          content,
          created_at: new Date(),
        };
        setRawMessages((prev) => [...prev, sentMsg]);
      })
      .catch(console.error);
  };

  const updateInput = (value: string) => setInput(value);
  const updateNewRecipient = (value: string) => setNewRecipient(value);

  return {
    user,
    activeTab,
    threads,
    drafts,
    openThread,
    messages,
    input,
    newRecipient,
    isLoading,
    error,
    switchTab,
    openConversation,
    closeConversation,
    deleteThread,
    restoreThread,
    saveDraft,
    deleteDraft,
    editDraft,
    sendMessage,
    updateInput,
    updateNewRecipient,
    formatDate,
  };
};

export type { ChatMessage, MessageTab, Draft };
export default useMessages;
