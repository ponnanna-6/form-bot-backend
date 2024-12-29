const express = require('express');
const router = express.Router();
const Workspace = require('../schemas/workspace.schema');
const User = require('../schemas/user.schema');
const { authMiddleware } = require('../middlewares/auth');

// Get all workspaces for a user
router.get('/:userId', authMiddleware ,async (req, res) => {
    try {
        const { userId } = req.params;

        // Find workspaces owned by or shared with the user
        const workspaces = await Workspace.find({
            $or: [
                { owner: userId },
                { 'sharedWith.user': userId }
            ]
        })

        if (!workspaces || workspaces.length === 0) {
            return res.status(404).json({ message: "No workspaces found for this user." });
        }

        return res.status(200).json({ workspaces });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while fetching workspaces.", error: error.message });
    }
});

// Share a workspace with another user
router.post('/share', authMiddleware, async (req, res) => {
    try {
        const { workspaceId, userId, accessType } = req.body;

        if (!workspaceId || !userId || !accessType) {
            return res.status(400).json({ message: "Workspace ID, User ID, and Access Type are required." });
        }

        // Validate access type
        if (!['view', 'edit'].includes(accessType)) {
            return res.status(400).json({ message: "Invalid access type. Must be 'view' or 'edit'." });
        }

        // Check if workspace exists
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found." });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the user is already shared with
        const alreadyShared = workspace.sharedWith.some(
            (sharedUser) => sharedUser.user.toString() === userId
        );

        if (alreadyShared) {
            return res.status(400).json({ message: "User already has access to this workspace." });
        }

        // Add user to sharedWith array
        workspace.sharedWith.push({ user: userId, accessType });
        await workspace.save();

        return res.status(200).json({ message: "Workspace shared successfully.", workspace });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while sharing the workspace.", error: error.message });
    }
});

module.exports = router;