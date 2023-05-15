const mongoose = require('mongoose')

const TrainerSchema = mongoose.Schema({
    fname: {
        type: String,
        trim: true,
        required: true
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
    courses:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }],
    password: {
        type: String,
        trim: true,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    address: [{
        name: { type: String },
        mobile: { type: Number },
        address: { type: String },
        country: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String }
    }],
    profile: {
        type: String,
        default: null,
    },
    certificate: {
        type: String,
        dafault: null,
    },
    link: {
        type: String,
        default: null,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    wallet: {
        type: Number,
        trim: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    }
}, { timestamps: true })

module.exports = Trainer = mongoose.model('Trainer', TrainerSchema)
