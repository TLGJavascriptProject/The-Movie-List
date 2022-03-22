const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { auth } = require('express-openid-connect');
const { ServerApiVersion } = require('mongodb');
const cors = require('cors');
const { Server } = require('socket.io');
const { process_params } = require('express/lib/router');
const { get } = require('express/lib/response');
const req = require('express/lib/request');
require('dotenv').config();

// routers
const routes = require('./routes/routes');
const details_routes = require('./routes/details_routes');

// Auth0 Configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER,
};

// middleware applications
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cors());
app.use(auth(config));
app.use('/', routes);
app.use('/', details_routes)

// socket.io instantiation
const server = require('http').createServer(app);
const io = new Server(server);

// socket.io controller
io.on('connection', (socket) => {
  console.log('User connnected: ' + socket.id);

  socket.on('ratings', (data) => {
    socket.broadcast.emit('ratings', data);
  });

  socket.on('comments', (data) => {
    socket.broadcast.emit('comments', data);
  });
});

// mongoose instance of mongodb
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  })
  .then(console.log('MongoDB is connected...'))
  .catch((err) => console.error(err));

server.listen(process.env.PORT, () => {
  console.log('Sockets are listening...');
});

console.log('Express server is running!');