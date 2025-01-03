const express = require('express');
const router = express.Router();
const Workspace = require('../schemas/workspace.schema');
const User = require('../schemas/user.schema');
const { authMiddleware } = require('../middlewares/auth');
const jwt = require('jsonwebtoken');

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

//GET workspace by id
router.get('/id/:workspaceId', authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found." });
        }
        return res.status(200).json({ workspace });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while fetching workspace.", error: error.message });
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

// Generate shareable link route
router.post('/share/generate-link', authMiddleware, async (req, res) => {
    try {
        const userId = req.user;
        const {accessType } = req.body;
        
        const workspace = await Workspace.find({ owner: userId });
        if (!workspace || workspace.length === 0) {
            return res.status(404).json({ message: "No workspaces found for this user." });
        }
        const workspaceId = workspace[0]._id;

        if (!['view', 'edit'].includes(accessType)) {
            return res.status(400).json({ message: "Workspace ID and valid access type are required." });
        }

        // Generate a token (JWT) with workspace and access details
        const token = jwt.sign(
            { workspaceId, accessType, sharedBy: userId },
            process.env.JWT_TOKEN,
            { expiresIn: '7d' }
        );

        const shareableLink = `${process.env.CLIENT_BASE_URL}/workspace?token=${token}`;
        return res.status(200).json({ link: shareableLink });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while generating the link." });
    }
});

router.post('/share/join', authMiddleware, async (req, res) => {
    try {
        const userId = req.user;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token is required." });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        const { workspaceId, accessType, sharedBy } = decoded;

        // Check if workspace exists
        const workspace = await Workspace.findOne({ _id: workspaceId });
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found." });
        }
        
        if (workspace.sharedWith && Array.isArray(workspace.sharedWith)) {
            workspace.sharedWith.push({ user: userId, accessType: accessType });
        } else {
            workspace.sharedWith = [{ user: userId, accessType: accessType }];
        }
        await workspace.save();

        return res.status(200).json({ message: "Access granted successfully.", workspace });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while joining the workspace.", error: error.message });
    }
});


module.exports = router;