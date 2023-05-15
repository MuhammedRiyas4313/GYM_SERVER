const Router = require("express");
const router = Router();

const { verifyTokenClient } = require('../middlewares/auth')

const {
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
  attendanceDetails
} = require("../controllers/clientController");
/* GET home page. */
router.post("/register", clientRegister);
router.post("/login", clientLogin);
router.post("/loginwithgoogle", clientLoginWithGoogle);
router.post("/verifyotp", clientVerifyOTP);
router.post("/resendotp", clientResendOTP);
router.get("/details", verifyTokenClient, clientDetails);
router.get("/courses", courses);
router.get("/course/details", courseDetails);
router.get("/trainers", trainers);
router.get("/trainer/details", trainerDetails);
router.get("/trainer/courses", trainerCourseList);
router.post("/enroll", verifyTokenClient, enrollCLient);
router.post("/chat", createConversation);
router.get("/chat", getConversation);
router.get("/chat/user", getUser);
router.get("/chat/messages", getMessages);
router.post("/chat/message", createMessage);
router.patch("/updateprofileImage", verifyTokenClient, updateProfileImage);
router.patch("/updateprofile", verifyTokenClient, updateProfile);
router.get("/courselist", verifyTokenClient, courseList);
router.delete("/cancel/course", verifyTokenClient, cancelCourse);
router.get("/attendance", verifyTokenClient, attendanceDetails);

module.exports = router;
