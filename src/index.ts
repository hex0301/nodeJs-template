import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import authRouter from './routers/authRouters'
import postsRouter from './routers/postsRouter'
import ivRouter from './routers/ivRouter';

import { encrypt, decrypt } from './crypto/crypto';

// Load environment variables from .env file
dotenv.config();


// Create an Express app
const app = express();
const port = process.env.PORT;

// Middlewares
app.use(helmet());  // For security headers
app.use(cors({
  origin: '*',  // Angular frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow these HTTP methods
  credentials: true,  // If you're using cookies or authentication
}));
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


app.use('/api/iv', ivRouter)
app.use('', ivRouter)
app.get('/', (req, res) => {
	res.json({ message: 'Hello from the server' });
});




// Route to encrypt text

app.post('/encrypt', async (req, res) => {
   // let [key,iv,data] = req.body 
   let body = req.body
   let data = body.data
   let key = body.key
   let iv = body.iv

 if (!key){res.send('Invalid Key'); return} 
 if (!iv) {res.send('Invalid IV'); return}
 if (!data){res.send('Invalid Data');return}
 let encrypted = await encrypt(data,key,iv)
 res.json({
     encrypted
 })
});

app.post('/decrypt', async (req, res) => {
  let body = req.body
    let data = body.data
    let key = body.key
    let iv = body.iv
    if (!key){res.send('Invalid Key'); return} 
    if (!iv) {res.send('Invalid IV'); return}
    if (!data){res.send('Invalid Data');return}
    let decryptedData = await decrypt(data,key,iv )
    res.json({decryptedData})
});
