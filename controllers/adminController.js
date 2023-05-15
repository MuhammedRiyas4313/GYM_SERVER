const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Admin = require("../models/admin");
const Trainer = require("../models/trainer");
const User = require("../models/user");
const Conversation = require("../models/conversation");
const Wallet = require("../models/wallet");
const Course = require("../models/course");
const Transaction = require("../models/transactions");

const { ObjectId } = require("mongodb");
const moment = require("moment");

let transporter = nodemailer.createTransport({
  // true for 465, false for other ports
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_AUTHER, // generated ethereal user
    pass: process.env.NODEMAILER_AUTHER_PASSWORD, // generated ethereal password
  },
});

const adminLogin = async (req, res) => {
  console.log(req.body, "data from the front end admin login credential");
  try {
    const { email, password } = req.body;
    const oldAdmin = await Admin.findOne({ email });

    if (!oldAdmin) return res.json({ status: "Admin doesn't exist" });

    if (password !== oldAdmin.password)
      return res.json({ status: "Invalid Credentials" });

    const toke = jwt.sign(
      { email: oldAdmin.email, id: oldAdmin._id, role: "admin" },
      "admin_secret",
      { expiresIn: "5h" }
    );
    res
      .status(200)
      .json({ token: toke, status: "Login success", admin: oldAdmin });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something went wrong" });
  }
};

const trainersList = async (req, res) => {
  try {
    const trainersList = await Trainer.find({});
    res.json(trainersList);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in courses ...");
  }
};

const trainerBlockstatus = async (req, res) => {
  console.log(req.body, " values from  the front end blockstatus updater");
  const { currentStatus, trainerId } = req.body;
  const response = await Trainer.updateOne(
    { _id: trainerId },
    { isBlocked: !currentStatus }
  );
  console.log(response);
  if (response.modifiedCount > 0) {
    if (currentStatus) {
      res.json({ message: "Trainer is Unblocked", status: false });
    } else {
      res.json({ message: "Trainer is Blocked", status: true });
    }
  }
};

const notifications = async (req, res) => {
  const trainersToVerify = await Trainer.find({ isVerified: false });
  if (trainersToVerify.length > 0) res.json(trainersToVerify);
};

const trainerDetails = async (req, res) => {
  console.log("trainerDetails is calling.....");
  const { trainerId } = req.query;

  const getDetails = await Trainer.findOne({ _id: trainerId });
  console.log(getDetails, "trainer details from the data base......");
  res.json(getDetails);
};

