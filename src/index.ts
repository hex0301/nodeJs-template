import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import authRouter from './routers/authRouters'
import postsRouter from './routers/postsRouter'
import User from './models/userModel';

// Load environment variables from .env file
dotenv.config();


// Create an Express app
const app = express();
const port = process.env.PORT;

// Middlewares
app.use(helmet());  // For security headers
app.use(cors());  // Enable Cross-Origin Resource Sharing
app.use(cookieParser());  // To parse cookies
app.use(express.json());  // To parse JSON request bodies



// MongoDB connection (replace with your database URI)
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// Start the server
try {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
      }); 
} catch (error) {
    console.log(`Server port: ${port} is already used`);
}


//routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.get('/', (req, res) => {
	res.json({ message: 'Hello from the server' });
});

