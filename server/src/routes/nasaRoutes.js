import express from 'express';
import {
  getApodController,
  getMarsController,
  getNeoController,
} from '../controllers/nasaController.js';

const router = express.Router();

router.get('/apod', getApodController);
router.get('/mars', getMarsController);
router.get('/neo', getNeoController);

export default router;
