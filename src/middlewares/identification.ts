import jwt  from "jsonwebtoken";
import { Request,Response,NextFunction } from "express";
import dotenv from 'dotenv';
import User from "../models/userModel";
dotenv.config();

const tokenSecret = process.env.TOKEN_SECRET || "";

interface AuthenticatedRequest extends Request {
	user?: typeof User; // user might be undefined if not authenticated
  }

export const identifier = async (req : any, res : Response, next : NextFunction) => {
	let token;
	token = req.headers.authorization || req.cookies['Bearer']

	if (!token) {
		 res.status(403).json({ success: false, message: 'Unauthorized' });
         return
	}

	try {
		const userToken = token.split(' ')[1];
		const jwtVerified = await jwt.verify(userToken, tokenSecret);
		const { email }: any  = jwtVerified
		const users = await User.findOne( {email} )
		if(!users){
			res.status(403).json({ success: false, message: "Unauthorized"});
			return 
		}
		if (jwtVerified) {
			req.body = {...req.body, jwtVerified};
			next();
		} else {
			throw new Error('error in the token');
		}
	} catch (error) {
		res.status(403).json({ success: false, message: "Unauthorized"});
		return

	}
};
