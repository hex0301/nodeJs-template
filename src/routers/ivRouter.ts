

  import express, { Request, Response } from 'express';
  import * as ivController from "../controllers/ivController";
  
  const router = express.Router();
  
  // Define the routes
  router.get('/get_iv', ivController.getIV);
  router.post('/request',ivController.request)
  
  export default router;