import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import authService from '../services/authService';
import axios from 'axios';
import './VideoConference.css';

interface JitsiMeetExternalAPI {
  new(domain: string, options: any): any;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: JitsiMeetExternalAPI;
  }
}

const VideoConference = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    // Load Jitsi Meet API script
    const script = document.createElement('script');
    script.src = 'http://localhost:8000/external_api.js';
    script.async = true;
    
    script.onload = async () => {
      try {
        // Get user profile from Keycloak
        const userProfile = await authService.getUserProfile();
        
        // Get Jitsi JWT token from backend
        const response = await axios.post('http://localhost:4000/api/meetings/token', {
          roomName: roomId,
          userInfo: {
            id: userProfile.id,
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            email: userProfile.email,
            role: authService.hasRole('financial-advisor') ? 'moderator' : 'participant'
          }
        }, {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        const jwt = response.data.token;
        
        // Initialize Jitsi Meet
        if (jitsiContainerRef.current) {
          const domain = 'localhost:8000';
          const options = {
            roomName: roomId,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            jwt,
            configOverwrite: {
              prejoinPageEnabled: false,
              disableDeepLinking: true,
              startWithAudioMuted: true,
              startWithVideoMuted: false,
              enableWelcomePage: false,
              enableClosePage: false
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat',
                'security', 'mute-everyone'
              ],
              SHOW_WATERMARK_FOR_GUESTS: false,
              SHOW_JITSI_WATERMARK: false,
              SHOW_BRAND_WATERMARK: false,
              ENABLE_FEEDBACK_ANIMATION: false
            },
            userInfo: {
              displayName: `${userProfile.firstName} ${userProfile.lastName}`
            }
          };
          
          jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
          
          // Add event listeners
          jitsiApiRef.current.addEventListeners({
            readyToClose: handleClose,
            participantJoined: handleParticipantJoined,
            videoConferenceJoined: handleVideoConferenceJoined,
            participantLeft: handleParticipantLeft,
            audioMuteStatusChanged: handleMuteStatus,
            videoMuteStatusChanged: handleVideoStatus,
            screenSharingStatusChanged: handleScreenSharingStatus
          });
        }
      } catch (error) {
        console.error('Error initializing video conference:', error);
      }
    };
    
    document.body.appendChild(script);
    
    // Clean up function
    return () => {
      document.body.removeChild(script);
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomId]);
  
  const handleClose = () => {
    // Navigate back to dashboard
    window.location.href = '/dashboard';
  };
  
  const handleParticipantJoined = (event: any) => {
    console.log('Participant joined:', event);
    // Log join event for compliance
    logEvent('PARTICIPANT_JOINED', {
      participant: event.id,
      displayName: event.displayName
    });
  };
  
  const handleVideoConferenceJoined = (event: any) => {
    console.log('Joined conference:', event);
    // Log join event for compliance
    logEvent('CONFERENCE_JOINED', {
      roomName: roomId,
      id: event.id
    });
  };
  
  const handleParticipantLeft = (event: any) => {
    console.log('Participant left:', event);
    // Log leave event for compliance
    logEvent('PARTICIPANT_LEFT', {
      participant: event.id
    });
  };
  
  const handleMuteStatus = (event: any) => {
    console.log('Audio mute status changed:', event);
    logEvent('AUDIO_MUTE_CHANGED', {
      muted: event.muted
    });
  };
  
  const handleVideoStatus = (event: any) => {
    console.log('Video mute status changed:', event);
    logEvent('VIDEO_MUTE_CHANGED', {
      muted: event.muted
    });
  };
  
  const handleScreenSharingStatus = (event: any) => {
    console.log('Screen sharing status changed:', event);
    logEvent('SCREEN_SHARING_CHANGED', {
      on: event.on
    });
  };
  
  const logEvent = async (eventType: string, data: any) => {
    try {
      await axios.post('http://localhost:4000/api/logs', {
        eventType,
        roomId,
        data
      }, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  };

  return (
    <div className="video-conference-container">
      <div className="meeting-info">
        <h2>Meeting: {roomId}</h2>
        <div className="security-info">
          <span className="secure-badge">Secure Connection</span>
          <span className="encryption-badge">End-to-End Encrypted</span>
        </div>
      </div>
      <div className="jitsi-container" ref={jitsiContainerRef}></div>
    </div>
  );
};

export default VideoConference;