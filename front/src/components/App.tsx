'use client'

import React, { useState } from "react";
import { MessageProvider, UserProvider } from "./providers";
import MainContent from "./MainContent";
import RoomListPage from "../page-components/RoomListPage";
import RoomPage from "../page-components/RoomPage";

type AppState = 'main' | 'rooms' | 'room';

const App = () => {
  const [currentPage, setCurrentPage] = useState<AppState>('main');
  const [currentRoomCode, setCurrentRoomCode] = useState<string>('');

  const handleGoToRooms = () => {
    setCurrentPage('rooms');
  };

  const handleJoinRoom = (roomCode: string) => {
    setCurrentRoomCode(roomCode);
    setCurrentPage('room');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomCode('');
    setCurrentPage('main');
  };

  const handleCreateRoom = () => {
    // 방 생성 기능은 나중에 구현
    alert('방 생성 기능은 준비 중입니다.');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'rooms':
        return (
          <RoomListPage 
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
          />
        );
      case 'room':
        return (
          <RoomPage 
            roomCode={currentRoomCode}
            onLeaveRoom={handleLeaveRoom}
          />
        );
      default:
        return <MainContent onGoToRooms={handleGoToRooms} />;
    }
  };

  return (
    <MessageProvider>
      <UserProvider>
        {renderCurrentPage()}
      </UserProvider>
    </MessageProvider>
  );
};

export default App;