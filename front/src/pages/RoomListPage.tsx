import React, { useState, useEffect } from 'react';
import { roomService } from '../api/services/roomService';
import { Room, CreateRoomDto } from '../types/room';
import { useUser } from '../components/providers';
import './RoomListPage.css';

interface RoomListPageProps {
  onJoinRoom: (roomCode: string) => void;
  onCreateRoom: () => void;
}

const RoomListPage: React.FC<RoomListPageProps> = ({ onJoinRoom, onCreateRoom }) => {
  const { currentUser } = useUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    maxMembers: 10,
    initialPoints: 1000,
    transactionLimit: 3,
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRooms(1, 20);
      setRooms(response.rooms);
    } catch (error) {
      console.error('방 목록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!currentUser) return;
    
    try {
      setCreateLoading(true);
      const createRoomDto: CreateRoomDto = {
        ...newRoom,
        hostUserId: currentUser.id,
      };
      
      const room = await roomService.createRoom(createRoomDto);
      setShowCreateModal(false);
      onJoinRoom(room.roomCode); // 생성한 방으로 바로 이동
    } catch (error) {
      console.error('방 생성 실패:', error);
      alert('방 생성에 실패했습니다.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    if (!currentUser) return;

    try {
      await roomService.joinRoom(roomCode, currentUser.id);
      onJoinRoom(roomCode);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '방 입장에 실패했습니다.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="room-list-container">
        <div className="loading">방 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h1>게임 방 목록</h1>
        <div className="room-actions">
          <button 
            className="create-room-btn"
            onClick={() => setShowCreateModal(true)}
          >
            새 방 만들기
          </button>
          <button 
            className="refresh-btn"
            onClick={loadRooms}
          >
            새로고침
          </button>
        </div>
      </div>

      <div className="room-grid">
        {rooms.length === 0 ? (
          <div className="no-rooms">
            <p>현재 대기 중인 방이 없습니다.</p>
            <p>새 방을 만들어 게임을 시작해보세요!</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <h3 className="room-name">{room.name}</h3>
                <span className={`room-status ${room.status.toLowerCase()}`}>
                  {room.status === 'ACTIVE' ? '활성' : '종료'}
                </span>
              </div>
              
              {room.description && (
                <p className="room-description">{room.description}</p>
              )}
              
              <div className="room-info">
                <div className="info-item">
                  <span className="label">참가자:</span>
                  <span className="value">{room.memberCount}/{room.maxMembers}</span>
                </div>
                <div className="info-item">
                  <span className="label">상태:</span>
                  <span className="value">{room.status === 'ACTIVE' ? '활성' : '종료'}</span>
                </div>
                <div className="info-item">
                  <span className="label">방 코드:</span>
                  <span className="value room-code">{room.roomCode}</span>
                </div>
              </div>
              
              <div className="room-footer">
                {room.status === 'ACTIVE' && room.memberCount < room.maxMembers ? (
                  <button 
                    className="join-btn"
                    onClick={() => handleJoinRoom(room.roomCode)}
                  >
                    입장하기
                  </button>
                ) : (
                  <button className="join-btn disabled" disabled>
                    {room.status === 'CLOSED' ? '종료된 방' : 
                     room.memberCount >= room.maxMembers ? '정원 초과' : '입장 불가'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 방 생성 모달 */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-room-modal" onClick={(e) => e.stopPropagation()}>
            <h2>새 방 만들기</h2>
            
            <div className="form-group">
              <label>방 이름 *</label>
              <input
                type="text"
                value={newRoom.name}
                onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                placeholder="방 이름을 입력하세요"
                maxLength={50}
              />
            </div>
            
            <div className="form-group">
              <label>방 설명</label>
              <textarea
                value={newRoom.description}
                onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                placeholder="방에 대한 설명을 입력하세요 (선택사항)"
                maxLength={200}
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label>최대 인원</label>
              <select
                value={newRoom.maxMembers}
                onChange={(e) => setNewRoom({...newRoom, maxMembers: parseInt(e.target.value)})}
              >
                {[2, 3, 4, 5, 6, 8].map(num => (
                  <option key={num} value={num}>{num}명</option>
                ))}
              </select>
            </div>
            
            <div className="info-notice">
              <h4>📋 안내사항</h4>
              <ul>
                <li><strong>포인트 관리:</strong> 관리자가 행사 전에 일괄 지급합니다</li>
                <li><strong>연속 거래 제한:</strong> 동일 상대와 3회 연속 거래 후 자동 제한</li>
                <li><strong>오프라인 게임:</strong> 실제 테이블에서 보드게임을 진행하세요</li>
              </ul>
            </div>
            
            <div className="modal-buttons">
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                취소
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateRoom}
                disabled={!newRoom.name.trim() || createLoading}
              >
                {createLoading ? '생성 중...' : '방 만들기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomListPage;
