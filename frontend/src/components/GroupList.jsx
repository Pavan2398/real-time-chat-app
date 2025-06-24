// GroupList.jsx


const GroupList = ({ groups, onSelectGroup, selectedGroupId }) => {
  return (
    <div className="bg-chat-dark p-4 border-b border-chat-medium">
      <h3 className="text-chat-text text-lg font-semibold mb-2">Your Groups</h3>
      {groups.length === 0 && <p className="text-chat-muted">No groups created yet.</p>}
      <ul className="space-y-2">
        {groups.map((group) => (
          <li
            key={group._id}
            className={`p-2 rounded-lg cursor-pointer ${
              selectedGroupId === group._id ? 'bg-blue-600 text-white' : 'text-chat-text'
            } hover:bg-blue-700`}
            onClick={() => onSelectGroup(group)}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
