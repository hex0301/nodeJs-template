import crypto from "crypto-js";
const secretKey = 'your-256-bit-secret-key';
import {Buffer} from "buffer"


export const encrypt = (data : any  ,key:any, iv : any) => {
   let _key = crypto.enc.Utf8.parse(key)
   let _iv = crypto.enc.Base64.parse(iv)
   let _encrypted = crypto.AES.encrypt(JSON.stringify(data), _key, {
       iv:_iv,
       mode: crypto.mode.CBC
   }).toString()
   let encrypted = _encrypted
   return encrypted
}


export const decrypt = async (encryptedText: any , key:any, iv:any) => {
  let _key = crypto.enc.Utf8.parse(key)
  let _iv = crypto.enc.Base64.parse(iv)
  let _decrypted = crypto.AES.decrypt(encryptedText, _key, {
      iv : _iv,
      mode: crypto.mode.CBC
  }).toString(crypto.enc.Base64)
  let decrypted = await JSON.parse(Buffer.from(_decrypted, 'base64').toString())
  return decrypted;
}
