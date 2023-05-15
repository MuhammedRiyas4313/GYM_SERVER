const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const http = require('http')
const bodyParser = require('body-parser');
const path = require('path')
const { Server } = require('socket.io')

const socketConnection = require('./socketIO')
const clientRouter = require('./routes/client');
const trainerRouter = require('./routes/trainer');
const adminRouter = require('./routes/admin');

const mongoDB = require('./database/connection')

const app = express();

const corsOptions = {
  origin: 'https://master.d3e20f1ck916dk.amplifyapp.com',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

mongoDB()

app.use(cors(corsOptions))

app.use('/', clientRouter);
app.use('/trainer', trainerRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  
});


const port = process.env.PORT
const server = http.createServer(app)

socketConnection(server)

server.listen(port,()=>{
  console.log("server running in port",port)
});



module.exports = app;
