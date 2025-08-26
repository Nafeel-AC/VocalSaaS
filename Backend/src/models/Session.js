// This file defines the Session structure for Supabase interactions
// Since we're using Supabase, we don't need traditional Mongoose schemas
// but we'll define the expected structure for consistency

/**
 * Session represents an audio session created by a user
 * 
 * Fields:
 * - id: UUID (primary key in Supabase)
 * - user_id: UUID (references auth.users.id)
 * - voice_model_id: UUID (references voice_models.id)
 * - title: String
 * - script: String (the text content used for TTS)
 * - audio_url: String (optional URL to the audio file)
 * - duration: Integer (length in seconds)
 * - status: String (pending, processing, completed, failed)
 * - created_at: Timestamp
 * - updated_at: Timestamp
 */

class Session {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.voice_model_id = data.voice_model_id;
        this.title = data.title;
        this.script = data.script;
        this.audio_url = data.audio_url;
        this.duration = data.duration;
        this.status = data.status;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static tableName = 'audio_sessions';

    // Transform database record to client-friendly format
    static toClientModel(dbModel) {
        return {
            id: dbModel.id,
            userId: dbModel.user_id,
            voiceModelId: dbModel.voice_model_id,
            title: dbModel.title,
            script: dbModel.script,
            audioUrl: dbModel.audio_url,
            duration: dbModel.duration,
            status: dbModel.status,
            createdAt: dbModel.created_at,
            updatedAt: dbModel.updated_at
        };
    }

    // Transform client data to database format
    static toDbModel(clientModel) {
        return {
            user_id: clientModel.userId,
            voice_model_id: clientModel.voiceModelId,
            title: clientModel.title,
            script: clientModel.script,
            audio_url: clientModel.audioUrl,
            duration: clientModel.duration,
            status: clientModel.status || 'pending'
        };
    }
}

module.exports = Session;
