const express = require('express');
const dotenv = require('dotenv');
var cors = require('cors');
const http = require ('http');
const socketIO = require('socket.io');
const databaseDB = require('./config/Database');
const userRoutes = require ('./routes/userRoutes')
const bodyParser = require("body-parser");
const session = require('express-session'); // session middleware
const passportLocal = require("passport-local").Strategy;
const passport = require('passport');  // authentication
const User = require('./model/User'); // User Model 
const Bet = require('./model/bets');
const passportConfig = require('./passportConfig');



const app = express();

const httpServer = http.createServer(app);

const socketServer = socketIO(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  },
});



app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({
  extended: false
}));


// Set up middleware and routes
app.use(session({
  secret: 'r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());


dotenv.config();

databaseDB();
User.removeActiveBets(function(){
  console.log('cleared bets');
  Bet.removeActiveBets();
})


httpServer.listen(4000, () => {

})

passportConfig(passport);

app.use('/api', userRoutes);

const roulette = require('./data/roulette')(socketServer);

