const jwt = require("jsonwebtoken");

const verifyTokenAdmin = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    console.log('admin token = ', token)
    console.log(token,'admin')
    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, "admin_secret");
    req.user = verified;

    if (verified.role == "admin") {
      console.log("admin with token");
      next();
    } else {
      return res.status(403).send("Access Denied");
    }
  } catch (err) {
    console.log(err.message,'error in auth middleware')
    res.status(500).json({ message: err.message });
  }
};

const verifyTokenClient = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    console.log(token,'client token')
    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, "ClientTokenSecret");
    req.user = verified;
    if (verified.role == "client") {
      console.log("client with token");
      next();
    } else {
      return res.status(403).send("Access Denied");
    }
  } catch (err) {
    console.log(err.message,'error in client auth middleware...')
    res.status(500).json({ message: err.message });
  }
};

const verifyTokenTrainer = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    console.log(token,'trainer token')
    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, "trainerTokenSecret");
    req.user = verified;
    if (verified.role == "trainer") {
      console.log("trainer with token");
      next();
    } else {
      return res.status(403).send("Access Denied");
    }
  } catch (err) {
    console.log(err.message,'error message in trainer auth middleware')
    res.status(500).json({ message: err.message });
  }
};

module.exports = { verifyTokenAdmin, verifyTokenClient, verifyTokenTrainer };
