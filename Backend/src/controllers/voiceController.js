const axios = require('axios');
const FormData = require('form-data');
const supabase = require('../config/db');
const VoiceModel = require('../models/VoiceModel');

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * Upload a voice recording and create a voice model in ElevenLabs
 */
exports.uploadVoice = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const userId = req.user.id;
        const audioBuffer = req.file.buffer;
        const fileName = `${userId}_${Date.now()}.wav`;
        const modelName = req.body.name || `voice_${userId}`;
        const description = req.body.description || `Voice model for user ${userId}`;

        console.log('Received audio file:', {
            size: audioBuffer.length,
            fileName,
            modelName,
            description,
            userId
        });

        // Upload to ElevenLabs for voice cloning
        const formData = new FormData();
        // According to ElevenLabs API docs, the field should be 'files'
        formData.append('files', audioBuffer, fileName);
        formData.append('name', modelName);
        formData.append('description', description);

        console.log('Sending request to ElevenLabs API');

        const response = await axios.post(
            `${ELEVENLABS_BASE_URL}/voices/add`,
            formData,
            {
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        console.log('ElevenLabs API response:', response.data);

        if (response.data && response.data.voice_id) {
            // Store voice model info in Supabase
            const voiceModelData = {
                user_id: userId,
                name: modelName,
                description: description,
                elevenlabs_voice_id: response.data.voice_id,
                // You could store the audio in Supabase storage and add the URL here
                audio_url: null
            };

            const { data, error } = await supabase
                .from(VoiceModel.tableName)
                .insert(voiceModelData)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({
                    error: 'Failed to save voice model',
                    details: error.message
                });
            }

            // Return the voice model info
            res.json({
                success: true,
                voiceModel: VoiceModel.toClientModel(data),
                message: 'Voice model created successfully'
            });
        } else {
            throw new Error('Failed to create voice model');
        }
    } catch (error) {
        console.error('Voice upload error:', error);

        // More detailed error logging
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error('ElevenLabs API error response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from ElevenLabs API:', error.request);
        } else {
            // Something else happened in setting up the request
            console.error('Error setting up request:', error.message);
        }

        res.status(500).json({
            error: 'Failed to process voice upload',
            details: error.message
        });
    }
};

/**
 * Generate audio using ElevenLabs TTS with a user's voice model
 */
exports.generateAudio = async (req, res) => {
    try {
        const { script, voiceId, title, sessionType } = req.body;
        const userId = req.user.id;

        if (!script || !voiceId) {
            return res.status(400).json({ error: 'Script and voice ID are required' });
        }

        // Verify the voice model belongs to the user
        const { data: voiceModel, error: voiceError } = await supabase
            .from(VoiceModel.tableName)
            .select()
            .eq('elevenlabs_voice_id', voiceId)
            .eq('user_id', userId)
            .single();

        if (voiceError || !voiceModel) {
            return res.status(404).json({
                error: 'Voice model not found or does not belong to the user',
                details: voiceError?.message
            });
        }

        // Generate audio using ElevenLabs TTS
        const ttsResponse = await axios.post(
            `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
            {
                text: script,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            },
            {
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        // For a complete implementation, you would:
        // 1. Upload the audio buffer to Supabase Storage
        // 2. Get the public URL for the uploaded file
        // 3. Save the session info with the audio URL in the database

        // For now, we'll return the audio as base64
        const audioBase64 = Buffer.from(ttsResponse.data).toString('base64');

        // Create a session record in the database
        const sessionData = {
            user_id: userId,
            voice_model_id: voiceModel.id,
            title: title || 'Untitled Session',
            script: script,
            // audio_url would come from Supabase Storage
            audio_url: null,
            // For a real implementation, calculate the duration
            duration: Math.ceil(script.length / 20), // Rough estimate
            status: 'completed'
        };

        const { data: session, error: sessionError } = await supabase
            .from('audio_sessions')
            .insert(sessionData)
            .select()
            .single();

        if (sessionError) {
            console.error('Session creation error:', sessionError);
            // We still return the audio even if the session record failed
        }

        res.json({
            success: true,
            session: session ? {
                id: session.id,
                userId: session.user_id,
                voiceModelId: session.voice_model_id,
                title: session.title,
                script: session.script,
                status: session.status,
                createdAt: session.created_at
            } : null,
            audioData: audioBase64,
            message: 'Audio generated successfully'
        });
    } catch (error) {
        console.error('Audio generation error:', error);
        res.status(500).json({
            error: 'Failed to generate audio',
            details: error.message
        });
    }
};

/**
 * Get all voice models for a user
 */
exports.getVoiceModels = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: voiceModels, error } = await supabase
            .from(VoiceModel.tableName)
            .select('*')
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({
                error: 'Failed to fetch voice models',
                details: error.message
            });
        }

        res.json({
            success: true,
            voiceModels: voiceModels.map(vm => VoiceModel.toClientModel(vm))
        });
    } catch (error) {
        console.error('Get voice models error:', error);
        res.status(500).json({
            error: 'Failed to fetch voice models',
            details: error.message
        });
    }
};

/**
 * Get a single voice model by ID
 */
exports.getVoiceModel = async (req, res) => {
    try {
        const userId = req.user.id;
        const voiceModelId = req.params.id;

        const { data: voiceModel, error } = await supabase
            .from(VoiceModel.tableName)
            .select('*')
            .eq('id', voiceModelId)
            .eq('user_id', userId)
            .single();

        if (error) {
            return res.status(404).json({
                error: 'Voice model not found',
                details: error.message
            });
        }

        res.json({
            success: true,
            voiceModel: VoiceModel.toClientModel(voiceModel)
        });
    } catch (error) {
        console.error('Get voice model error:', error);
        res.status(500).json({
            error: 'Failed to fetch voice model',
            details: error.message
        });
    }
};

/**
 * Delete a voice model
 */
exports.deleteVoiceModel = async (req, res) => {
    try {
        const userId = req.user.id;
        const voiceModelId = req.params.id;

        // First get the voice model to check if it exists and get the ElevenLabs ID
        const { data: voiceModel, error: fetchError } = await supabase
            .from(VoiceModel.tableName)
            .select('*')
            .eq('id', voiceModelId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !voiceModel) {
            return res.status(404).json({
                error: 'Voice model not found',
                details: fetchError?.message
            });
        }

        // Delete from ElevenLabs if we have an ElevenLabs voice ID
        if (voiceModel.elevenlabs_voice_id) {
            try {
                await axios.delete(
                    `${ELEVENLABS_BASE_URL}/voices/${voiceModel.elevenlabs_voice_id}`,
                    {
                        headers: {
                            'xi-api-key': ELEVENLABS_API_KEY
                        }
                    }
                );
            } catch (elevenLabsError) {
                console.error('ElevenLabs deletion error:', elevenLabsError);
                // Continue even if ElevenLabs delete fails
            }
        }

        // Delete from Supabase
        const { error: deleteError } = await supabase
            .from(VoiceModel.tableName)
            .delete()
            .eq('id', voiceModelId)
            .eq('user_id', userId);

        if (deleteError) {
            return res.status(500).json({
                error: 'Failed to delete voice model',
                details: deleteError.message
            });
        }

        res.json({
            success: true,
            message: 'Voice model deleted successfully'
        });
    } catch (error) {
        console.error('Delete voice model error:', error);
        res.status(500).json({
            error: 'Failed to delete voice model',
            details: error.message
        });
    }
};
