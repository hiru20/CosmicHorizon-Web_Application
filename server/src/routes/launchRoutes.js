import express from 'express';
import { getLaunches, getSingleLaunch } from '../controllers/launchController.js';

const router = express.Router();

router.get('/', getLaunches);
router.get('/:id', getSingleLaunch);

export default router;
