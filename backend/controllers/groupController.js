const Group = require('../models/Group');

// Create group
exports.createGroup = async (req, res) => {
  const { name, members } = req.body; // members: [userIds]
  const creator = req.user._id;
  try {
    const group = await Group.create({ name, members: [...members, creator], createdBy: creator });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List user's groups
exports.getMyGroups = async (req, res) => {
  const userId = req.user.id;
  const groups = await Group.find({ members: userId });
  res.json(groups);
};
exports.getGroupsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await Group.find({ members: userId });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
