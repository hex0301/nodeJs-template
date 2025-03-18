import { createPostSchema } from '../middlewares/validator';
import Post from '../models/postsModel';
import { Request,Response } from 'express';


export const getPosts = async (req : Request , res : Response) => {
	const { page } =  req.query;
	const postsPerPage = 10;
	try {
		let pageNum = 0;
		if (Number(page) <= 1) {
			pageNum = 0;
		} else {
			pageNum = Number(page) - 1;
		}
		const result = await Post.find()
			.sort({ createdAt: -1 })
			.skip(pageNum * postsPerPage)
			.limit(postsPerPage)
			.populate({
				path: 'userId',
				select: 'email',
			});
		res.status(200).json({ success: true, message: 'posts', data: result });
	} catch (error) {
		console.log(error);
	}
};

export const singlePost = async (req : Request , res : Response) => {
	const { _id } = req.query;

	try {
		const existingPost = await Post.findOne({ _id }).populate({
			path: 'userId',
			select: 'email',
		});
		if (!existingPost) {
			 res
				.status(404)
				.json({ success: false, message: 'Post unavailable' });
            return
		}
		res
			.status(200)
			.json({ success: true, message: 'single post', data: existingPost });
	} catch (error) {
		console.log(error);
	}
};

export const createPost = async (req : any , res : Response) => {
	const { title, description } = req.body;
	const { userId } = req.user;
	try {
		const { error, value } = createPostSchema.validate({
			title,
			description,
			userId,
		});
		if (error) {
			 res
				.status(401)
				.json({ success: false, message: error.details[0].message });
                return
		}

		const result = await Post.create({
			title,
			description,
			userId,
		});
		res.status(201).json({ success: true, message: 'created', data: result });
	} catch (error) {
		console.log(error);
	}
};

export const updatePost = async (req : any , res : Response) => {
	const { _id } = req.query;
	const { title, description } = req.body;
	const { userId } = req.user;
	try {
		const { error, value } = createPostSchema.validate({
			title,
			description,
			userId,
		});
		if (error) {
			res
				.status(401)
				.json({ success: false, message: error.details[0].message });
                return
		}
		const existingPost = await Post.findOne({ _id });
		if (!existingPost) {
			res
				.status(404)
				.json({ success: false, message: 'Post unavailable' });
                return
		}
		if (existingPost.userId.toString() !== userId) {
			res.status(403).json({ success: false, message: 'Unauthorized' });
            return
		}
		existingPost.title = title;
		existingPost.description = description;

		const result = await existingPost.save();
		res.status(200).json({ success: true, message: 'Updated', data: result });
	} catch (error) {
		console.log(error);
	}
};

export const deletePost = async (req : any , res : Response) => {
	const { _id } = req.query;

	const { userId } = req.user;
	try {
		const existingPost = await Post.findOne({ _id });
		if (!existingPost) {
			res
				.status(404)
				.json({ success: false, message: 'Post already unavailable' });
                return
		}
		if (existingPost.userId.toString() !== userId) {
			res.status(403).json({ success: false, message: 'Unauthorized' });
            return
		}

		await Post.deleteOne({ _id });
		res.status(200).json({ success: true, message: 'deleted' });
	} catch (error) {
		console.log(error);
	}
};
