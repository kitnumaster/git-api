const path = require('path')
const fs = require('fs')
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
const uploadRoute = require('./routes/upload')
const accountRoutes = require('./routes/account')
const productRoutes = require('./routes/product')
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/order')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync("temp", { recursive: true })
    cb(null, 'temp');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('file')
);
app.use('/temp', express.static(path.join(__dirname, 'temp')));

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
app.use('/', uploadRoute, accountRoutes, productRoutes, cartRoutes, orderRoutes)

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