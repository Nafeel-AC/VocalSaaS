import React, { useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabaseClient';

const SignInForm = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      // Successfully signed in - App component will handle redirect
      setFormData({ email: '', password: '' });
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="form-box">
        <form className="form" onSubmit={handleSubmit}>
          <span className="title">Sign in</span>
          <span className="subtitle">Welcome back! Please enter your details.</span>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-container">
            <input 
              type="email" 
              className="input" 
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input 
              type="password" 
              className="input" 
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="form-section">
          <p>Don't have an account? <a href="#" onClick={onToggleForm}>Sign up</a> </p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .form-box {
    max-width: 500px;
    min-height: 500px;
    background: #f1f7fe;
    overflow: hidden;
    border-radius: 16px;
    color: #010101;
  }

  .form {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 32px 24px 24px;
    gap: 16px;
    text-align: center;
  }

  /*Form text*/
  .title {
    font-weight: bold;
    font-size: 1.6rem;
  }

  .subtitle {
    font-size: 1rem;
    color: #666;
  }

  /*Error message*/
  .error-message {
    background-color: #fee;
    color: #c33;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    border: 1px solid #fcc;
  }

  /*Inputs box*/
  .form-container {
    overflow: hidden;
    border-radius: 8px;
    background-color: #fff;
    margin: 1rem 0 .5rem;
    width: 100%;
  }

  .input {
    background: none;
    border: 0;
    outline: 0;
    height: 40px;
    width: 100%;
    border-bottom: 1px solid #eee;
    font-size: .9rem;
    padding: 8px 15px;
    margin-bottom: 8px;
  }

  .input:last-child {
    margin-bottom: 0;
  }

  .form-section {
    padding: 16px;
    font-size: .85rem;
    background-color: #e0ecfb;
    box-shadow: rgb(0 0 0 / 8%) 0 -1px;
  }

  .form-section a {
    font-weight: bold;
    color: #0066ff;
    transition: color .3s ease;
  }

  .form-section a:hover {
    color: #005ce6;
    text-decoration: underline;
  }

  /*Button*/
  .form button {
    background-color: #0066ff;
    color: #fff;
    border: 0;
    border-radius: 24px;
    padding: 10px 16px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color .3s ease;
  }

  .form button:hover:not(:disabled) {
    background-color: #005ce6;
  }

  .form button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }`;

export default SignInForm;
