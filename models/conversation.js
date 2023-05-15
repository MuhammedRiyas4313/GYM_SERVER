const mongoose = require('mongoose')

const ConversationSchema = mongoose.Schema({
    members: {
        type: Array,
    },
}, {
    timestamps: true
})

module.exports =  Conversation = mongoose.model('Conversation', ConversationSchema);