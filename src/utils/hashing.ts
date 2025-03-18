import {BinaryLike, createHmac, KeyObject} from "crypto";
import { hash,compare } from "bcryptjs";

export const doHash = (value: string, saltValue: string | number) => {
	const result = hash(value, saltValue);
	return result;
};

export const doHashValidation = (value: string, hashedValue: string) => {
	const result = compare(value, hashedValue);
	return result;
};

export const hmacProcess = (value: BinaryLike, key: BinaryLike | KeyObject) => {
	const result = createHmac('sha256', key).update(value).digest('hex');
	return result;
};
