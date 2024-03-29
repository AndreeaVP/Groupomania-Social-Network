const express = require('express');
const morgan = require('morgan');
const winston = require('winston');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/posts');
const likeRoutes = require('./routes/likes');
const commentRoutes = require('./routes/comments');

const app = express();

app.use(cors());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const morganStream = {
  write: (message) => {
    logger.info(message);
  },
};

app.use(morgan('combined', { stream: morganStream }));
app.use(helmet());  
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); 
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);

module.exports = app;  