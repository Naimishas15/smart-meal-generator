// LoginPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { auth, provider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = {
        email: result.user.email,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
      };
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-emoji">🥗</div>
        <h1 className="login-title">Smart Meal Generator</h1>
        <p className="login-subtext animated-text">Plan your meals smartly and stay healthy</p>
        <button className="login-btn" onClick={handleGoogleLogin}>Sign in with Google</button>
      </div>
    </div>
  );
}

export default LoginPage;
