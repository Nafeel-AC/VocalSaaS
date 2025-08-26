import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user session
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <StyledWrapper>
        <div className="dashboard-container">
          <div className="loading">Loading...</div>
        </div>
      </StyledWrapper>
    );
  }

  if (!user) {
    return (
      <StyledWrapper>
        <div className="dashboard-container">
          <div className="error">Please sign in to access the dashboard.</div>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Welcome to Your Dashboard!</h1>
          <button onClick={handleSignOut} className="signout-btn">
            Sign Out
          </button>
        </header>
        
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>Hello, {user.user_metadata?.full_name || user.email}!</h2>
            <p>You have successfully signed in to your account.</p>
            <div className="user-info">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Account Status</h3>
              <p className="status-active">Active</p>
            </div>
            <div className="stat-card">
              <h3>Email Verified</h3>
              <p className={user.email_confirmed_at ? 'status-verified' : 'status-pending'}>
                {user.email_confirmed_at ? 'Yes' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 30px;
    border-radius: 16px;
    margin-bottom: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  .dashboard-header h1 {
    margin: 0;
    color: #333;
    font-size: 2rem;
    font-weight: 700;
  }

  .signout-btn {
    background: #ff4757;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .signout-btn:hover {
    background: #ff3742;
    transform: translateY(-2px);
  }

  .dashboard-content {
    display: grid;
    gap: 30px;
  }

  .welcome-card {
    background: rgba(255, 255, 255, 0.95);
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    text-align: center;
  }

  .welcome-card h2 {
    color: #333;
    font-size: 2.5rem;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .welcome-card p {
    color: #666;
    font-size: 1.2rem;
    margin-bottom: 30px;
  }

  .user-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    text-align: left;
    max-width: 500px;
    margin: 0 auto;
  }

  .user-info p {
    margin: 10px 0;
    color: #555;
    font-size: 1rem;
  }

  .dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    text-align: center;
  }

  .stat-card h3 {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 15px;
    font-weight: 600;
  }

  .status-active, .status-verified {
    color: #2ed573;
    font-weight: 700;
    font-size: 1.2rem;
  }

  .status-pending {
    color: #ffa502;
    font-weight: 700;
    font-size: 1.2rem;
  }

  .loading, .error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.5rem;
    color: white;
  }

  .error {
    color: #ff4757;
  }

  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }

    .dashboard-header h1 {
      font-size: 1.5rem;
    }

    .welcome-card h2 {
      font-size: 2rem;
    }

    .welcome-card {
      padding: 30px 20px;
    }
  }
`;

export default Dashboard;
