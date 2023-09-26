const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  roles: [{
    ref: "Rol",
    type: mongoose.Schema.Types.ObjectId
  }]
},
{
  timestamps: true,
  versionKey: false,
}
);

const User = mongoose.model('User', userSchema);

module.exports = User;
