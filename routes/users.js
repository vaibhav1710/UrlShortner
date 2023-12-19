const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/shortUrl");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  shortUrls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShortUrl',
  }],
});


userSchema.plugin(plm);
module.exports = mongoose.model('User', userSchema);

