const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

/**
 * Middleware to authenticate using Supabase token
 */
exports.authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        // Verify the token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(403).json({
                error: 'Invalid or expired token',
                details: error?.message
            });
        }

        // Add user to request
        req.user = {
            id: user.id,
            email: user.email
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({
            error: 'Failed to verify token',
            details: error.message
        });
    }
};
