const express = require('express');
const router = express.Router();
const Workspace = require('../schemas/workspace.schema');
const User = require('../schemas/user.schema');
const { authMiddleware } = require('../middlewares/auth');

// Get all workspaces for a user
router.get('/:userId', authMiddleware, async (req, res) => {
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
        const userId = req.user;
        const { email, accessType } = req.body;
        if (!email || !accessType) {
            return res.status(400).json({ message: "Workspace ID, User ID, and Access Type are required." });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Validate access type
        if (!['view', 'edit'].includes(accessType)) {
            return res.status(400).json({ message: "Invalid access type. Must be 'view' or 'edit'." });
        }

        // Check if workspace exists
        let workspace = await Workspace.findOne({ owner: userId });
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found." });
        }

        // Check if the user is already shared with
        if (workspace.sharedWith && Array.isArray(workspace.sharedWith)) {
            const alreadyShared = workspace.sharedWith.some(
                (sharedUser) => sharedUser.user.toString() === userId
            );

            if (alreadyShared) {
                return res.status(400).json({ message: "User already has access to this workspace." });
            }
            workspace.sharedWith.push({ user: user._id, accessType: accessType });
        } else {
            workspace.sharedWith = [{ user: user._id, accessType: accessType }];
        }

        console.log(workspace);
        await workspace.save();


        console.log(workspace)
        await workspace.save();
        return res.status(200).json({ message: "Workspace shared successfully.", workspace });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "An error occurred while sharing the workspace.", error: error.message });
    }
});

module.exports = router;