import transport from "../middlewares/sendmail";
import User from "../models/userModel";
import { doHash, doHashValidation, hmacProcess } from "../utils/hashing";
import {
	signupSchema,
	signinSchema,
	acceptCodeSchema,
	changePasswordSchema,
	acceptFPCodeSchema,
} from "../middlewares/validator";
import jwt from "jsonwebtoken"
import { Request, Response } from "express";
import { errorSignupHandling } from "../handler/errorHandling";
import dotenv from 'dotenv';
import { crossOriginEmbedderPolicy } from "helmet";
dotenv.config();

const tokenSecret = process.env.TOKEN_SECRET || "";
const hmacVerofocationCodeSecret = process.env.HMAC_VERIFICATION_CODE_SECRET || "";


export const getUser =  async (req: Request , res : Response) =>{
	const user  = await User.find().select("+password")
	res.status(200).json({success : true , message : "User list" , data: user })
}

export const signup = async (req : Request , res : Response) => {
	const { email, password } = (Object.keys(req.query).length === 0 ? req.body : req.query)
	const postsPerPage = 10;
	try {
		const { error, value } = signupSchema.validate({ email, password });

		if (error) {
			const err =  await errorSignupHandling(error)
			res.status(401)
				.json(err);
                return
		}
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			res
				.status(401)
				.json({ success: false, message: 'User already exists!' });
                return
		}

		const hashedPassword = await doHash(password, 12);

		const newUser = new User({
			email,
			password: hashedPassword,
		});
		const result = await newUser.save();
		(result as any).password = undefined;
		res.status(201).json({
			success: true,
			message: 'Your account has been created successfully',
			result,
		});
	} catch (error) {
		console.log(error);
	}
};

export const signin = async (req : Request , res : Response) => {
	const { email, password } = (Object.keys(req.query).length === 0 ? req.body : req.query)
	const postsPerPage = 10;
	try {
		const { error, value } = signinSchema.validate({ email, password });
		if (error) {
			res
				.status(401)
				.json({ success: false, message: error.details[0].message });
                return
		}

		const existingUser = await User.findOne({ email }).select('+password');
		if (!existingUser) {
			res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
                return
		}
		const result = await doHashValidation(password, existingUser.password);
		if (!result) {
			res
				.status(401)
				.json({ success: false, message: 'Invalid credentials!' });
                return
		}
		const token = jwt.sign(
			{
				userId: existingUser._id,
				email: existingUser.email,
				verified: existingUser.verified,
			},
			tokenSecret,
			{
				expiresIn: '1h',
			}
		);

		res
			.cookie('Authorization', 'Bearer ' + token, {
				expires: new Date(Date.now() + 1 * 5000),
				httpOnly: process.env.NODE_ENV === 'production',
				secure: process.env.NODE_ENV === 'production',
			})
			.json({
				success: true,
				token,
				message: 'logged in successfully',
			});
	} catch (error) {
		console.log(error);
	}
};

export const signout = async (req : Request , res : Response) => {
	res
		.clearCookie('Authorization')
		.status(200)
		.json({ success: true, message: 'logged out successfully' });
};

export const sendVerificationCode = async (req : Request , res : Response) => {
	const { email } = req.body;
	try {
		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			res
				.status(404)
				.json({ success: false, message: 'User does not exists!' });
                return
		}
		if (existingUser.verified) {
			res
				.status(400)
				.json({ success: false, message: 'You are already verified!' });
                return
		}

		const codeValue = Math.floor(Math.random() * 1000000).toString();
		let info = await transport.sendMail({
			from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
			to: existingUser.email,
			subject: 'verification code',
			html: '<h1>' + codeValue + '</h1>',
		});
		if(process.env.NODE_ENV ===  "dev"){
			console.log(`Verification Code : ${ codeValue }`)
		}
		if (info.accepted[0] === existingUser.email) {
			const hashedCodeValue = hmacProcess(
				codeValue,
				hmacVerofocationCodeSecret
			);
			existingUser.verificationCode = hashedCodeValue;
			existingUser.verificationCodeValidation = Date.now();
			await existingUser.save();
			res.status(200).json({ success: true, message: 'Code sent!' });
            return
		}
		res.status(400).json({ success: false, message: 'Code sent failed!' });
	} catch (error) {
		console.log(error);
	}
};

