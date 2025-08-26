const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const User = require('../models/User');

/**
 * Validate Supabase token and issue our own JWT
 */
exports.validateToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Supabase token is required' });
        }

        // Verify the token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Invalid token',
                details: error?.message
            });
        }

        // Generate our own JWT with the user information
        const jwtPayload = {
            id: user.id,
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
        };

        const jwtToken = jwt.sign(
            jwtPayload,
            process.env.JWT_SECRET || 'your-secret-key'
        );

        res.json({
            success: true,
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({
            error: 'Failed to validate token',
            details: error.message
        });
    }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user profile from Supabase
        const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

        if (error || !user) {
            return res.status(404).json({
                error: 'User not found',
                details: error?.message
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Failed to get user profile',
            details: error.message
        });
    }
};
