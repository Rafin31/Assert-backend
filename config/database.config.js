import mongoose from "mongoose";

const connectToMongoDb = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_DB_CONNECTION_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Off-Chain Database connected successfully".bold.green.inverse);
        return db;
    } catch (error) {
        console.error(`Off-Chain Database Connection Error -> ${error}`.bold.red.inverse);
        process.exit(1);
    }
};

export default connectToMongoDb;
