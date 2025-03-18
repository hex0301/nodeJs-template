import jwt  from "jsonwebtoken";
import { Request,Response,NextFunction } from "express";


const tokenSecret = process.env.TOKEN_SECRET || "";

export const identifier = (req : Request, res : Response, next : NextFunction) => {
	let token;
	if (req.headers.client === 'not-browser') {
		token = req.headers.authorization;
	} else {
		token = req.cookies['Authorization'];
	}

	if (!token) {
		 res.status(403).json({ success: false, message: 'Unauthorized' });
         return
	}

	try {
		const userToken = token.split(' ')[1];
		const jwtVerified = jwt.verify(userToken, tokenSecret);
		if (jwtVerified) {
			req.body.user = jwtVerified;
			next();
		} else {
			throw new Error('error in the token');
		}
	} catch (error) {
		console.log(error);
	}
};
