// This file defines the Journal structure for Supabase interactions
// Since we're using Supabase, we don't need traditional Mongoose schemas
// but we'll define the expected structure for consistency

/**
 * Journal represents a journal entry created by a user
 * 
 * Fields:
 * - id: UUID (primary key in Supabase)
 * - user_id: UUID (references auth.users.id)
 * - title: String
 * - content: String (the journal entry text)
 * - mood: String (optional mood indicator)
 * - tags: String[] (optional tags/categories)
 * - created_at: Timestamp
 * - updated_at: Timestamp
 */

class Journal {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.title = data.title;
        this.content = data.content;
        this.mood = data.mood;
        this.tags = data.tags;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static tableName = 'journal_entries';

    // Transform database record to client-friendly format
    static toClientModel(dbModel) {
        return {
            id: dbModel.id,
            userId: dbModel.user_id,
            title: dbModel.title,
            content: dbModel.content,
            mood: dbModel.mood,
            tags: dbModel.tags,
            createdAt: dbModel.created_at,
            updatedAt: dbModel.updated_at
        };
    }

    // Transform client data to database format
    static toDbModel(clientModel) {
        return {
            user_id: clientModel.userId,
            title: clientModel.title,
            content: clientModel.content,
            mood: clientModel.mood,
            tags: clientModel.tags
        };
    }
}

module.exports = Journal;
