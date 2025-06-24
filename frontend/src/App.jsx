
import { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from './components/NavBar';
import UserList from './components/UserList';
import ChatArea from './components/ChatArea';
import AuthForm from './components/AuthForm';
import socket from './socket';
import GroupList from './components/GroupList';
import CreateGroupForm from './components/CreateGroupForm';


function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  useEffect(() => {
    const fetchGroups = async () => {
      if (!currentUser) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/groups/user/${currentUser.id}`);
        setGroups(res.data);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };

    fetchGroups();
  }, [currentUser]);
  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [...prev, newGroup]);
  };


  // Load user from localStorage if present
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      socket.connect();
      socket.emit('join', parsedUser.id || parsedUser._id);
    }
  }, []);

  // Fetch users once currentUser is set
  useEffect(() => {
    if (currentUser) {
      axios
        .get(`http://localhost:5000/api/users/${currentUser.id}/others`)
        .then((res) => {
          const others = res.data.filter((u) => u._id !== currentUser.id);
          setUsers(others);
        })
        .catch((err) => console.error('Error fetching users:', err));
    }
  }, [currentUser]);

  // Socket events
  useEffect(() => {
    socket.on('onlineUsers', (ids) => setOnlineUsers(ids));
    socket.on('lastSeenUpdate', ({ userId, lastSeen }) => {
      setLastSeenMap((prev) => ({ ...prev, [userId]: lastSeen }));
    });
    socket.on('userTyping', ({ from }) => {
      setTypingUsers((prev) => ({ ...prev, [from]: true }));
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[from];
          return updated;
        });
      }, 2000);
    });

    return () => {
      socket.off('onlineUsers');
      socket.off('lastSeenUpdate');
      socket.off('userTyping');
    };
  }, []);

  const handleUserSelect = (user) => setSelectedUser(user);

  // const handleSendMessage = (messageText) => {
  //   if (!currentUser || !selectedUser) return;

  //   const newMessage = {
  //     id: Date.now(),
  //     text: messageText,
  //     senderId: currentUser.id,
  //     receiverId: selectedUser._id,
  //     senderName: currentUser.name,
  //     senderAvatar: currentUser.avatar,
  //     timestamp: Date.now(),
  //     status: 'sent',
  //   };

  //   setMessages((prev) => [...prev, newMessage]);
  //   socket.emit('sendMessage', newMessage);
  // };
  const handleSendMessage = (messageText) => {
    if (!currentUser) return;

    const timestamp = new Date().toISOString();
    const message = {
      text: messageText,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp,
      status: 'sent',
    };

    if (selectedGroup) {
      message.groupId = selectedGroup._id;
      message.chatType = 'group';
      socket.emit('groupMessage', message);
    } else if (selectedUser) {
      message.receiverId = selectedUser._id;
      message.chatType = 'private';
      socket.emit('sendMessage', message);
    }

    setMessages((prev) => [...prev, message]);
  };


  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    socket.connect();
    socket.emit('join', userData.id || userData._id);
    setShowAuthForm(false);
  };

  const handleLoginClick = () => setShowAuthForm(true);

  const handleLogout = () => {
    if (currentUser?.id || currentUser?._id) {
      socket.emit('logout', currentUser.id || currentUser._id);
    }
    socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setSelectedUser(null);
    setUsers([]);
    setMessages([]);
  };

  const handleCloseAuth = () => setShowAuthForm(false);

  return (
    <div className="h-screen flex flex-col bg-chat-black">
      <NavBar user={currentUser} onLoginClick={handleLoginClick} onLogout={handleLogout} />

      <div className="flex-1 flex overflow-hidden">
        {currentUser ? (
          <>
            <div className="w-1/4 border-r border-chat-medium flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <UserList
                  users={users.map((user) => ({
                    ...user,
                    status: onlineUsers.includes(user._id) ? 'online' : 'offline',
                    lastSeen: lastSeenMap[user._id],
                    isTyping: typingUsers[user._id] || false,
                  }))}
                  currentUser={currentUser}
                  onUserSelect={handleUserSelect}
                  onlineUsers={onlineUsers}
                  currentUserId={currentUser.id}
                  allUsers={users}
                  onGroupCreated={handleGroupCreated}
                  groups={groups}
                  selectedGroupId={selectedGroup?._id}
                  onSelectGroup={(group) => {
                    setSelectedGroup(group);
                    setSelectedUser(null);
                    socket.emit('join-group', group._id); // if needed
                  }}
                />
              </div>
              {/* <div className="border-t border-chat-medium">
                <GroupList
                  groups={groups}
                  selectedGroupId={selectedGroup?._id}
                  onSelectGroup={(group) => {
                    setSelectedGroup(group);
                    setSelectedUser(null);
                  }}
                />
              </div> */}

              {/* <CreateGroupForm
                currentUser={currentUser}
                users={users}
                onGroupCreated={handleGroupCreated}
              /> */}
            </div>

            <ChatArea
              selectedUser={
                selectedUser
                  ? {
                    ...selectedUser,
                    status: onlineUsers.includes(selectedUser._id) ? 'online' : 'offline',
                    lastSeen: lastSeenMap[selectedUser._id],
                    isTyping: typingUsers[selectedUser._id] || false,
                  }
                  : null
              }
              messages={
                selectedUser
                  ? messages.filter(
                    (msg) =>
                      (msg.senderId === selectedUser._id &&
                        msg.receiverId === currentUser.id) ||
                      (msg.senderId === currentUser.id &&
                        msg.receiverId === selectedUser._id)
                  ) : selectedGroup
                    ? messages.filter((msg) => msg.groupId === selectedGroup._id)
                    : []
              }
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
              setMessages={setMessages}
              onlineUsers={onlineUsers}
              selectedGroup={selectedGroup}
              chatType={selectedGroup ? 'group' : 'private'}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.518 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-chat-text mb-4">Welcome to ChatApp</h2>
              <p className="text-chat-muted mb-8 max-w-md">
                Connect with friends and family instantly. Sign in to start chatting or create a new account to get started.
              </p>
              <button
                onClick={handleLoginClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Get Started</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showAuthForm && (
        <AuthForm onAuthSuccess={handleAuthSuccess} onClose={handleCloseAuth} />
      )}
    </div>
  );
}

export default App;
