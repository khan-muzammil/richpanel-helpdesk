const mongoose = require('mongoose')
const Users = require('./User')
require("dotenv").config();
let dbURL = process.env.MONGO_URI;

function connect() {
    return mongoose.connect(dbURL, {
        useNewUrlParser : true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });
}

module.exports = {
    Users : Users,
    connect: connect
};