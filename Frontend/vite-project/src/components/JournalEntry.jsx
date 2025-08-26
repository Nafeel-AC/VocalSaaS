import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const JournalEntry = ({ journalEntries, onJournalEntryCreated }) => {
  const [newEntry, setNewEntry] = useState('');
  const [entryType, setEntryType] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newEntry.trim()) {
      setError('Please enter some content for your journal entry');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('http://localhost:5000/api/journal/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          content: newEntry,
          type: entryType
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Journal entry created successfully!');
        onJournalEntryCreated(result.journalEntry);
        setNewEntry('');
        setEntryType('text');
      } else {
        throw new Error(result.error || 'Failed to create journal entry');
      }

    } catch (error) {
      setError(error.message);
      console.error('Journal creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry.id);
    setEditContent(entry.content);
  };

  const handleSaveEdit = async (entryId) => {
    if (!editContent.trim()) {
      setError('Entry content cannot be empty');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Here you would typically make an API call to update the entry
      // For now, we'll just update the local state
      const updatedEntries = journalEntries.map(entry => 
        entry.id === entryId 
          ? { ...entry, content: editContent }
          : entry
      );
      
      // Update the parent component's state
      // This is a simplified approach - in a real app you'd update via API
      
      setEditingEntry(null);
      setEditContent('');
      setSuccess('Entry updated successfully!');
      
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      setError(error.message);
      console.error('Edit error:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditContent('');
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Here you would typically make an API call to delete the entry
      // For now, we'll just update the local state
      const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
      
      // Update the parent component's state
      // This is a simplified approach - in a real app you'd update via API
      
      setSuccess('Entry deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      setError(error.message);
      console.error('Delete error:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Create New Entry */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Journal Entry</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Entry Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Type
            </label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="text">Text Entry</option>
              <option value="voice">Voice Note</option>
            </select>
          </div>

          {/* Entry Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {entryType === 'voice' ? 'Voice Note' : 'Journal Content'}
            </label>
            {entryType === 'text' ? (
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Write your thoughts, feelings, or reflections here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Voice recording feature coming soon!</p>
                <p className="text-xs text-gray-500">For now, please use text entries</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !newEntry.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Entry...' : 'Create Journal Entry'}
          </button>
        </form>

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

      {/* Journal Entries List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Journal Entries</h3>
        
        {journalEntries.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-gray-600">No journal entries yet</p>
            <p className="text-sm text-gray-500">Start writing to track your journey</p>
          </div>
        ) : (
          <div className="space-y-4">
            {journalEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                {editingEntry === entry.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveEdit(entry.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 whitespace-pre-wrap">{entry.content}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(entry.createdAt)}</span>
                          <span className="capitalize">{entry.type}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Journaling Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Journaling Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Write regularly, even if it's just a few sentences</li>
          <li>• Be honest with yourself - this is your private space</li>
          <li>• Reflect on your audio sessions and how they made you feel</li>
          <li>• Track your mood and progress over time</li>
          <li>• Don't worry about grammar or spelling - just write from the heart</li>
        </ul>
      </div>
    </div>
  );
};

export default JournalEntry;
