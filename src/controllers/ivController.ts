import { Request,Response } from 'express';
import CryptoJS from "crypto-js";
import axios from 'axios';

export const getIV = async (req : Request , res : Response) => {
	try {
		const iv = CryptoJS.lib.WordArray.random(16);

		// Step 2: Convert the IV to Base64 format
		const ivBase64 = iv.toString(CryptoJS.enc.Base64);
		res.status(200).json({ success: true, message: 'posts', data: ivBase64 });
        return
    } catch (error) {
		console.log(error);
	}
};


export const request = async (req : Request , res : Response) => {
	try {   
		const response = await axios.post("http://localhost:3000/login",{
			"encryptedPayload" : "U2FsdGVkX1/xLRJo7U7uB60kV69kZq9ADq9Bvi7xDkWvgEMqq6QQlmbhKKRVN2ZVfnNJglRv4Sl/VWOkzmpGRnhE/7JsUvhLgzo6XZcRxrU="
		},{headers :{iv:"Nq9vp04SPefA8FOimhwU9Q=="}})
		res.status(200).json({ success: true, message: 'posts', data: {} });
        return
    } catch (error) {
		console.log(error);
	}
};






