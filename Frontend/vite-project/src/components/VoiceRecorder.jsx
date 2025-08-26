import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const VoiceRecorder = ({ onVoiceModelCreated, voiceModels }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recordingQuality, setRecordingQuality] = useState('good');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError('');
      setSuccess('');
      setRecordingQuality('good');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Analyze recording quality
        analyzeRecordingQuality(blob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      setError('Failed to start recording. Please check microphone permissions.');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeRecordingQuality = (blob) => {
    // Quality check based on file size and duration - more lenient for voice recordings
    const sizeInMB = blob.size / (1024 * 1024);
    
    // More lenient thresholds - allow shorter recordings
    if (sizeInMB < 0.02 && recordingTime < 5) {
      setRecordingQuality('poor');
    } else if (sizeInMB < 0.05 && recordingTime < 15) {
      setRecordingQuality('fair');
    } else {
      setRecordingQuality('good');
    }
  };

  const uploadVoiceSample = async () => {
    if (!audioBlob) return;
    
    setIsUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }
      
      const formData = new FormData();
      // Make sure to use the exact field name expected by the backend
      formData.append('audio', audioBlob, 'voice_sample.wav');
      
      // Add optional metadata
      formData.append('name', `Voice Model ${new Date().toLocaleDateString()}`);
      formData.append('description', 'Created with VocalSaaS');
      
      console.log('Uploading voice sample...');
      
      const response = await fetch('http://localhost:5000/api/voice/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Voice model created successfully!');
        onVoiceModelCreated(result.voiceModel);
        resetRecording();
      } else {
        throw new Error(result.error || 'Failed to create voice model');
      }
      
    } catch (error) {
      setError(error.message);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingTime(0);
    setRecordingQuality('good');
    setError('');
    setSuccess('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'good': return 'text-green-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recording Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Your Voice Sample</h3>
        
        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                disabled={isUploading}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-gray-600 text-white p-4 rounded-full hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center">
              <div className="text-2xl font-mono text-red-600 mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-600">
                Recording... Speak clearly for best results
              </div>
            </div>
          )}

          {/* Audio Preview */}
          {audioUrl && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">Recording Preview</h4>
                <audio controls className="w-full max-w-md mx-auto">
                  <source src={audioUrl} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              <div className="text-center space-y-2">
                <div className={`text-sm font-medium ${getQualityColor(recordingQuality)}`}>
                  Quality: {recordingQuality.charAt(0).toUpperCase() + recordingQuality.slice(1)}
                </div>
                <div className="text-xs text-gray-500">
                  Duration: {formatTime(recordingTime)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-3">
                <button
                  onClick={uploadVoiceSample}
                  disabled={isUploading}
                  className={`px-6 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 ${
                    recordingQuality === 'poor' 
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500' 
                      : recordingQuality === 'fair'
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {isUploading ? 'Creating Voice Model...' : 'Create Voice Model'}
                </button>
                <button
                  onClick={resetRecording}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Record Again
                </button>
              </div>
              
              {/* Quality Guidance */}
              {recordingQuality === 'poor' && (
                <div className="text-center text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                  ⚠️ Short recording detected. For best results, record at least 15-30 seconds in a quiet environment.
                </div>
              )}
              {recordingQuality === 'fair' && (
                <div className="text-center text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  ℹ️ Recording quality is acceptable. Longer recordings (2-3 minutes) will produce better voice models.
                </div>
              )}
              {recordingQuality === 'good' && (
                <div className="text-center text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  ✅ Excellent recording quality! This should produce a great voice model.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}
      </div>

      {/* Voice Models List */}
      {voiceModels.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Voice Models</h3>
          <div className="space-y-3">
            {voiceModels.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{model.fileName}</div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(model.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {model.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Recording Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Find a quiet environment with minimal background noise</li>
          <li>• Speak clearly and at a normal pace</li>
          <li>• Record at least 2-3 minutes for best results</li>
          <li>• Use a good quality microphone if possible</li>
          <li>• Avoid speaking too close to or too far from the microphone</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceRecorder;
