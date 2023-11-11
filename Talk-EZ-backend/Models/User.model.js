const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: {
    type: String,
    default: "https://firebasestorage.googleapis.com/v0/b/auction-app-dcd79.appspot.com/o/profile-pic-placeholder.png?alt=media&token=925c30e1-3e2f-435c-8396-195295672834"
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
