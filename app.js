const path = require('path')

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')

const authRoutes = require('./routes/auth')
const jewerlyTypeRoutes = require('./routes/setting/jewerly-type')
const materialRoutes = require('./routes/setting/material')
const housingRoutes = require('./routes/setting/housing')
const trendRoutes = require('./routes/setting/trend')
const designerLevelRoutes = require('./routes/setting/designer-level')
const detailRoutes = require('./routes/setting/detail')
const fileTypeRoutes = require('./routes/setting/file-type')
const setRoutes = require('./routes/setting/set')
const inMemoryStorage = multer.memoryStorage()
const uploadRoute = require('./routes/upload')
const accountRoutes = require('./routes/account')
const productRoutes = require('./routes/product')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: inMemoryStorage, fileFilter: fileFilter }).single('image')
);
// app.use('/images', express.static(path.join(__dirname, 'images')))

// console.log(req)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/auth', authRoutes)
app.use('/setting', jewerlyTypeRoutes, materialRoutes
  , housingRoutes, trendRoutes
  , designerLevelRoutes, detailRoutes
  , fileTypeRoutes, setRoutes)
app.use('/', accountRoutes, productRoutes)

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

const connectionString = process.env.db_conn
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}
mongoose
  .connect(connectionString, connectionParams)
  .then(result => {
    // console.log(result)
    console.log('connect database success')
    console.log('listen', process.env.PORT)
    app.listen(process.env.PORT)
  })
  .catch(err => console.log(err))