// Login.tsx
import React from 'react';
import authService from '../services/authService';
import './Login.css';

const Login = () => {
  const handleLogin = () => {
    authService.keycloak.login();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Secure Video Conferencing</h1>
        <p className="login-description">
          Connect securely with your financial advisors and clients through our
          compliant video conferencing platform.
        </p>
        
        <button onClick={handleLogin} className="login-btn">
          Login with Company Credentials
        </button>
        
        <div className="login-security-info">
          <p>Enterprise-grade security for financial institutions:</p>
          <div className="security-features">
            <span className="security-feature">End-to-End Encryption</span>
            <span className="security-feature">Multi-Factor Authentication</span>
            <span className="security-feature">Compliance Ready</span>
            <span className="security-feature">Audit Logging</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;