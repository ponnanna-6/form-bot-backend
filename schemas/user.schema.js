const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    workspaces: [{ type: mongoose.Schema.ObjectId, ref: 'Workspace'}],
})

const UserModel = mongoose.model('User', userSchema)

module.exports = UserModel