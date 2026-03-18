const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URL, {
            serverSelectionTimeoutMS: 5000,
            family: 4, // Force IPv4
            tls: true,
            retryWrites: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Failed!`);
        console.error(`Error stack: ${error.stack}`);
        if (error.message.includes('SSL') || error.message.includes('tls') || error.message.includes('alert')) {
            console.error('TIP: This looks like a TLS/SSL handshake issue. Forcing IPv4 and explicit TLS enabled.');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
