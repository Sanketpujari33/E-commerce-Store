const mongoose = require("mongoose");

async function connectToDatabase() {
    const connectionString = process.env.MONGODB_URI;
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        socketTimeoutMS: 30000, // Increase the timeout as needed
        connectTimeoutMS: 30000, // Increase the timeout as needed
    };

    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 5000; // 5 seconds

    while (retryCount < maxRetries) {
        try {
            const conn=await mongoose.connect(connectionString, options);
            console.log(`Connected to MongoDB! : ${conn.connection.host}`);
            break; // Successful connection, exit loop
        } catch (error) {
            console.error(`Connection to MongoDB failed (attempt ${retryCount + 1}):`, error);
            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }
    }
}

// Call the function to connect to MongoDB
module.exports = connectToDatabase;


