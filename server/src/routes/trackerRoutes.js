import express from 'express';
import { getIssTelemetry } from '../controllers/trackerController.js';

const router = express.Router();

router.get('/iss', getIssTelemetry);

export default router;
