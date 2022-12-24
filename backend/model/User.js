const mongoose = require('mongoose');

const User = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    balance: {
        type: String,
        default: 5,
    },
})

User.methods.matchEmail = function (email) {
    if (email === this.email) return;
};

module.exports = mongoose.model('User', User);