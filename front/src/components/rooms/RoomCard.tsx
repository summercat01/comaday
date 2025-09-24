'use client'

import React from 'react';
import { Card, CardHeader, CardTitle, Button } from '../ui';
import { LobbyRoom } from '../../types/room';

interface RoomCardProps {
  room: LobbyRoom;
  onJoinRoom: (room: LobbyRoom) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoinRoom }) => {
  // 방 번호에 따른 최대 인원 설정 (1-6번: 2명, 7-11번: 3명)
  const getMaxMembers = (roomNumber: number) => {
    return roomNumber >= 1 && roomNumber <= 6 ? 2 : 3;
  };

  const maxMembers = getMaxMembers(room.roomNumber);

  const getStatusColor = (memberCount: number, maxMembers: number) => {
    if (memberCount === 0) return 'var(--color-gray-dark)'; // 회색 - 0명
    if (memberCount === maxMembers) return 'var(--color-error)'; // 빨강 - 가득참
    return 'var(--color-success)'; // 초록 - 대기중
  };


  return (
    <Card hover className="flex flex-col min-h-[320px] sm:min-h-96 relative">
      {/* 상태 표시등 - 오른쪽 상단 */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: getStatusColor(room.memberCount, maxMembers) }}
        ></div>
      </div>

      {/* 방 헤더 */}
      <CardHeader>
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <span 
              className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide w-fit"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'var(--color-secondary)' 
              }}
            >
              No.{room.roomNumber}
            </span>
          </div>
          <CardTitle level={3} className="text-sm sm:text-lg truncate">
            {room.name}
          </CardTitle>
        </div>
      </CardHeader>

      {/* 게임 정보 */}
      <div className="mb-2 sm:mb-3 p-2 sm:p-3 rounded-lg"
           style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}>
        <div className="font-semibold mb-1 text-xs sm:text-sm" style={{ color: 'var(--color-text-title)' }}>
          🎮 게임
        </div>
        <div className="text-xs sm:text-sm" style={{ color: 'var(--color-success)' }}>
          {room.gameName || '게임 미정'}
        </div>
      </div>

      {/* 인원 현황 */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-4 rounded-xl border-l-4"
           style={{
             backgroundColor: 'var(--color-gray)',
             borderLeftColor: 'var(--color-primary)'
           }}>
        <div className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm" style={{ color: 'var(--color-text-title)' }}>
          👥 {room.memberCount}/{maxMembers}
        </div>
        <div className="w-full bg-white rounded-full h-2 sm:h-3 overflow-hidden border" 
             style={{ borderColor: 'var(--color-border)' }}>
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${(room.memberCount / maxMembers) * 100}%`,
              backgroundColor: room.memberCount >= maxMembers 
                ? 'var(--color-error)' 
                : room.memberCount > 0 
                  ? 'var(--color-success)' 
                  : 'var(--color-gray-dark)'
            }}
          ></div>
        </div>
      </div>

      {/* 입장 버튼 */}
      <div className="mt-auto pt-2 sm:pt-4">
        <Button
          variant={room.memberCount >= maxMembers ? 'disabled' : 'primary'}
          size="sm"
          fullWidth
          onClick={() => onJoinRoom(room)}
          disabled={room.memberCount >= maxMembers}
        >
          {room.memberCount >= maxMembers ? '🚫 가득참' : '입장'}
        </Button>
      </div>
    </Card>
  );
};

export default RoomCard;
