import React, { useState, useEffect } from 'react';
import { roomService } from '../api/services/roomService';
import { coinService } from '../api/services/coinService';
import { Room } from '../types/room';
import { useUser } from '../components/providers';
import './RoomPage.css';

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
      <div className="room-container">
        <div className="loading">방 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (!room || !currentUser) {
    return (
      <div className="room-container">
        <div className="error">방을 찾을 수 없습니다.</div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentMember = room.members.find(m => m.userId === currentUser.id && m.status === 'ACTIVE');
  const isHost = room.hostUserId === currentUser.id;
  const otherMembers = room.members.filter(m => m.userId !== currentUser.id && m.status === 'ACTIVE');

  return (
    <div className="room-container">
      {/* 방 헤더 */}
      <div className="room-header">
        <div className="room-info">
          <h1>{room.name}</h1>
          <div className="room-details">
            <span className="room-code">방 코드: {room.roomCode}</span>
            <span className={`room-status ${room.status.toLowerCase()}`}>
              {room.status === 'ACTIVE' ? '활성' : '종료'}
            </span>
          </div>
          {room.description && <p className="room-description">{room.description}</p>}
        </div>
        
        <div className="room-actions">
          {room.status === 'ACTIVE' && (
            <button 
              className="transfer-btn"
              onClick={() => setShowTransfer(true)}
            >
              💰 포인트 전송
            </button>
          )}
          
          {room.status === 'CLOSED' && (
            <div className="game-finished-notice">
              🏁 방이 종료되었습니다
            </div>
          )}
          
          {isHost && room.status === 'ACTIVE' && (
            <button
              className="close-btn"
              onClick={handleCloseRoom}
            >
              방 닫기
            </button>
          )}
          
          <button 
            className="leave-btn"
            onClick={handleLeaveRoom}
          >
            방 나가기
          </button>
        </div>
      </div>

      {/* 멤버 목록 */}
      <div className="members-section">
        <h2>참가자 ({room.memberCount}/{room.maxMembers})</h2>
        
        <div className="members-grid">
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
                className={`member-card ${member.userId === currentUser.id ? 'current-user' : ''}`}
              >
                <div className="member-info">
                  <div className="member-name">
                    {member.user.username}
                    {member.userId === room.hostUserId && (
                      <span className="host-badge">방장</span>
                    )}
                  </div>
                  <div className="member-points">
                    {member.user.coinCount} 코인
                  </div>
                </div>
                
                <div className="member-status">
                  {member.userId === room.hostUserId && (
                    <span className="host-status">호스트</span>
                  )}
                </div>
              </div>
            ))}
        </div>
        
        {/* 방 참가자 정보 */}
        <div className="member-count">
          참가자: {room.members.filter(m => m.status === 'ACTIVE').length}/{room.maxMembers}명
        </div>
      </div>

      {/* 방 정보 */}
      <div className="game-info">
        <h3>방 정보</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">최대 인원:</span>
            <span className="value">{room.maxMembers}명</span>
          </div>
          <div className="info-item">
            <span className="label">연속 거래 제한:</span>
            <span className="value">동일 상대 3회 연속 후 제한</span>
          </div>
          {room.startedAt && (
            <div className="info-item">
              <span className="label">방 생성:</span>
              <span className="value">{new Date(room.startedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* 포인트 전송 모달 */}
      {showTransfer && (
        <div className="modal-overlay" onClick={() => setShowTransfer(false)}>
          <div className="transfer-modal" onClick={(e) => e.stopPropagation()}>
            <h2>포인트 전송</h2>
            
            <div className="form-group">
              <label>받는 사람:</label>
              <select
                value={selectedReceiver}
                onChange={(e) => setSelectedReceiver(e.target.value)}
              >
                <option value="">받는 사람을 선택하세요</option>
                {otherMembers.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.username} ({member.user.coinCount} 코인)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>전송할 포인트:</label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="전송할 포인트를 입력하세요"
                min="1"
                max={currentUser?.coinCount || 0}
              />
            </div>
            
            <div className="modal-buttons">
              <button 
                className="cancel-btn"
                onClick={() => setShowTransfer(false)}
              >
                취소
              </button>
              <button 
                className="transfer-confirm-btn"
                onClick={handleCoinTransfer}
                disabled={!selectedReceiver || !transferAmount || parseInt(transferAmount) <= 0}
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
