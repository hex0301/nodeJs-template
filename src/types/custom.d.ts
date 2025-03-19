import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;  // or define a more specific type for `user`
      query?: Number;
    }
  }
}