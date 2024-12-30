const mongoose = require('mongoose');

const FormSchema = mongoose.Schema({
    name: { type: String, required: true },
    formData: {type: mongoose.Schema.Types.Mixed, default: []},
    formResponse:{type: [mongoose.Schema.Types.Mixed]},
    workspace: { type: mongoose.Schema.ObjectId, ref: 'Workspace', required: true },
    folder: { type: mongoose.Schema.ObjectId, ref: 'Folder'},
    viewCount: { type: Number, default: 0 },
    submitCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
});

const FormModel = mongoose.model('Form', FormSchema);

module.exports = FormModel;