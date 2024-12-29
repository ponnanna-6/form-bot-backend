const mongoose = require('mongoose');

const FormSchema = mongoose.Schema({
    name: { type: String, required: true },
    data: Schema.Types.Mixed,
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    folder: { type: Schema.Types.ObjectId, ref: 'Folder', required: true },
    viewCount: { type: Number, default: 0 },
    submitCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const FormModel = mongoose.model('Form', FormSchema);

module.exports = FormModel;