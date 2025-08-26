import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const AudioPlayer = ({ voiceModels, sessions, onSessionCreated }) => {
  const [selectedVoice, setSelectedVoice] = useState('');
  const [sessionType, setSessionType] = useState('meditation');
  const [customScript, setCustomScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const predefinedScripts = {
    meditation: "Take a deep breath in through your nose. Hold it for a moment, then slowly exhale through your mouth. Feel your body relax with each breath. Let go of any tension you're holding. You are safe, you are calm, you are present in this moment.",
    sleep: "Close your eyes and imagine yourself in a peaceful place. Maybe it's a quiet beach at sunset, or a cozy cabin in the woods. Feel the warmth and comfort surrounding you. Your mind is quiet, your body is heavy and relaxed. You're drifting into a deep, restful sleep.",
    focus: "You are focused and alert. Your mind is clear and sharp. You have the ability to concentrate deeply on any task. Distractions fade away as you become more and more focused. You are productive, efficient, and in control of your attention.",
    anxiety: "You are safe and secure. Take slow, deep breaths. With each breath, feel the anxiety leaving your body. You are stronger than your worries. This moment will pass, and you will be okay. You have the strength to handle whatever comes your way."
  };

  const handleGenerateSession = async () => {
    if (!selectedVoice) {
      setError('Please select a voice model first');
      return;
    }

    if (!customScript && !predefinedScripts[sessionType]) {
      setError('Please provide a script or select a session type');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const script = customScript || predefinedScripts[sessionType];
      
      const response = await fetch('http://localhost:5000/api/voice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          script,
          voiceId: selectedVoice,
          sessionType
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Audio session generated successfully!');
        onSessionCreated(result.session);
        
        // Create audio element from base64 data
        const audioBlob = new Blob([Uint8Array.from(atob(result.session.audioData), c => c.charCodeAt(0))], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setCurrentAudio(audioUrl);
        
        // Reset form
        setCustomScript('');
        setSessionType('meditation');
      } else {
        throw new Error(result.error || 'Failed to generate audio session');
      }

    } catch (error) {
      setError(error.message);
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Session Generation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Personalized Audio Session</h3>
        
        <div className="space-y-4">
          {/* Voice Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Voice Model
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a voice model</option>
              {voiceModels.map((model) => (
                <option key={model.id} value={model.voiceId}>
                  {model.fileName}
                </option>
              ))}
            </select>
          </div>

          {/* Session Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="meditation">Meditation</option>
              <option value="sleep">Sleep</option>
              <option value="focus">Focus</option>
              <option value="anxiety">Anxiety Relief</option>
            </select>
          </div>

          {/* Custom Script Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Script (Optional)
            </label>
            <textarea
              value={customScript}
              onChange={(e) => setCustomScript(e.target.value)}
              placeholder="Or write your own custom script here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSession}
            disabled={isGenerating || !selectedVoice}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating Audio...' : 'Generate Audio Session'}
          </button>
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

      {/* Audio Player */}
      {currentAudio && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Player</h3>
          
          <div className="space-y-4">
            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={currentAudio}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            {/* Play/Pause Button */}
            <div className="flex justify-center">
              <button
                onClick={togglePlayPause}
                className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div
                ref={progressRef}
                onClick={handleSeek}
                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
              >
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24"
              />
              <span className="text-sm text-gray-600">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Sessions History */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Audio Sessions</h3>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{session.sessionType}</div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