export const verifyVerificationCode = async (req : Request , res : Response) => {
	const { email, providedCode } = req.body;
	try {
		const { error, value } = acceptCodeSchema.validate({ email, providedCode });
		if (error) {
			res
				.status(401)
				.json({ success: false, message: error.details[0].message });
                return
		}

		const codeValue = providedCode.toString();
		const existingUser = await User.findOne({ email }).select(
			'+verificationCode +verificationCodeValidation'
		);

		if (!existingUser) {
			res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
                return
		}
		if (existingUser.verified) {
			res
				.status(400)
				.json({ success: false, message: 'you are already verified!' });
                return
		}

		if (
			!existingUser.verificationCode ||
			!existingUser.verificationCodeValidation
		) {
			res
				.status(400)
				.json({ success: false, message: 'something is wrong with the code!' });
                return
		}

		if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
			res
				.status(400)
				.json({ success: false, message: 'code has been expired!' });
                return
		}

		const hashedCodeValue = hmacProcess(
			codeValue,
			hmacVerofocationCodeSecret
		);

		if (hashedCodeValue === existingUser.verificationCode) {
			existingUser.verified = true;
			existingUser.verificationCode = undefined;
			existingUser.verificationCodeValidation = undefined;
			await existingUser.save();
			res
				.status(200)
				.json({ success: true, message: 'your account has been verified!' });
                return
		}
		res
			.status(400)
			.json({ success: false, message: 'unexpected occured!!' });
            return
	} catch (error) {
		console.log(error);
	}
};

export const changePassword = async (req : Request , res : Response) => {
	const { oldPassword, newPassword,email , verified } = req.body;
	try {
		const { error, value } = changePasswordSchema.validate({
			oldPassword,
			newPassword,
		});
		if (error) {
			res
				.status(401)
				.json({ success: false, message: error.details[0].message });
                return
		}
		if (!verified) {
			res
				.status(401)
				.json({ success: false, message: 'You are not verified user!' });
                return
		}
		const existingUser = await User.findOne({ email }).select(
			'+password'
		);
		if (!existingUser) {
			res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
                return
		}
		const result = await doHashValidation(oldPassword, existingUser.password);
		if (!result) {
			res
				.status(401)
				.json({ success: false, message: 'Invalid credentials!' });
                return
		}
		const hashedPassword = await doHash(newPassword, 12);
		existingUser.password = hashedPassword;
		await existingUser.save();
		res
			.status(200)
			.json({ success: true, message: 'Password updated!!' });
            return
	} catch (error) {
		console.log(error);
	}
};

export const sendForgotPasswordCode = async (req : Request , res : Response) => {
	const { email } = req.body;
	try {
		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			res
				.status(404)
				.json({ success: false, message: 'User does not exists!' });
                return
		}

		const codeValue = Math.floor(Math.random() * 1000000).toString();
		let info = await transport.sendMail({
			from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
			to: existingUser.email,
			subject: 'Forgot password code',
			html: '<h1>' + codeValue + '</h1>',
		});

		if (info.accepted[0] === existingUser.email) {
			const hashedCodeValue = hmacProcess(
				codeValue,
				hmacVerofocationCodeSecret
			);
			existingUser.forgotPasswordCode = hashedCodeValue;
			existingUser.forgotPasswordCodeValidation = Date.now();
			await existingUser.save();
			if(process.env.NODE_ENV === "dev"){
				console.log(`Verification Code : ${codeValue}`)
			}
			res.status(200).json({ success: true, message: 'Code sent!' });
            return
		}
		res.status(400).json({ success: false, message: 'Code sent failed!' });
	} catch (error) {
		console.log(error);
	}
};

export const verifyForgotPasswordCode = async (req : Request , res : Response) => {
	const { email, providedCode, newPassword } = req.body;
	try {
		const { error, value } = acceptFPCodeSchema.validate({
			email,
			providedCode,
			newPassword,
		});
		if (error) {
			res
				.status(401)
				.json({ success: false, message: error.details[0].message });
                return
		}

		const codeValue = providedCode.toString();
		const existingUser = await User.findOne({ email }).select(
			'+forgotPasswordCode +forgotPasswordCodeValidation'
		);

		if (!existingUser) {
			res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
                return
		}

		if (
			!existingUser.forgotPasswordCode ||
			!existingUser.forgotPasswordCodeValidation
		) {
			res
				.status(400)
				.json({ success: false, message: 'something is wrong with the code!' });
                return
		}

		if (
			Date.now() - existingUser.forgotPasswordCodeValidation >
			5 * 60 * 1000
		) {
			res
				.status(400)
				.json({ success: false, message: 'code has been expired!' });
                return
		}

		const hashedCodeValue = hmacProcess(
			codeValue,
			hmacVerofocationCodeSecret
		);

		if (hashedCodeValue === existingUser.forgotPasswordCode) {
			const hashedPassword = await doHash(newPassword, 12);
			existingUser.password = hashedPassword;
			existingUser.forgotPasswordCode = undefined;
			existingUser.forgotPasswordCodeValidation = undefined;
			await existingUser.save();
			res
				.status(200)
				.json({ success: true, message: 'Password updated!!' });
                return
		}
		res
			.status(400)
			.json({ success: false, message: 'unexpected occured!!' });
            return
	} catch (error) {
		console.log(error);
	}
};