const verifyTrainer = async (req, res) => {
  const { trainerId } = req.query;
  console.log("verify Trainer........");
  const updatedTrainer = await Trainer.findOneAndUpdate(
    { _id: trainerId },
    { isVerified: true },
    { new: true }
  );

  console.log(updatedTrainer, "vrified trainer");
  const mailOptions = {
    from: "gymtrainersonline@gmail.com", // sender address
    to: updatedTrainer.email, // list of receivers
    subject: "GYM Fitness Center Account Verification", // Subject line
    html: `<p>Hello ${updatedTrainer.fname},</p>

        <p>We are pleased to inform you that your account has been successfully verified.</p> <p>You can now log in and access all the features and benefits of our platform.</p>
        
        <p>Thank you for your patience during the verification process.</p>
        
        <p>Best regards,</p>
        <p>GYM TRAINERS MANAGEMENT TEAM</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error", error);
      res.json({ status: "Email not send" });
    } else {
      console.log(info, "info from otpmailer");
      res.json({
        status: "Verification email has been sent",
        message: `Verification Email has been sent to ${info.accepted[0]} !`,
        data: updatedTrainer,
      });
    }
  });
};

const clientList = async (req, res) => {
  console.log("client list calling....");
  const usersList = await User.find({});
  res.json(usersList);
};

const courseList = async (req, res) => {
  try {
    console.log("client list calling....");
    const courseList = await Course.find({}).populate("trainerId");
    res.json(courseList);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in courses ...");
  }
};

const clientDetails = async (req, res) => {
  const { userId } = req.query;
  const getDetails = await User.findOne({ _id: userId }).populate(
    "courses.course"
  );
  console.log(getDetails, "user details from the data base......");
  res.json(getDetails);
};

const createConversation = async (req, res) => {
  console.log("trainer conversation creation calling..");
  const { adminId, trainerId } = req.body;
  try {
    let response = null;
    const conversationExist = await Conversation.findOne({
      members: {
        $all: [trainerId, adminId],
      },
    });

    if (conversationExist) {
      response = conversationExist;
      return res.json(response);
    }

    const newConv = await Conversation.create({
      members: [trainerId, adminId],
    });
    response = newConv;
    res.json(response);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in trainerClientDetails ...");
  }
};

const getConversation = async (req, res) => {
  console.log("getconversation is calling");
  const { adminId } = req.query;
  try {
    const conv = await Conversation.find({
      members: { $in: [adminId] },
    }).sort({ timestamp: -1 });
    res.json(conv);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in trainerClientDetails ...");
  }
};

const getUser = async (req, res) => {
  console.log("getUser is calling in admin controller.......");
  try {
    const { trainerId } = req.query;
    const user = await Trainer.findOne({ _id: new ObjectId(trainerId) });
    res.json(user);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in getuser ...");
  }
};

const getMessages = async (req, res) => {
  console.log("getMessages calling.......");
  try {
    const { conversationId } = req.query;
    const response = await Message.find({ conversationId: conversationId });
    res.json(response);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in getuser ...");
  }
};

const createMessage = async (req, res) => {
  console.log("create message is calling....");
  const { conversationId, sender, text } = req.body;
  try {
    const response = await Message.create({
      conversationId,
      sender,
      text,
    });
    res.json(response);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in getuser ...");
  }
};

const transactions = async (req, res) => {
  try {
    const resp = await Transaction.find({}).sort({createdAt:-1});
    res.json(resp);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in transaction ...");
  }
};

const transactionClients = async (req, res) => {
  try {
    const { clientId } = req.query;

    let client = {};

    const admin = await Admin.findOne({ _id: new ObjectId(clientId) });
    const trainer = await Trainer.findOne({ _id: new ObjectId(clientId) });
    const user = await User.findOne({ _id: new ObjectId(clientId) });

    if (admin) {
      client = admin;
    } else if (trainer) {
      client = trainer;
    } else if (user) {
      client = user;
    }

    res.json(client);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in transactions ...");
  }
};

const transaction = async (req, res) => {
  try {
    const { transactionId } = req.query;
    const response = await Transaction.findOne({
      _id: new ObjectId(transactionId),
    });
    res.json(response);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in transaction ...");
  }
};

const getwallet = async (req, res) => {
  try {
    const { adminId } = req.query;
    const response = await Wallet.findOne({ user: adminId });
    res.json(response);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in Wallet ...");
  }
};

const getUserCount = async (req, res) => {
  try {
    const response = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $group: {
          _id: null,
          data: 
          { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: {
            $reverseArray: "$data",
          },
        },
      },
      {
        $unwind: "$data",
      },
      {
        $replaceRoot: {
          newRoot: "$data",
        },
      },
    ]);
    res.json(response);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in getUserWallet ...");
  }
};

const getPresentCount = async (req, res) => {
  try {
    const today =
      new Date().getDate() +
      "/" +
      (new Date().getMonth() + 1) +
      "/" +
      new Date().getFullYear();

    console.log(today, "today .....");

    const present = await Course.aggregate([
      {
        $unwind: "$clients",
      },
      {
        $unwind: "$clients.attendance",
      },
      {
        $match: {
          "clients.attendance.date": today
        }
      },
      {
        $group: {
          _id: "$clients.attendance.status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ])
    console.log(present,'present count in admin')
    res.json(present)

  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in getPresent count ...");
  }
};

module.exports = {
  adminLogin,
  trainersList,
  trainerBlockstatus,
  notifications,
  trainerDetails,
  verifyTrainer,
  clientList,
  clientDetails,
  createConversation,
  getConversation,
  getUser,
  getMessages,
  createMessage,
  courseList,
  transactions,
  transaction,
  transactionClients,
  getwallet,
  getUserCount,
  getPresentCount,
};
