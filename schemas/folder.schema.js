const mongoose = require('mongoose');

const FolderSchema = mongoose.Schema({
    name: { type: String, required: true },
    forms: [{ type: mongoose.Schema.ObjectId, ref: 'Form' }],
    workspace: { type: mongoose.Schema.ObjectId, ref: 'Workspace', required: true },
});

const FolderModel = mongoose.model('Folder', FolderSchema);

module.exports = FolderModel;