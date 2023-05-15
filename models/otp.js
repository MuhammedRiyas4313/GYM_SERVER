const mongoose = require('mongoose')

const OTPVerificationSchema = mongoose.Schema({
    userId: {
        type: String,
    },
    otp: {
        type: String,
    },
    createdAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    },
}) 

module.exports = Otp = mongoose.model('otp', OTPVerificationSchema );