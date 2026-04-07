import useMessages from '../hooks/useMessages';
import MessagesComp from '../components/Messages';

const MessagesPage: React.FC = () => {
  const {
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
    sendMessage,
    saveDraft,
    deleteDraft,
    editDraft,
    updateInput,
    updateNewRecipient,
    formatDate,
  } = useMessages();

  return (
    <MessagesComp
      user={user}
      activeTab={activeTab}
      threads={threads}
      drafts={drafts}
      openThread={openThread}
      messages={messages}
      input={input}
      newRecipient={newRecipient}
      isLoading={isLoading}
      error={error}
      onSwitchTab={switchTab}
      onOpenConversation={openConversation}
      onCloseConversation={closeConversation}
      onDeleteThread={deleteThread}
      onRestoreThread={restoreThread}
      onSendMessage={sendMessage}
      onSaveDraft={saveDraft}
      onDeleteDraft={deleteDraft}
      onEditDraft={editDraft}
      onInputChange={updateInput}
      onNewRecipientChange={updateNewRecipient}
      formatDate={formatDate}
    />
  );
};

export default MessagesPage;
