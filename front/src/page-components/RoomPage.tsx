'use client'

import React, { useState, useEffect } from 'react';
import { roomService } from '../api/services/roomService';
import { coinService } from '../api/services/coinService';
import { Room } from '../types/room';
import { useUser } from '../components/providers';

interface RoomPageProps {
  roomCode: string;
  onLeaveRoom: () => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ roomCode, onLeaveRoom }) => {
  const { currentUser } = useUser();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState('');

  useEffect(() => {
    loadRoomData();
    const interval = setInterval(loadRoomData, 3000); // 3초마다 새로고침
    return () => clearInterval(interval);
  }, [roomCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRoomData = async () => {
    try {
      const roomData = await roomService.getRoomByCode(roomCode);
      setRoom(roomData);
    } catch (error) {
      console.error('방 정보 로딩 실패:', error);
      alert('방 정보를 불러올 수 없습니다.');
      onLeaveRoom();
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentUser || !room) return;
    
    if (window.confirm('정말 방에서 나가시겠습니까?')) {
      try {
        await roomService.leaveRoom(roomCode, currentUser.id);
        onLeaveRoom();
      } catch (error) {
        console.error('방 나가기 실패:', error);
        alert('방 나가기에 실패했습니다.');
      }
    }
  };

  const handleCloseRoom = async () => {
    if (!currentUser || !room) return;
    
    if (window.confirm('방을 닫으시겠습니까? (모든 참가자가 나가게 됩니다)')) {
      try {
        await roomService.closeRoom(roomCode, currentUser.id);
        alert('방이 닫혔습니다.');
        onLeaveRoom();
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || '방 닫기에 실패했습니다.';
        alert(errorMessage);
      }
    }
  };

  const handleCoinTransfer = async () => {
    if (!currentUser || !room || !selectedReceiver || !transferAmount) return;
    
    try {
      await coinService.transfer(
        currentUser.id,
        parseInt(selectedReceiver),
        parseInt(transferAmount),
        room.roomCode // 방 코드를 포함하여 방별 거래 제한 적용
      );
      
      setShowTransfer(false);
      setTransferAmount('');
      setSelectedReceiver('');
      loadRoomData();
      alert('포인트 전송이 완료되었습니다.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '포인트 전송에 실패했습니다.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="card text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">방 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!room || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="card text-center">
          <h2 className="text-red-500 text-2xl font-bold mb-4">⚠️ 오류</h2>
          <p className="text-gray-600 text-lg">방을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentMember = room.members.find(m => m.userId === currentUser.id && m.status === 'ACTIVE');
  const isHost = room.hostUserId === currentUser.id;
  const otherMembers = room.members.filter(m => m.userId !== currentUser.id && m.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 방 헤더 */}
        <div className="card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-coma-dark mb-3">{room.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <span className="inline-block px-4 py-2 bg-coma-blue text-white rounded-full font-semibold">
                  방 코드: {room.roomCode}
                </span>
                <span className={`inline-block px-4 py-2 rounded-full font-semibold ${
                  room.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {room.status === 'ACTIVE' ? '✅ 활성' : '🚫 종료'}
                </span>
              </div>
              {room.description && (
                <p className="text-gray-700 text-lg">{room.description}</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {room.status === 'ACTIVE' && (
                <button 
                  className="btn-success flex items-center gap-2"
                  onClick={() => setShowTransfer(true)}
                >
                  💰 포인트 전송
                </button>
              )}
              
              {room.status === 'CLOSED' && (
                <div className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">
                  🏁 방이 종료되었습니다
                </div>
              )}
              
              {isHost && room.status === 'ACTIVE' && (
                <button
                  className="btn-danger flex items-center gap-2"
                  onClick={handleCloseRoom}
                >
                  🚪 방 닫기
                </button>
              )}
              
              <button 
                className="btn-primary flex items-center gap-2"
                onClick={handleLeaveRoom}
              >
                🏠 방 나가기
              </button>
            </div>
          </div>
        </div>

        {/* 멤버 목록 */}
        <div className="card">
          <h2 className="card-title mb-6">
            👥 참가자 ({room.memberCount}/{room.maxMembers})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {room.members
              .filter(m => m.isActive)
              .sort((a, b) => {
                if (a.userId === room.hostUserId) return -1;
                if (b.userId === room.hostUserId) return 1;
                return a.user.username.localeCompare(b.user.username);
              })
              .map((member) => (
                <div 
                  key={member.id} 
                  className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                    member.userId === currentUser.id 
                      ? 'border-coma-blue bg-blue-50 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-coma-blue hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-coma-dark text-lg">
                        {member.user.username}
                      </h3>
                      {member.userId === room.hostUserId && (
                        <span className="px-2 py-1 bg-coma-red text-white rounded-full text-xs font-semibold">
                          👑 방장
                        </span>
                      )}
                    </div>
                    {member.userId === currentUser.id && (
                      <span className="px-2 py-1 bg-coma-blue text-white rounded-full text-xs font-semibold">
                        나
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-coma-green font-bold text-xl">
                      💰 {member.user.coinCount.toLocaleString()} 코인
                    </span>
                  </div>
                  
                  {member.userId === room.hostUserId && (
                    <div className="mt-3 text-center">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        🔑 호스트
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>
          
          {/* 방 참가자 정보 */}
          <div className="mt-6 p-4 bg-gray-100 rounded-xl text-center">
            <span className="text-coma-dark font-semibold">
              총 참가자: {room.members.filter(m => m.status === 'ACTIVE').length}/{room.maxMembers}명
            </span>
          </div>
        </div>

        {/* 방 정보 */}
        <div className="card">
          <h3 className="card-title mb-6">ℹ️ 방 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 font-medium mb-1">최대 인원</span>
              <span className="text-lg font-bold text-coma-dark">{room.maxMembers}명</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 font-medium mb-1">연속 거래 제한</span>
              <span className="text-lg font-bold text-coma-dark">동일 상대 3회 연속 후 제한</span>
            </div>
            {room.startedAt && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 font-medium mb-1">방 생성</span>
                <span className="text-lg font-bold text-coma-dark">
                  {new Date(room.startedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 포인트 전송 모달 */}
        {showTransfer && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5 z-50 animate-fade-in"
            onClick={() => setShowTransfer(false)}
          >
            <div 
              className="card w-full max-w-md animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-center text-coma-dark mb-6">💰 포인트 전송</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-coma-dark">받는 사람:</label>
                  <select
                    value={selectedReceiver}
                    onChange={(e) => setSelectedReceiver(e.target.value)}
                    className="input-field"
                  >
                    <option value="">받는 사람을 선택하세요</option>
                    {otherMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.user.username} ({member.user.coinCount.toLocaleString()} 코인)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-coma-dark">전송할 포인트:</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="전송할 포인트를 입력하세요"
                    className="input-field"
                    min="1"
                    max={currentUser?.coinCount || 0}
                  />
                  <p className="text-xs text-gray-600">
                    보유 코인: {currentUser?.coinCount?.toLocaleString() || 0}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    className="btn-danger flex-1"
                    onClick={() => setShowTransfer(false)}
                  >
                    취소
                  </button>
                  <button 
                    className={
                      !selectedReceiver || !transferAmount || parseInt(transferAmount) <= 0
                        ? "btn-disabled flex-1"
                        : "btn-success flex-1"
                    }
                    onClick={handleCoinTransfer}
                    disabled={!selectedReceiver || !transferAmount || parseInt(transferAmount) <= 0}
                  >
                    💸 전송
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
