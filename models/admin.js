const mongoose = require('mongoose')

const AdminSchema = mongoose.Schema({

    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
}, { timestamps: true })

module.exports =  Admin = mongoose.model('Admin', AdminSchema);
