declare namespace NodeJS {
    interface ProcessEnv {
      PORT: Number;
      MONGO_URI: string;
      TOKEN_SECRET : string
      NODE_CODE_SENDING_EMAIL_ADDRESS : string
      NODE_CODE_SENDING_EMAIL_PASSWORD : string
      HMAC_VERIFICATION_CODE_SECRET : string
      NODE_ENV : string
      // Add other variables here
    }
  }