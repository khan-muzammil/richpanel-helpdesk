const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
}, {
    collection: 'users'
});

const Users = mongoose.model('Users', userSchema);
module.exports = Users;