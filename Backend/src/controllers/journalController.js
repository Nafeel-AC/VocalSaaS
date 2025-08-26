const supabase = require('../config/db');
const Journal = require('../models/Journal');

/**
 * Create a new journal entry
 */
exports.createEntry = async (req, res) => {
    try {
        const { title, content, mood, tags } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ error: 'Journal content is required' });
        }

        // Create a new journal entry
        const entryData = {
            user_id: userId,
            title: title || 'Untitled Entry',
            content,
            mood,
            tags
        };

        const { data: entry, error } = await supabase
            .from('journal_entries')
            .insert(entryData)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                error: 'Failed to create journal entry',
                details: error.message
            });
        }

        res.json({
            success: true,
            journalEntry: Journal.toClientModel(entry),
            message: 'Journal entry created successfully'
        });
    } catch (error) {
        console.error('Journal creation error:', error);
        res.status(500).json({
            error: 'Failed to create journal entry',
            details: error.message
        });
    }
};

/**
 * Get all journal entries for a user
 */
exports.getEntries = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from('journal_entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) {
            return res.status(500).json({
                error: 'Failed to count journal entries',
                details: countError.message
            });
        }

        // Get journal entries with pagination
        const { data: entries, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return res.status(500).json({
                error: 'Failed to fetch journal entries',
                details: error.message
            });
        }

        res.json({
            success: true,
            journalEntries: entries.map(entry => Journal.toClientModel(entry)),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count
            }
        });
    } catch (error) {
        console.error('Get journal entries error:', error);
        res.status(500).json({
            error: 'Failed to fetch journal entries',
            details: error.message
        });
    }
};

/**
 * Get a single journal entry by ID
 */
exports.getEntry = async (req, res) => {
    try {
        const userId = req.user.id;
        const entryId = req.params.id;

        const { data: entry, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('id', entryId)
            .eq('user_id', userId)
            .single();

        if (error) {
            return res.status(404).json({
                error: 'Journal entry not found',
                details: error.message
            });
        }

        res.json({
            success: true,
            journalEntry: Journal.toClientModel(entry)
        });
    } catch (error) {
        console.error('Get journal entry error:', error);
        res.status(500).json({
            error: 'Failed to fetch journal entry',
            details: error.message
        });
    }
};

/**
 * Update a journal entry
 */
exports.updateEntry = async (req, res) => {
    try {
        const userId = req.user.id;
        const entryId = req.params.id;
        const { title, content, mood, tags } = req.body;

        // First check if the entry exists and belongs to the user
        const { data: existingEntry, error: fetchError } = await supabase
            .from('journal_entries')
            .select()
            .eq('id', entryId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existingEntry) {
            return res.status(404).json({
                error: 'Journal entry not found',
                details: fetchError?.message
            });
        }

        // Update the entry
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (mood !== undefined) updateData.mood = mood;
        if (tags !== undefined) updateData.tags = tags;

        const { data: updatedEntry, error: updateError } = await supabase
            .from('journal_entries')
            .update(updateData)
            .eq('id', entryId)
            .eq('user_id', userId)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({
                error: 'Failed to update journal entry',
                details: updateError.message
            });
        }

        res.json({
            success: true,
            journalEntry: Journal.toClientModel(updatedEntry),
            message: 'Journal entry updated successfully'
        });
    } catch (error) {
        console.error('Update journal entry error:', error);
        res.status(500).json({
            error: 'Failed to update journal entry',
            details: error.message
        });
    }
};

/**
 * Delete a journal entry
 */
exports.deleteEntry = async (req, res) => {
    try {
        const userId = req.user.id;
        const entryId = req.params.id;

        // Delete the entry
        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', entryId)
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({
                error: 'Failed to delete journal entry',
                details: error.message
            });
        }

        res.json({
            success: true,
            message: 'Journal entry deleted successfully'
        });
    } catch (error) {
        console.error('Delete journal entry error:', error);
        res.status(500).json({
            error: 'Failed to delete journal entry',
            details: error.message
        });
    }
};
