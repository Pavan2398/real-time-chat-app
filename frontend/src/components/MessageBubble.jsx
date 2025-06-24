

const MessageBubble = ({ message, isCurrentUser }) => {
   const plainText = typeof message.text === 'string' 
    ? message.text 
    : message.text?.text || '[Invalid message]';
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          isCurrentUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-chat-medium text-chat-text rounded-bl-md'
        }`}
      >
        {plainText}
      </div>
    </div>
  );
};

export default MessageBubble;
