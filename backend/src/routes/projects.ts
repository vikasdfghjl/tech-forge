import { Router } from 'express';
import Project from '../models/Project';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ message: errorMessage });
    }
});

router.patch('/:id/want', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $inc: { wantCount: 1 } },
            { new: true }
        );
        res.json(project);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ message: errorMessage });
    }
});

router.patch('/:id/fund', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $inc: { fundCount: 1 } },
            { new: true }
        );
        res.json(project);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ message: errorMessage });
    }
});

export default router;
