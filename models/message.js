const mongoose = require('mongoose')

const MessageSchema = mongoose.Schema( {
    conversationId: {
        type: String
    },
    sender: {
        type: String,
    },
    text: {
        type: String,
    },
}, {
timestamps: true,
})

module.exports =  Message = mongoose.model('Message', MessageSchema);