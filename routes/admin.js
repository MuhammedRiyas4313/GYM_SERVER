const Router = require("express");
const { verifyTokenAdmin } = require('../middlewares/auth')
var router = Router();

const {
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
  getPresentCount
} = require("../controllers/adminController");
const { verify } = require("jsonwebtoken");

/* GET users listing. */
router.post("/login", adminLogin);
router.get("/trainerslist",verifyTokenAdmin, trainersList);
router.patch("/trainerblockstatus",verifyTokenAdmin, trainerBlockstatus);
router.get("/notifications",verifyTokenAdmin, notifications);
router.get("/trainerdetails",verifyTokenAdmin, trainerDetails);
router.patch("/verifytrainer",verifyTokenAdmin, verifyTrainer);
router.get("/clients",verifyTokenAdmin, clientList);
router.get("/courses",verifyTokenAdmin, courseList);
router.get("/clientdetails",verifyTokenAdmin, clientDetails);
router.post('/chat',  createConversation);
router.get('/chat',  getConversation);
router.get('/chat/user',  getUser);
router.get('/chat/messages',  getMessages);
router.post('/chat/message',  createMessage);
router.get('/transactions', verifyTokenAdmin, transactions);
router.get('/transaction',verifyTokenAdmin,  transaction);
router.get('/transaction/clients', verifyTokenAdmin, transactionClients);
router.get('/wallet', verifyTokenAdmin, getwallet);
router.get('/usercount',verifyTokenAdmin,  getUserCount);
router.get('/presentcount',verifyTokenAdmin,  getPresentCount);

module.exports = router;
