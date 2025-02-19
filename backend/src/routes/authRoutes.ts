import express from 'express';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client('40036920584-bgk9ompv66qlu4tc02vtpofplqn7t1su.apps.googleusercontent.com'); // Replace with your actual client ID

router.post('/google-signin', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '40036920584-bgk9ompv66qlu4tc02vtpofplqn7t1su.apps.googleusercontent.com', // Replace with your actual client ID
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        const userId = payload['sub'];
        // Create or update user in your database
        res.status(200).json({ userId });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
