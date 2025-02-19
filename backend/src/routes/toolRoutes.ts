import { Router } from 'express';
import { toolController } from '../controllers/toolController';

const router = Router();

router.get('/tools', toolController.getAll);
router.post('/tools', toolController.create);
router.put('/tools/:id', toolController.update);
router.delete('/tools/:id', toolController.delete);
router.post('/projects/:projectId/tools', toolController.addToolToProject);
router.get('/projects/:projectId/tools', toolController.getProjectTools);
router.delete('/projects/:projectId/tools/:toolName', toolController.removeToolFromProject);
router.post('/tools/:toolId/increment-want', toolController.incrementWant);
router.post('/tools/:toolId/increment-fund', toolController.incrementFund); // Ensure this line exists
router.post('/tools/:toolId/comments', toolController.addComment);
router.post('/tools/:toolId/comments/:commentId/like', toolController.likeComment);

export default router;
