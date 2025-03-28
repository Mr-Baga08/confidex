import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VideoConference from './components/VideoConference';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const auth = await authService.init();
        setAuthenticated(auth);
        setInitialized(true);
        
        // Set up token refresh
        authService.keycloak.onTokenExpired = () => {
          authService.updateToken();
        };
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  if (!initialized) {
    return <div>Loading authentication...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            authenticated ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/dashboard" element={
            <PrivateRoute authenticated={authenticated}>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/conference/:roomId" element={
            <PrivateRoute authenticated={authenticated}>
              <VideoConference />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;