const express = require('express');
const router = express.Router();
const Folder = require('../schemas/folder.schema');
const Workspace = require('../schemas/workspace.schema');
const { authMiddleware } = require('../middlewares/auth');

// Get all folders for a workspace
router.get('/:workspaceId', authMiddleware,async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const folders = await Folder.find({ workspace: workspaceId });

        if (!folders || folders.length === 0) {
            return res.status(404).json({ message: "No folders found for this workspace." });
        }

        return res.status(200).json({ folders });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while fetching folders.", error: error.message });
    }
});

// Create a new folder
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { workspaceId, name } = req.body;

        if (!workspaceId || !name) {
            return res.status(400).json({ message: "Workspace ID and folder name are required." });
        }

        const workspace = await Workspace.findById(workspaceId);
        
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found." });
        }
        
        //folder with same name cannot exist
        const folderExists = await Folder.findOne({ workspace: workspaceId, name });
        if (folderExists) {
            return res.status(400).json({ message: "Folder with the same name already exists." });
        }

        const newFolder = new Folder({ workspace: workspaceId, name });
        await newFolder.save();

        workspace.folders.push(newFolder._id);
        await workspace.save();

        return res.status(200).json({ message: "Folder created successfully.", folder: newFolder });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while creating the folder.", error: error.message });
    }
});

// Get a folder
router.get('/id/:folderId', authMiddleware, async (req, res) => {
    try {
        const { folderId } = req.params;

        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found." });
        }

        return res.status(200).json({ folder });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while deleting the folder.", error: error.message });
    }
});

// Delete a folder
router.delete('/:folderId', authMiddleware, async (req, res) => {
    try {
        const { folderId } = req.params;

        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found." });
        }

        await Folder.deleteOne({ _id: folderId });
        return res.status(200).json({ message: "Folder deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while deleting the folder.", error: error.message });
    }
});

module.exports = router;
