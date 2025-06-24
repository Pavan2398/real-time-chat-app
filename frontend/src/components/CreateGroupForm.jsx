
import React, { useState } from 'react';
import axios from 'axios';
const CreateGroupForm = ({ currentUser, users, onGroupCreated, onCancel }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const handleCreateGroup = async (e) => {
  e.preventDefault();
  if (!groupName || selectedUserIds.length === 0) return;

  const memberIds = [currentUser.id, ...selectedUserIds];

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('JWT token not found in localStorage.');
    return;
  }

  try {
    const res = await axios.post(
      'http://localhost:5000/api/groups',
      {
        name: groupName,
        members: memberIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    onGroupCreated(res.data);
    setGroupName('');
    setSelectedUserIds([]);
  } catch (err) {
    console.error('Error creating group:', err);
  }
};

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] bg-chat-dark border border-chat-medium rounded-lg shadow-xl p-4 z-50">
      <h3 className="text-chat-text text-lg mb-2 font-medium">New Group</h3>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Group name"
        className="w-full mb-2 px-3 py-2 rounded bg-chat-medium text-chat-text focus:outline-none"
      />
      <div className="mb-2 max-h-40 overflow-y-auto">
        {users.map((user) => (
          <label key={user._id} className="flex items-center space-x-2 text-chat-text">
            <input
              type="checkbox"
              checked={selectedUserIds.includes(user._id)}
              onChange={() =>
                setSelectedUserIds((prev) =>
                  prev.includes(user._id)
                    ? prev.filter((id) => id !== user._id)
                    : [...prev, user._id]
                )
              }
            />
            <span>{user.name}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleCreateGroup}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create
        </button>
      </div>
    </div>
  );
};
export default CreateGroupForm;