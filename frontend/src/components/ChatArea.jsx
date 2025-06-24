import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import socket from '../socket';
const avatarList = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=6",
  "https://i.pravatar.cc/150?img=7",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=9",
  "https://i.pravatar.cc/150?img=10"
];

const getRandomAvatar = () => {
  return avatarList[Math.floor(Math.random() * avatarList.length)];
};
const ChatArea = ({ selectedUser, messages, onSendMessage, currentUser, setMessages, onlineUsers, selectedGroup }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isSelectedUserOnline = () => {
    const id = selectedUser?.id || selectedUser?._id;
    return onlineUsers?.includes(id);
  };
  useEffect(() => {
    if (selectedGroup) {
      socket.emit('joinGroup', selectedGroup._id);
    }
  }, [selectedGroup]);
  // Emit typing event
  const emitTyping = () => {
    if (!currentUser || !selectedUser) return;

    socket.emit('typing', {
      from: currentUser.id || currentUser._id,
      to: selectedUser.id || selectedUser._id,
    });
  };

  useEffect(() => {
    const id = currentUser?.id || currentUser?._id;
    if (id) {
      socket.emit('join', id);
    }
  }, [currentUser]);

  // Fetch messages
  // useEffect(() => {
  //   const fetchChatHistory = async () => {
  //     if (!selectedUser || !currentUser) return;

  //     const senderId = currentUser.id || currentUser._id;
  //     const receiverId = selectedUser.id || selectedUser._id;

  //     try {
  //       const res = await fetch(`http://localhost:5000/api/messages/history/${senderId}/${receiverId}`);
  //       const data = await res.json();
  //       if (Array.isArray(data)) {
  //         setMessages(data);
  //       } else {
  //         setMessages([]);
  //       }
  //     } catch (err) {
  //       console.error('❌ Error fetching messages:', err);
  //       setMessages([]);
  //     }
  //   };

  //   fetchChatHistory();
  // }, [selectedUser, currentUser, setMessages]);
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!currentUser) return;

      const senderId = currentUser.id || currentUser._id;

      if (selectedUser) {
        const receiverId = selectedUser.id || selectedUser._id;
        const res = await fetch(`http://localhost:5000/api/messages/history/${senderId}/${receiverId}`);
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } else if (selectedGroup) {
        const res = await fetch(`http://localhost:5000/api/messages/group/${selectedGroup._id}`);
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    };

    fetchChatHistory();
  }, [selectedUser, selectedGroup, currentUser, setMessages]);
  useEffect(() => {
    const handleGroupReceive = (message) => {
      if (message.groupId === selectedGroup?._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('receiveGroupMessage', handleGroupReceive);

    return () => {
      socket.off('receiveGroupMessage', handleGroupReceive);
    };
  }, [selectedGroup]);

  useEffect(() => {
    const handleReceive = (message) => {
      if (!message || typeof message !== 'object') return;

      if (typeof message.text !== 'string' && typeof message.text?.text === 'string') {
        message = { ...message, ...message.text };
      }

      const currentId = currentUser.id || currentUser._id;
      const selectedId = selectedUser?.id || selectedUser?._id;

      if (
        message.senderId === currentId ||
        ![selectedId].includes(message.senderId)
      ) {
        return;
      }

      setMessages(prev => [...prev, message]);
    };

    socket.on('receiveMessage', handleReceive);

    const handleUserTyping = ({ from }) => {
      const selectedId = selectedUser?.id || selectedUser?._id;
      if (from === selectedId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    };

    socket.on('userTyping', handleUserTyping);

    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.off('userTyping', handleUserTyping);
    };
  }, [currentUser, selectedUser, setMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || (!selectedUser && !selectedGroup)) return;

    const senderId = currentUser.id || currentUser._id;

    if (selectedUser) {
      const receiverId = selectedUser.id || selectedUser._id;

      const message = {
        senderId,
        receiverId,
        text,
        timestamp: new Date().toISOString(),
        senderName: currentUser.username,
        senderAvatar: currentUser.avatar,
        status: 'sent',
      };

      socket.emit('sendMessage', message);
      setMessages((prev) => [...prev, message]);
    } else if (selectedGroup) {
      const message = {
        groupId: selectedGroup._id,
        senderId,
        text,
        timestamp: new Date().toISOString(),
        senderName: currentUser.username,
        senderAvatar: currentUser.avatar,
      };

      socket.emit('sendGroupMessage', message);
      // setMessages((prev) => [...prev, message]);
    }

    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    emitTyping();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'a while ago';
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 60000); // in minutes
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} minute${diff > 1 ? 's' : ''} ago`;
    const hours = Math.floor(diff / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  if (!selectedUser && !selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-black">
        <div className="text-center">
          <h3 className="text-xl font-medium text-chat-text mb-2">Select a conversation</h3>
          <p className="text-chat-muted">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-black">
      {/* Header */}
      {/* <div className="p-4 border-b border-chat-medium bg-chat-dark">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-chat-dark ${getStatusColor(isSelectedUserOnline() ? 'online' : 'offline')}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-chat-text">{selectedUser.name}</h3>
            <p className="text-sm text-chat-muted">
              {isSelectedUserOnline()
                ? (isTyping ? 'Typing...' : 'Active now')
                : `Last seen ${formatLastSeen(selectedUser.lastSeen)}`}
            </p>
          </div>
        </div>
      </div> */}
      {/* Header */}
      <div className="p-4 border-b border-chat-medium bg-chat-dark">
        <div className="flex items-center space-x-3">
          {selectedUser ? (
            <>
              <div className="relative">
                <img
                  // src={selectedUser.avatar}
                  // alt={selectedUser.name}
                  src={selectedUser?.avatar || 'https://i.pravatar.cc/150?img=1'}
                  alt={selectedUser?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-chat-dark ${getStatusColor(
                    isSelectedUserOnline() ? 'online' : 'offline'
                  )}`}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-chat-text">{selectedUser.name}</h3>
                <p className="text-sm text-chat-muted">
                  {isSelectedUserOnline()
                    ? isTyping
                      ? 'Typing...'
                      : 'Active now'
                    : `Last seen ${formatLastSeen(selectedUser.lastSeen)}`}
                </p>
              </div>
            </>
          ) : selectedGroup ? (
            <>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg font-bold">
                  {selectedGroup.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-chat-text">{selectedGroup.name}</h3>
                <p className="text-sm text-chat-muted">Group chat</p>
              </div>
            </>
          ) : null}
        </div>
      </div>


      {/* Message list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {Array.isArray(messages) && messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            isCurrentUser={message.senderId === (currentUser.id || currentUser._id)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-chat-medium bg-chat-dark">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              // placeholder={`Message ${selectedUser.name}...`}
              placeholder={`Message ${selectedGroup ? selectedGroup.name : selectedUser.name}...`}
              className="w-full bg-chat-medium text-chat-text placeholder-chat-muted rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all max-h-32"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-chat-medium disabled:text-chat-muted text-white rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
