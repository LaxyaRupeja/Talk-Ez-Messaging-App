const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    isGroup: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String,
        default: ''
    },
    privacy: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
