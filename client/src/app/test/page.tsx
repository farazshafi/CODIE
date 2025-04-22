"use client"
import useSocket from '@/hooks/useSocket';
import React, { useEffect } from 'react';

const page = () => {
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      // Listen for events from the server
      socket.on('some-event', (data) => {
        console.log('Received data:', data);
      });
    }
  }, [socket]);

  return (
    <div>
      <h1>Collaborative Code Editor</h1>
      {/* Your editor components */}
    </div>
  );
};

export default page;
