import express, { Request, Response } from 'express';
import * as postsController  from '../controllers/postsController';
import { identifier } from '../middlewares/identification';

const router = express.Router();

// Define the routes
router.get('/all-posts', postsController.getPosts);
router.get('/single-post', postsController.singlePost);
router.post('/create-post', identifier, postsController.createPost);

router.post('/update-post', identifier, postsController.updatePost);
router.post('/delete-post', identifier, postsController.deletePost);

export default router;