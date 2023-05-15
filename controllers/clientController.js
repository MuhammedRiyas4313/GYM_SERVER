const bcrypt = require("bcrypt");
const CronJob = require("cron").CronJob;
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Otp = require("../models/otp");
const Course = require("../models/course");
const Trainer = require("../models/trainer");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transactions");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "ddxqpujjv",
  api_key: 285814637664696,
  api_secret: "i8hO5c9YTp17cWXWDIIduZKlx2s",
  secure: true,
});

let transporter = nodemailer.createTransport({
  // true for 465, false for other ports
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_AUTHER, // generated ethereal user
    pass: process.env.NODEMAILER_AUTHER_PASSWORD, // generated ethereal password
  },
});

const clientLogin = async (req, res) => {
  console.log("client login calling for sent email.......");
  try {
    const { email, password } = req.body;
    const oldUser = await User.findOne({ email });

    if (!oldUser) return res.json({ status: "User doesn't exist" });

    if (oldUser.isVerified === false) {
      sendOtpVerification(oldUser, res);
    } else {
      if (oldUser.isBlocked === true)
        return res.json({ status: "User is blocked" });

      const isPasswordCorrect = await bcrypt.compare(
        password,
        oldUser.password
      );

      if (!isPasswordCorrect)
        return res.json({ status: "Invalid Credentials" });

      const toke = jwt.sign(
        { name: oldUser.fname, email: oldUser.email, id: oldUser._id, role: "client" },
        "ClientTokenSecret",
        { expiresIn: "5h" }
      );

      res.json({ token: toke, status: "Login success", user: oldUser });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

const clientLoginWithGoogle = async (req, res) => {
  console.log("client login calling with google.......");
  try {
    const { email, password } = req.body;
    const oldUser = await User.findOne({ email });

    if (!oldUser) return res.json({ status: "User doesn't exist" });

    if (oldUser.isVerified === false) {
      sendOtpVerification(oldUser, res);
    } else {
      if (oldUser.isBlocked === true)
        return res.json({ status: "User is blocked" });

      const toke = jwt.sign(
        { name: oldUser.fname, email: oldUser.email, id: oldUser._id ,role: "client" },
        "ClientTokenSecret",
        { expiresIn: "5h" }
      );

      res.json({ token: toke, status: "Login success", user: oldUser });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error.message);
  }
};

const clientRegister = async (req, res) => {
  console.log("client register page  calling.......");

  const { fname, dob, gender, email, phone, password, weight, height } =
    req.body;
  try {
    const oldUser = await User.findOne({ email });

    if (oldUser !== null) {
      return res.json({ status: "User already exists !" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      fname,
      dob,
      gender,
      weight,
      height,
      email,
      phone,
      password: hashedPassword,
    });
    Wallet.create({
      user: result._id,
      balance: 0,
    });
    console.log("user created");
    res.json({ status: "New account Created successfully" });
  } catch (error) {
    res.json({ status: "Something went wrong" });
    console.log(error.message);
  }
};

const sendOtpVerification = async (result, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    //hash the otp
    const saltRounds = 10;

    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const newOTPVerification = new Otp({
      userId: result._id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    //save the otp record
    await newOTPVerification.save();

    const mailOptions = {
      from: "gymtrainersonline@gmail.com", // sender address
      to: result.email, // list of receivers
      subject: "GYM Fitness Center Email Verification", // Subject line
      html: `<p>Enter  ${otp}  in the app to verify your email address and complete the sign up</p><p>This OTP <b>expires in 1 hour</b>.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error", error.message);
        res.json({ status: "Email not send" });
      } else {
        console.log(info, "info from otpmailer");
        res.json({
          status: "User is not verified",
          message: `Verification OTP has been sent to ${info.accepted[0]} !`,
          data: {
            userId: result._id,
            email: result.email,
          },
        });
      }
    });
  } catch (error) {
    res.json({ status: "Something went wrong" });
  }
};

const clientVerifyOTP = async (req, res) => {
  try {
    const userId = req.query.userId;
    let { otp1, otp2, otp3, otp4 } = req.body;
    const otp = "" + otp1 + otp2 + otp3 + otp4;
    console.log(otp, "concatenated otp ....");
    if (!userId || !otp) {
      res.json({ message: "Empty otp details are not allowed" });
      console.log("otp empty");
    } else {
      const userOTPVerificationRecords = await Otp.find({ userId });
      if (userOTPVerificationRecords.length <= 0) {
        console.log("no records");
        //no records found
        res.json({
          message:
            "Account record doesn't exist or has been verified already. Please sign up or log in",
        });
      } else {
        //user otp record exists
        const { expiresAt } =
          userOTPVerificationRecords[userOTPVerificationRecords.length - 1];
        const hashedOTP =
          userOTPVerificationRecords[userOTPVerificationRecords.length - 1].otp;
        console.log(hashedOTP, "0 th otp.....");
        console.log(otp, "hashed password");
        if (expiresAt < Date.now()) {
          console.log("otp expired");
          //user otp record has expired
          await Otp.deleteMany({ userId });
          res.json({ status: "OTP has expired. Please request again." });
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          console.log(validOTP, "comparison");
          if (!validOTP) {
            console.log("otp not valid");
            //supllied otp is wrong
            res.json({ status: "Invalid OTP passed. Check your inbox." });
          } else {
            //success
            console.log("otp confirmed");
            await User.updateOne({ _id: userId }, { isVerified: true });
            await Otp.deleteMany({ userId });
            res.json({ status: "User email verified successfully" });
          }
        }
      }
    }
  } catch (error) {
    console.log(error, "error in the verifiction catch block");
    res.json({ status: "Unable to verify" });
  }
};

const clientResendOTP = async (req, res) => {
  try {
    console.log("resendOtp calling....");
    const userId = req.query.userId;
    const oldUser = await User.findOne({ _id: userId });
    sendOtpVerification(oldUser, res);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in getTrainerDetails client");
  }
};

const clientDetails = async (req, res) => {
  try {
    console.log("clientDetails calling.......");
    const { userId } = req.query;

    const getDetails = await User.findOne({ _id: userId });
    res.json(getDetails);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in clientDetails client");
  }
};

const courses = async (req, res) => {
  try {
    const { search } = req.query;
    if (req.query.hasOwnProperty("search")) {
      const regex = new RegExp(`^${search}`, "i");
      const getCourses = await Course.find({
        coursename: { $regex: regex },
      }).populate("trainerId");
      res.json(getCourses);
      console.log(search, "search data");
    } else {
      console.log("courses get calling.....");
      const getCourses = await Course.find({}).populate("trainerId");
      res.json(getCourses);
    }
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in courses client");
  }
};

const courseDetails = async (req, res) => {
  try {
    console.log("courseDetails is calling......");

    const { courseId } = req.query;

    const getDetails = await Course.findOne({ _id: courseId }).populate(
      "trainerId"
    );
    res.json(getDetails);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in courseDetails client");
  }
};

const trainers = async (req, res) => {
  try {
    console.log("trainers get calling.....");
    const { search } = req.query;
    if (req.query.hasOwnProperty("search")) {
      const regex = new RegExp(`^${search}`, "i");
      const getTrainers = await Trainer.find({
        fname: { $regex: regex },
      });
      res.json(getTrainers);
    } else {
      const getTrainers = await Trainer.find({});
      res.json(getTrainers);
    }
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in Trainers client");
  }
};

const trainerDetails = async (req, res) => {
  try {
    const { trainerId } = req.query;
    const getDetails = await Trainer.findOne({ _id: trainerId });

    console.log("trainers details calling......");
    res.json(getDetails);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in trainerDetails client");
  }
};

const trainerCourseList = async (req, res) => {
  console.log("ind trainer course list ........");
  try {
    const { trainerId } = req.query;

    const getCourses = await Course.find({
      trainerId: new ObjectId(trainerId),
    });

    res.json(getCourses);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in trainerDetails client");
  }
};

const enrollCLient = async (req, res) => {
  const today = new Date();
  const currMonth = today.getMonth() + 1;
  const monthName = new Date(Date.UTC(0, currMonth - 1, 1)).toLocaleString(
    "default",
    { month: "long" }
  );
  const formattedDate = today.toISOString().slice(0, 10);

  try {
    const {
      weight,
      height,
      emergencycontact,
      slote,
      healthinfo,
      clientId,
      courseId,
      paymentDetails,
    } = req.body;

    const course = await Course.findOne({ _id: new ObjectId(courseId) });

    const existClient = await Course.findOne({
      $and: [
        { "clients.user": new ObjectId(clientId) },
        { "clients.paymentStatus": true },
      ],
    });
    const existClientPayementPending = await Course.findOne({
      $and: [
        { "clients.user": new ObjectId(clientId) },
        { "clients.paymentStatus": false },
      ],
    });

    if (existClient)
      return res.json({ status: "Your already enrolled In this course" });

    if (course.status === "blocked")
      return res.json({ status: "Can't Enroll Now" });

    if (existClientPayementPending) {
      console.log("already enroled but not paid");
      const updateCourse = await Course.updateOne(
        {
          $and: [
            { _id: new ObjectId(courseId) },
            { "clients.user": new ObjectId(clientId) },
          ],
        },
        {
          $set: { "clients.$.paymentStatus": true },
          $push: {
            "clients.$.updations": {
              $each: [
                {
                  month: monthName,
                  weight: weight,
                  height: height,
                  paymentDetails: paymentDetails,
                },
              ],
              $position: 0,
            },
          },
        }
      );
    } else {
      const updatedCourse = await Course.updateOne(
        {
          $and: [
            { _id: new ObjectId(courseId) },
            { "availableSlots.slote": slote },
          ],
        },
        {
          $set: {
            "availableSlots.$.status": "booked",
            "availableSlots.$.client": clientId,
            "availableSlots.$.joined": formattedDate,
          },
          $push: {
            clients: {
              $each: [
                {
                  user: clientId,
                  joined: formattedDate,
                  paymentStatus: true,
                  bookedSlote: slote,
                  emergencyContact: emergencycontact,
                  healthInfo: healthinfo,
                },
              ],
              $position: 0,
            },
          },
        }
      );

      const updateCourse = await Course.updateOne(
        {
          $and: [
            { _id: new ObjectId(courseId) },
            { "clients.user": new ObjectId(clientId) },
          ],
        },
        {
          $push: {
            "clients.$.updations": {
              $each: [
                {
                  month: monthName,
                  weight: weight,
                  height: height,
                  paymentDetails: paymentDetails,
                },
              ],
              $position: 0,
            },
          },
        }
      );

      const resp = await User.updateOne(
        { _id: new ObjectId(clientId) },
        {
          $push: {
            courses: { course: courseId },
          },
        }
      );
    }

    const adminId = "64300ee00b649a2abb940de1";

    const userTransaction = await Transaction.create({
      payee: clientId,
      reciever: adminId,
      amount: paymentDetails.amount,
      status: paymentDetails.status,
    });

    const adminWallet = await Wallet.updateOne(
      { user: adminId },
      {
        $inc: { balance: paymentDetails.amount },
        $push: {
          transactions: { id: userTransaction._id },
        },
      }
    );

    const userWallet = await Wallet.updateOne(
      { user: clientId },
      {
        $push: {
          transactions: { id: userTransaction._id },
        },
      }
    );

    const amountTrainer = Math.round(paymentDetails.amount * 0.8);

    const trainerTransaction = await Transaction.create({
      payee: adminId,
      reciever: course.trainerId,
      amount: amountTrainer,
      status: paymentDetails.status,
    });

    const trainerWallet = await Wallet.updateOne(
      { user: course.trainerId },
      {
        $inc: { balance: amountTrainer },
        $push: {
          transactions: { id: trainerTransaction._id },
        },
      }
    );

    const adminWallet2 = await Wallet.updateOne(
      { user: adminId },
      {
        $inc: { balance: -amountTrainer },
        $push: {
          transactions: { id: trainerTransaction._id },
        },
      }
    );

    res.json({ status: "successfully enrolled" });
  } catch (error) {
    res.json({ status: "something wrong" });
    console.log(error.message, "error in mongoUpdate");
  }
};

const createConversation = async (req, res) => {
  console.log("client conversation creation calling..");
  const { trainerId, clientId } = req.body;
  try {
    let response = null;
    const conversationExist = await Conversation.findOne({
      members: {
        $all: [trainerId, clientId],
      },
    });

    if (conversationExist) {
      response = conversationExist;
      return res.json(response);
    }

    const newConv = await Conversation.create({
      members: [trainerId, clientId],
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
  const { clientId } = req.query;
  try {
    const conv = await Conversation.find({
      members: { $in: [clientId] },
    }).sort({ timestamp: -1 });
    res.json(conv);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in getconversation ...");
  }
};

const getUser = async (req, res) => {
  console.log("getUser is calling in clientcontroller.......");
  try {
    const { userId } = req.query;
    const user = await Trainer.findOne({ _id: new ObjectId(userId) });
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

const updateProfileImage = async (req, res) => {
  const { filef, clientId } = req.body;

  try {
    const file1 = await cloudinary.uploader.upload(filef, {
      folder: "ClientProfile",
    });

    const response = await User.findOneAndUpdate(
      { _id: new ObjectId(clientId) },
      { profile: file1.url },
      { new: true }
    );

    res.json(response);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in getuser ...");
  }
};

const updateProfile = async (req, res) => {
  console.log("update Profile calling......");

  const { fname, email, dob, phone } = req.body.values;
  const { clientId } = req.body;

  try {
    const response = await User.findOneAndUpdate(
      { _id: new ObjectId(clientId) },
      {
        fname,
        dob,
        email,
        phone,
      },
      { new: true }
    );
    res.json(response);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in update client profile ...");
  }
};

const courseList = async (req, res) => {
  try {
    const { userId } = req.query;
    const resp = await User.findOne({ _id: new ObjectId(userId) }).populate(
      "courses.course"
    );
    res.json(resp);
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in update client profile ...");
  }
};

const cancelCourse = async (req, res) => {
  console.log("course cancelation calling..");

  try {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const currentDate = new Date();
    const currentMonth = months[currentDate.getMonth()];

    const adminId = "64300ee00b649a2abb940de1";

    const { courseId, userId } = req.query;
    console.log(courseId, userId);
    const course = await Course.findOne({ _id: new ObjectId(courseId) });
    const user = await User.findOne({ _id: new ObjectId(userId) });

    const courseIndex = user.courses.findIndex((obj) => obj.course == courseId);
    const courseDoc = user.courses[courseIndex];
    const clientIndex = course.clients.findIndex((obj) => obj.user == userId);
    const clientDoc = course.clients[clientIndex];
    const sloteIndex = course.availableSlots.findIndex(
      (obj) => obj.client == userId
    );
    console.log(sloteIndex, "slote index....cancelation");
    const sloteDoc = course.availableSlots[sloteIndex];
    console.log(sloteDoc, "slote doc to clear");
    const UpdationDocIndex = clientDoc.updations.findIndex(
      (obj) => obj.month == currentMonth
    );
    const UpdationDoc = clientDoc.updations[UpdationDocIndex];

    const paymentDetails = UpdationDoc.paymentDetails;

    const removeCourse = await User.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $pull: { courses: { _id: new ObjectId(courseDoc._id) } } },
      { new: true }
    );
    const removeClient = await Course.findOneAndUpdate(
      { _id: new ObjectId(courseId) },
      { $pull: { clients: { _id: new ObjectId(clientDoc._id) } } },
      { new: true }
    );
    const slot = await Course.findOne({
      _id: new ObjectId(courseId),
      "availableSlots._id": sloteDoc._id,
    }).populate({
      path: "availableSlots.client",
      model: "user",
    });

    if (slot) {
      slot.availableSlots.id(sloteDoc._id).status = "free";
      slot.availableSlots.id(sloteDoc._id).client = null;
      slot.availableSlots.id(sloteDoc._id).joined = "";

      await slot.save();

      console.log(`Slot ${sloteDoc._id} cleared.`);
    }

    console.log(clientDoc.joined, "client joined date.....");

    const joinedDate = new Date(clientDoc.joined);
    const today = new Date();
    const timeDiff = today.getTime() - joinedDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff <= 7) {
      console.log("cancelation within 7 days");

      const refundAmount = paymentDetails.amount * 0.7;

      const userTransaction = await Transaction.create({
        payee: adminId,
        reciever: userId,
        amount: refundAmount,
        status: paymentDetails.status,
      });

      const trainerTransaction = await Transaction.create({
        payee: course.trainerId,
        reciever: adminId,
        amount: refundAmount * 0.9,
        status: paymentDetails.status,
      });

      const userWallet = await Wallet.updateOne(
        { user: userId },
        {
          $inc: { balance: refundAmount },
          $push: {
            transactions: { id: userTransaction._id },
          },
        }
      );

      const trainerWallet = await Wallet.updateOne(
        { user: course.trainerId },
        {
          $inc: { balance: -refundAmount * 0.9 },
          $push: {
            transactions: { id: trainerTransaction._id },
          },
        }
      );

      const adminWallet = await Wallet.updateOne(
        { user: adminId },
        {
          $inc: { balance: refundAmount * 0.9 },
          $push: {
            transactions: { id: userTransaction._id },
          },
        }
      );

      const adminWallet2 = await Wallet.updateOne(
        { user: adminId },
        {
          $inc: { balance: -refundAmount },
          $push: {
            transactions: { id: userTransaction._id },
          },
        }
      );

      res.json({
        status: `We would like to inform you that your amount of ${refundAmount} will be credited to your wallet after a deduction of 30% within a week`,
      });
    } else {
      console.log("cancelation after 7 days");
      res.json({
        status: `We regret to inform you that we are unable to process your refund request as your membership has exceeded 7 days`,
      });
    }
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in course cancelation......");
  }
};

const attendanceDetails = async (req, res) => {
  console.log("attendance details is calling....");
  try {
    const { courseId, clientId } = req.query;
    console.log(courseId, "courseId", clientId, "clientId");
    const course = await Course.findOne(
      { _id: courseId },
      { clients: { $elemMatch: { user: new ObjectId(clientId) } } }
    );
    const userAttendance = course.clients[0].attendance
    console.log(userAttendance,'userAttendance')
    res.json(userAttendance)
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in  attendance details......");
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateMonthlyData = async () => {
  // Your code to update monthly data here
  try {
    console.log("Monthly data updated");
    const resp = await Course.updateMany(
      {},
      { $set: { "clients.$[].paymentStatus": false } }
    );
  } catch (error) {
    res.json({ status: "something went wrong" });
    console.log(error.message, "error in cron job in client controller ...");
  }
};

const scheduleMonthlyUpdate = () => {
  // Schedule the job to run at midnight on the first day of each month
  const job = new CronJob(
    "0 0 1 * *",
    function () {
      updateMonthlyData();
    },
    null,
    true,
    "UTC"
  );

  job.start();
};

scheduleMonthlyUpdate();

module.exports = {
  clientLogin,
  clientRegister,
  clientLoginWithGoogle,
  clientVerifyOTP,
  clientResendOTP,
  clientDetails,
  courses,
  courseDetails,
  trainers,
  trainerDetails,
  trainerCourseList,
  enrollCLient,
  createConversation,
  getConversation,
  getUser,
  getMessages,
  createMessage,
  updateProfileImage,
  updateProfile,
  courseList,
  cancelCourse,
  attendanceDetails,
};
