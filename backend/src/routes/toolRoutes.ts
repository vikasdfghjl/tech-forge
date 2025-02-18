import { Router } from 'express';
import { toolController } from '../controllers/toolController';

const router = Router();

// Define routes with proper error handling
router.get('/tools', async (req, res, next) => {
    try {
        await toolController.getAll(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/tools', async (req, res, next) => {
    try {
        await toolController.create(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/tools/:id', async (req, res, next) => {
    try {
        await toolController.update(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/tools/:id', async (req, res, next) => {
    try {
        await toolController.delete(req, res);
    } catch (error) {
        next(error);
    }
});

// Add new routes for want and fund buttons
router.post('/tools/:toolId/want', async (req, res, next) => {
    try {
        await toolController.incrementWant(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/tools/:toolId/fund', async (req, res, next) => {
    try {
        await toolController.incrementFund(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
