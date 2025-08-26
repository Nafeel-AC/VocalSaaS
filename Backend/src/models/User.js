// This file defines the User structure for Supabase interactions
// Since we're using Supabase, we don't need traditional Mongoose schemas
// but we'll define the expected structure for consistency

/**
 * User represents a user in the Supabase auth.users table
 * 
 * Fields:
 * - id: UUID (primary key in Supabase)
 * - email: String
 * - created_at: Timestamp
 * - updated_at: Timestamp
 */

class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // No tableName needed as we use Supabase auth.users

    // Transform database record to client-friendly format
    static toClientModel(dbModel) {
        return {
            id: dbModel.id,
            email: dbModel.email,
            createdAt: dbModel.created_at,
            updatedAt: dbModel.updated_at
        };
    }
}

module.exports = User;
