// This file defines the VoiceModel structure for Supabase interactions
// Since we're using Supabase, we don't need traditional Mongoose schemas
// but we'll define the expected structure for consistency

/**
 * VoiceModel represents a user's voice model in ElevenLabs
 * 
 * Fields:
 * - id: UUID (primary key in Supabase)
 * - user_id: UUID (references auth.users.id)
 * - name: String (name of the voice model)
 * - description: String (optional description)
 * - elevenlabs_voice_id: String (the ID returned by ElevenLabs)
 * - audio_url: String (optional URL to the voice sample)
 * - created_at: Timestamp
 * - updated_at: Timestamp
 */

class VoiceModel {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.name = data.name;
        this.description = data.description;
        this.elevenlabs_voice_id = data.elevenlabs_voice_id;
        this.audio_url = data.audio_url;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static tableName = 'voice_models';

    // Transform database record to client-friendly format
    static toClientModel(dbModel) {
        return {
            id: dbModel.id,
            userId: dbModel.user_id,
            name: dbModel.name,
            description: dbModel.description,
            voiceId: dbModel.elevenlabs_voice_id,
            audioUrl: dbModel.audio_url,
            createdAt: dbModel.created_at,
            updatedAt: dbModel.updated_at
        };
    }

    // Transform client data to database format
    static toDbModel(clientModel) {
        return {
            user_id: clientModel.userId,
            name: clientModel.name,
            description: clientModel.description,
            elevenlabs_voice_id: clientModel.voiceId,
            audio_url: clientModel.audioUrl
        };
    }
}

module.exports = VoiceModel;
