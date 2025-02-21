"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
  useLocalParticipant,
  useDataChannel,
  TrackToggle,
  useTracks,
} from '@livekit/components-react';
import { ConnectionState, LocalParticipant, Track } from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  name: string;
  message: string;
  timestamp: number;
  isSelf: boolean;
}

interface TokenResult {
  identity: string;
  accessToken: string;
  roomName: string;
}

// Separate component for LiveKit functionality
const LiveKitComponent = ({ onClose }: { onClose: () => void }) => {
  const [transcripts, setTranscripts] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const { localParticipant } = useLocalParticipant();
  const roomState = useConnectionState();
  const tracks = useTracks();

  const localTracks = tracks.filter(
    ({ participant }) => participant instanceof LocalParticipant
  );

  useEffect(() => {
    if (roomState === ConnectionState.Connected && localParticipant) {
      localParticipant.setMicrophoneEnabled(true);
      
      // Get metadata from participant
      const metadata = localParticipant.metadata;
      if (metadata) {
        try {
          const { phoneNumber } = JSON.parse(metadata);
          console.log('Connected user phone number:', phoneNumber);
          
          // Publish initial system message with phone number
          const timestamp = new Date().getTime();
          setTranscripts(prev => [...prev, {
            name: "System",
            message: `Connected with phone number: ${phoneNumber}`,
            timestamp,
            isSelf: false,
          }]);
        } catch (err) {
          console.error('Error parsing metadata:', err);
        }
      }
    }
  }, [roomState, localParticipant]);

  const onDataReceived = useCallback(
    (msg: any) => {
      if (msg.topic === "transcription") {
        const decoded = JSON.parse(
          new TextDecoder("utf-8").decode(msg.payload)
        );
        let timestamp = new Date().getTime();
        if ("timestamp" in decoded && decoded.timestamp > 0) {
          timestamp = decoded.timestamp;
        }
        setTranscripts(prev => [...prev, {
          name: "Agent",
          message: decoded.text,
          timestamp: timestamp,
          isSelf: false,
        }]);
      }
    },
    []
  );

  useDataChannel(onDataReceived);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const timestamp = new Date().getTime();
    setTranscripts(prev => [...prev, {
      name: "You",
      message: chatInput,
      timestamp,
      isSelf: true,
    }]);
    
    if (localParticipant) {
      const encoder = new TextEncoder();
      localParticipant.publishData(
        encoder.encode(
          JSON.stringify({
            text: chatInput,
            timestamp,
          })
        ),
        "transcription"
      );
    }

    setChatInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcripts.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.isSelf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm font-semibold mb-1">{msg.name}</p>
              <p>{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex justify-center mb-4">
          <TrackToggle
            source={Track.Source.Microphone}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {(enabled) => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {enabled ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                )}
              </svg>
            )}
          </TrackToggle>
        </div>

        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </form>
      </div>

      <RoomAudioRenderer />
    </div>
  );
};

const PhoneNumberForm = ({ onSubmit }: { onSubmit: (phoneNumber: string) => void }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    onSubmit(phoneNumber);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Enter your phone number to connect with customer service</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Connect
        </button>
      </form>
    </div>
  );
};

const CustomerServiceWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<TokenResult | null>(null);

  const handleConnect = async (phoneNumber: string) => {
    setError(null);
    setIsConnecting(true);
    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to get token');
      }

      const tokenResult = await response.json();
      setToken(tokenResult);
      setIsConnecting(false);
    } catch (err) {
      setError('Failed to connect to customer service. Please try again.');
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setToken(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Customer Service</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-lg shadow-2xl w-96 overflow-hidden"
        >
          <div className="bg-blue-600 p-4 flex justify-between items-center">
            <h3 className="text-white font-semibold">Customer Service</h3>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-[500px] bg-gray-50 flex flex-col">
            {isConnecting ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : token ? (
              <LiveKitRoom
                token={token.accessToken}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                connect={true}
                audio={true}
              >
                <LiveKitComponent onClose={handleClose} />
              </LiveKitRoom>
            ) : (
              <PhoneNumberForm onSubmit={handleConnect} />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomerServiceWidget;
