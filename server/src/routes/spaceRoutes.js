import express from 'express';
import trackerRoutes from './trackerRoutes.js';
import launchRoutes from './launchRoutes.js';
import nasaRoutes from './nasaRoutes.js';

const router = express.Router();

router.use('/tracker', trackerRoutes);
router.use('/launches', launchRoutes);
router.use('/nasa', nasaRoutes);

export default router;
