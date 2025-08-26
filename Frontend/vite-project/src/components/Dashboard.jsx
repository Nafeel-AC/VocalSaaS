import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import VoiceRecorder from './VoiceRecorder';
import AudioPlayer from './AudioPlayer';
import JournalEntry from './JournalEntry';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('voice');
  const [voiceModels, setVoiceModels] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUser();
    fetchVoiceModels();
    fetchSessions();
    fetchJournalEntries();
  }, []);

  const getUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const fetchVoiceModels = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch('http://localhost:5000/api/voice/models', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setVoiceModels(result.voiceModels);
        }
      }
    } catch (error) {
      console.error('Error fetching voice models:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch('http://localhost:5000/api/sessions', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setSessions(result.sessions);
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch('http://localhost:5000/api/journal/entries', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setJournalEntries(result.journalEntries);
        }
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleVoiceModelCreated = (newVoiceModel) => {
    setVoiceModels(prev => [...prev, newVoiceModel]);
  };

  const handleSessionCreated = (newSession) => {
    setSessions(prev => [...prev, newSession]);
  };

  const handleJournalEntryCreated = (newEntry) => {
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">VocalSaaS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'voice', name: 'Voice Recording', icon: '🎤' },
              { id: 'sessions', name: 'Audio Sessions', icon: '🎧' },
              { id: 'journal', name: 'Journal', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'voice' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Voice Recording & Model Creation</h2>
              <VoiceRecorder 
                onVoiceModelCreated={handleVoiceModelCreated}
                voiceModels={voiceModels}
              />
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Audio Sessions</h2>
              <AudioPlayer 
                voiceModels={voiceModels}
                sessions={sessions}
                onSessionCreated={handleSessionCreated}
              />
            </div>
          )}

          {activeTab === 'journal' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Journal Entries</h2>
              <JournalEntry 
                journalEntries={journalEntries}
                onJournalEntryCreated={handleJournalEntryCreated}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
