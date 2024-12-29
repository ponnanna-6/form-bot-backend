const mongoose = require('mongoose');

const WorkspaceSchema = mongoose.Schema({
    owner: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    folders: [{ type: mongoose.Schema.ObjectId, ref: 'Folder' }],
    sharedWith: [
        {
            user: { type: mongoose.Schema.ObjectId, ref: 'User' },
            accessType: { type: String, enum: ['view', 'edit'], required: true },
        },
    ],
});

const WorkspaceModel = mongoose.model('Workspace', WorkspaceSchema);

module.exports = WorkspaceModel