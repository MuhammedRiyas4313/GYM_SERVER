const mongoose = require("mongoose");

const CourseSchema = mongoose.Schema(
  {
    coursename: {
      type: String,
      trim: true,
      required: true,
    },
   status:{
    type:String,
    default:'Active'
   },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
    },
    clients: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        joined: {
          type: String,
        },
        status: {
          type:String,
          default:'Active'
        },
        paymentStatus: Boolean,
        bookedSlote: String,
        emergencyContact: Number,
        healthInfo: String,
        updations: [
          {
            month: String,
            weight: Number,
            height: Number,
            paymentDetails: Object,
          },
        ],
        attendance: [
          {
            date: String,
            status: {
              type: String,
            },
            reason: {
              type: String,
            },
          },
        ],
      },
    ],
    availableSlots: [
      {
        status: {
          type: String,
          default: "free",
        },
        slote: {
          type: String,
          default: "05:00am-06:00am",
        },
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        joined: {
          type: String,
        },
      },
      {
        status: {
          type: String,
          default: "free",
        },
        slote: {
          type: String,
          default: "06:30am-07:30am",
        },
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        joined: {
          type: Date,
        },
      },
      {
        status: {
          type: String,
          default: "free",
        },
        slote: {
          type: String,
          default: "08:00am-09:00am",
        },
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        joined: {
          type: Date,
        },
      },
      {
        status: {
          type: String,
          default: "free",
        },
        slote: {
          type: String,
          default: "05:00pm-06:00pm",
        },
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        joined: {
          type: Date,
        },
      },
      {
        status: {
          type: String,
          default: "free",
        },
        slote: {
          type: String,
          default: "06:30pm-07:30pm",
        },
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        joined: {
          type: Date,
        },
      },
      {
        status: {
          type: String,
          default: "free",
        },
        slote: {
          type: String,
          default: "06:30pm-07:30pm",
        },
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        joined: {
          type: Date,
        },
      },
    ],
    charge: {
      type: Number,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    cover1: {
      type: String,
    },
    cover2: {
      type: String,
    },
    introVideo: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = Course = mongoose.model("Course", CourseSchema);
