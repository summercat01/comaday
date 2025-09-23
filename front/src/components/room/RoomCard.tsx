'use client'

import React from 'react';
import { Card, CardHeader, CardTitle, Button } from '../ui';
import { LobbyRoom } from '../../types/room';

interface RoomCardProps {
  room: LobbyRoom;
  onJoinRoom: (room: LobbyRoom) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoinRoom }) => {
  const getStatusColor = (memberCount: number, maxMembers: number) => {
    if (memberCount === 0) return 'var(--color-gray-dark)'; // 회색 - 0명
    if (memberCount === maxMembers) return 'var(--color-error)'; // 빨강 - 가득참
    return 'var(--color-success)'; // 초록 - 대기중
  };

  const getStatusText = (memberCount: number, maxMembers: number) => {
    if (memberCount === maxMembers) return '가득참';
    return '대기중';
  };

  return (
    <Card hover className="flex flex-col min-h-[280px] sm:min-h-80">
      {/* 방 헤더 */}
      <CardHeader>
        <div className="flex-1 min-w-0">
          <CardTitle level={3} className="text-sm sm:text-lg mb-1 sm:mb-2 truncate">
            {room.name}
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span 
              className="inline-block px-2 py-1 rounded-full text-xs font-semibold tracking-wide"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'var(--color-secondary)' 
              }}
            >
              방 #{room.roomNumber}
            </span>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: getStatusColor(room.memberCount, room.maxMembers) }}
              ></div>
              <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text-title)' }}>
                {getStatusText(room.memberCount, room.maxMembers)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* 방 정보 */}
      <div className="mb-3 sm:mb-5 flex-1">
        <h4 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: 'var(--color-text-title)' }}>
          📊 방 정보
        </h4>
        <div className="space-y-1 sm:space-y-2">
          <div className="flex justify-between items-center py-1 sm:py-2 px-2 sm:px-3 rounded-lg" 
               style={{ backgroundColor: 'var(--color-gray)' }}>
            <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text)' }}>최대 인원</span>
            <span className="font-semibold text-xs sm:text-sm" style={{ color: 'var(--color-text-title)' }}>
              {room.maxMembers}명
            </span>
          </div>
          <div className="flex justify-between items-center py-1 sm:py-2 px-2 sm:px-3 rounded-lg" 
               style={{ backgroundColor: 'var(--color-gray)' }}>
            <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text)' }}>현재 인원</span>
            <span className="font-semibold text-xs sm:text-sm" style={{ color: 'var(--color-primary-dark)' }}>
              {room.memberCount}명
            </span>
          </div>
        </div>
      </div>

      {/* 인원 현황 */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-4 rounded-xl border-l-4"
           style={{
             backgroundColor: 'var(--color-gray)',
             borderLeftColor: 'var(--color-primary)'
           }}>
        <div className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm" style={{ color: 'var(--color-text-title)' }}>
          👥 {room.memberCount}/{room.maxMembers}
        </div>
        <div className="w-full bg-white rounded-full h-2 sm:h-3 overflow-hidden border" 
             style={{ borderColor: 'var(--color-border)' }}>
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${(room.memberCount / room.maxMembers) * 100}%`,
              backgroundColor: room.memberCount >= room.maxMembers 
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
          variant={room.memberCount >= room.maxMembers ? 'disabled' : 'primary'}
          size="sm"
          fullWidth
          onClick={() => onJoinRoom(room)}
          disabled={room.memberCount >= room.maxMembers}
        >
          {room.memberCount >= room.maxMembers ? '🚫 가득참' : '🚪 입장'}
        </Button>
      </div>
    </Card>
  );
};

export default RoomCard;
