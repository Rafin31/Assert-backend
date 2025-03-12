const mongoose = require('mongoose');

const connectToMongoDb = () => {
    try {
        exports.db = mongoose.connect(process.env.MONGO_DB_CONNECTION_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("Off-Chain Database connected successfully")
        })
    } catch (error) {
        next(`Off-Chain Database Connection Error -> ${error}`)
    }
}

module.exports = connectToMongoDb;