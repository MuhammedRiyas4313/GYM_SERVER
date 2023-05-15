const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({

    fname: {
        type: String,
        trim: true,
        required: true,
    },
    dob: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
    },
    phone: {
        type: Number,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    profile: {
        type: String,
        default: null,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    address: [{
        address: { type: String },
        country: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String }
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    wallet: {
        type: Number,
        trim: true
    },
    courses: [{
       course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
       }
    }]
}, { timestamps: true })


module.exports = User = mongoose.model('user', UserSchema);