import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://benitoflores:thisisapasswordtest1234@mtg-binder-cluster.xey7zqa.mongodb.net/?retryWrites=true&w=majority&appName=mtg-binder-cluster"

if (!MONGO_URI) {
  throw new Error('Define the MONGO_URI environment variable inside .env');
}

async function dbConnect() {
    if (mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(MONGO_URI);
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw new Error('Failed to connect to MongoDB');
        }
    }
    else {
        console.log('MongoDB is already connected');
    }
}

export default dbConnect;