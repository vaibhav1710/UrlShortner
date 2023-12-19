// models/shortUrl.js
const mongoose = require('mongoose');



const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true,
  },
  short:{
    type: String,
    unique:true,
    required:true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  deleteKey: {
    type: String,
    required: true,
    unique:true,
  },
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

module.exports = ShortUrl;
