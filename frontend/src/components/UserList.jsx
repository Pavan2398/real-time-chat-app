

import { useState } from 'react';
import CreateGroupForm from './CreateGroupForm';
import GroupList from './GroupList'; // ✅ Add this import

const UserList = ({ users, currentUser, onUserSelect, onlineUsers, currentUserId, allUsers, onGroupCreated, groups, selectedGroupId, onSelectGroup }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-chat-medium bg-chat-dark flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-chat-text">Messages</h2>
          <p className="text-sm text-chat-muted">{onlineUsers.length} online</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="text-blue-400 text-xl font-bold hover:text-blue-500"
        >
          +
        </button>
      </div>

      {/* Current User */}
      <div className="p-4 border-b border-chat-medium bg-chat-dark">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={`https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-chat-dark ${getStatusColor('online')}`}></div>
          </div>
          <div className="flex-1">
            <p className="font-medium text-chat-text">{currentUser.name}</p>
            <p className="text-sm text-chat-muted">Online</p>
          </div>
        </div>
      </div>

      {/* Scrollable Section for Users + Groups */}
      <div className="flex-1 overflow-y-auto bg-chat-dark">
        <div className="p-2">
          {/* Users List */}
          {users.map((user) => {
            const id = user._id || user.id;
            const isOnline = isUserOnline(id);
            return (
              <div
                key={id}
                onClick={() => onUserSelect(user)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-chat-medium cursor-pointer transition-colors duration-200"
              >
                <div className="relative">
                  <img
                    src={user.avatar || 'https://i.pravatar.cc/150?img=1'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-chat-dark ${getStatusColor(isOnline ? 'online' : 'offline')}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-chat-text truncate">{user.name}</p>
                    <span className="text-xs text-chat-muted">{isOnline ? 'Online' : user.lastSeen}</span>
                  </div>
                  <p className="text-sm text-chat-muted truncate">{user.lastMessage || ''}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ Add GroupList directly below users */}
        <GroupList
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={onSelectGroup}
        />
      </div>

      {/* Modal for Create Group */}
      {showCreateForm && (
        <CreateGroupForm
          currentUser={currentUser}
          users={allUsers}
          onGroupCreated={(group) => {
            onGroupCreated(group);
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </>
  );
};

export default UserList;
