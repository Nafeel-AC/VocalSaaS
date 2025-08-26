const supabase = require('../config/db');
const Session = require('../models/Session');

/**
 * Create a new audio session
 */
exports.createSession = async (req, res) => {
    try {
        const { title, script, voiceModelId, sessionType } = req.body;
        const userId = req.user.id;

        if (!script || !voiceModelId) {
            return res.status(400).json({ error: 'Script and voice model ID are required' });
        }

        // Verify the voice model belongs to the user
        const { data: voiceModel, error: voiceError } = await supabase
            .from('voice_models')
            .select()
            .eq('id', voiceModelId)
            .eq('user_id', userId)
            .single();

        if (voiceError || !voiceModel) {
            return res.status(404).json({
                error: 'Voice model not found or does not belong to the user',
                details: voiceError?.message
            });
        }

        // Create a new session record
        const sessionData = {
            user_id: userId,
            voice_model_id: voiceModelId,
            title: title || 'Untitled Session',
            script: script,
            status: 'pending',
            session_type: sessionType || 'custom'
        };

        const { data: session, error: sessionError } = await supabase
            .from('audio_sessions')
            .insert(sessionData)
            .select()
            .single();

        if (sessionError) {
            return res.status(500).json({
                error: 'Failed to create session',
                details: sessionError.message
            });
        }

        res.json({
            success: true,
            session: Session.toClientModel(session),
            message: 'Session created successfully'
        });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({
            error: 'Failed to create session',
            details: error.message
        });
    }
};

/**
 * Get all sessions for a user
 */
exports.getSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from('audio_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) {
            return res.status(500).json({
                error: 'Failed to count sessions',
                details: countError.message
            });
        }

        // Get sessions with pagination
        const { data: sessions, error } = await supabase
            .from('audio_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return res.status(500).json({
                error: 'Failed to fetch sessions',
                details: error.message
            });
        }

        res.json({
            success: true,
            sessions: sessions.map(session => Session.toClientModel(session)),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count
            }
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            error: 'Failed to fetch sessions',
            details: error.message
        });
    }
};

/**
 * Get a single session by ID
 */
exports.getSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;

        const { data: session, error } = await supabase
            .from('audio_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', userId)
            .single();

        if (error) {
            return res.status(404).json({
                error: 'Session not found',
                details: error.message
            });
        }

        res.json({
            success: true,
            session: Session.toClientModel(session)
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({
            error: 'Failed to fetch session',
            details: error.message
        });
    }
};

/**
 * Update a session
 */
exports.updateSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;
        const { title, script, status } = req.body;

        // First check if the session exists and belongs to the user
        const { data: existingSession, error: fetchError } = await supabase
            .from('audio_sessions')
            .select()
            .eq('id', sessionId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existingSession) {
            return res.status(404).json({
                error: 'Session not found',
                details: fetchError?.message
            });
        }

        // Update the session
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (script !== undefined) updateData.script = script;
        if (status !== undefined) updateData.status = status;

        const { data: updatedSession, error: updateError } = await supabase
            .from('audio_sessions')
            .update(updateData)
            .eq('id', sessionId)
            .eq('user_id', userId)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({
                error: 'Failed to update session',
                details: updateError.message
            });
        }

        res.json({
            success: true,
            session: Session.toClientModel(updatedSession),
            message: 'Session updated successfully'
        });
    } catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({
            error: 'Failed to update session',
            details: error.message
        });
    }
};

/**
 * Delete a session
 */
exports.deleteSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;

        // Delete the session
        const { error } = await supabase
            .from('audio_sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({
                error: 'Failed to delete session',
                details: error.message
            });
        }

        res.json({
            success: true,
            message: 'Session deleted successfully'
        });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({
            error: 'Failed to delete session',
            details: error.message
        });
    }
};
