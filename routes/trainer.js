const Router = require('express');
const router = Router();

const { verifyTokenTrainer } = require('../middlewares/auth')

const {
    
    trainerRegister,
    trainerLogin,
    trainerLoginWithGoogle,
    trainerDetails,
    addCourse,
    trainerCourseList,
    trainerClientList,
    trainerClientDetails,
    createConversation,
    getConversation,
    getUser,
    getMessages,
    createMessage,
    updateProfileImage,
    updateProfile,
    wallet,
    transactions,
    attendance,
    clientProgress,
    clientAttendance
                   
} = require('../controllers/trainerController')


/* GET users listing. */
router.post('/register', trainerRegister );
router.post('/login', trainerLogin );
router.post('/loginwithgoogle', trainerLoginWithGoogle );
router.get('/trainerdetails',verifyTokenTrainer, trainerDetails );
router.post('/addcourse',verifyTokenTrainer, addCourse );
router.get('/courses',verifyTokenTrainer, trainerCourseList );
router.get('/clients',verifyTokenTrainer, trainerClientList );
router.get('/client/details',verifyTokenTrainer, trainerClientDetails );
router.post('/chat',  createConversation);
router.get('/chat',  getConversation);
router.get('/chat/user',  getUser);
router.get('/chat/messages',  getMessages);
router.post('/chat/message',  createMessage);
router.patch("/updateprofileImage",verifyTokenTrainer, updateProfileImage);
router.patch("/updateprofile",verifyTokenTrainer, updateProfile);
router.get("/wallet", wallet);
router.get("/transactions", transactions);
router.post("/attendance",verifyTokenTrainer, attendance);
router.get("/clientprogress",verifyTokenTrainer, clientProgress);
router.get("/client/attendance",verifyTokenTrainer, clientAttendance);

module.exports =  router;
