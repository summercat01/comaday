import React, { useState } from 'react';
import { useUser } from '../components/providers';

interface RoomListPageProps {
  onJoinRoom: (roomCode: string) => void;
  onCreateRoom: () => void;
}

interface MockRoom {
  id: number;
  roomNumber: string;
  title: string;
  gameList: string[];
  maxMembers: number;
  currentMembers: string[];
  status: 'waiting' | 'playing' | 'full';
}

// 미리 정의된 11개 방 데이터
const MOCK_ROOMS: MockRoom[] = [
  {
    id: 1,
    roomNumber: 'R001',
    title: '초보자 환영방',
    gameList: ['할리갈리', '뱅!', '카탄'],
    maxMembers: 2,
    currentMembers: [],
    status: 'waiting'
  },
  {
    id: 2,
    roomNumber: 'R002',
    title: '전략게임 전용',
    gameList: ['카탄', '푸에르토리코', '농장주'],
    maxMembers: 2,
    currentMembers: ['김철수'],
    status: 'waiting'
  },
  {
    id: 3,
    roomNumber: 'R003',
    title: '파티게임 천국',
    gameList: ['인사이더', '딕싯', '디포머'],
    maxMembers: 2,
    currentMembers: ['이영희', '박민수'],
    status: 'full'
  },
  {
    id: 4,
    roomNumber: 'R004',
    title: '고급자 전용방',
    gameList: ['테라포밍 마스', '글룸헤이븐', '스피릿 아일랜드'],
    maxMembers: 2,
    currentMembers: ['정지훈'],
    status: 'playing'
  },
  {
    id: 5,
    roomNumber: 'R005',
    title: '빠른 게임방',
    gameList: ['스플렌더', '킹 오브 토쿄', '러브레터'],
    maxMembers: 2,
    currentMembers: [],
    status: 'waiting'
  },
  {
    id: 6,
    roomNumber: 'R006',
    title: '협력게임 좋아요',
    gameList: ['팬데믹', '포비든 아일랜드', '매직 메이즈'],
    maxMembers: 2,
    currentMembers: ['최유진', '강호동'],
    status: 'playing'
  },
  {
    id: 7,
    roomNumber: 'R007',
    title: '덱빌딩 마니아',
    gameList: ['도미니언', '썬더스톤', '애센션'],
    maxMembers: 2,
    currentMembers: ['오승환'],
    status: 'waiting'
  },
  {
    id: 8,
    roomNumber: 'R008',
    title: '추리게임 전문',
    gameList: ['마피아', '원나잇 인랑', '더 레지스탕스'],
    maxMembers: 2,
    currentMembers: [],
    status: 'waiting'
  },
  {
    id: 9,
    roomNumber: 'R009',
    title: '카드게임 중심',
    gameList: ['UNO', '하트', '스카이조'],
    maxMembers: 2,
    currentMembers: ['김민지', '서준호'],
    status: 'full'
  },
  {
    id: 10,
    roomNumber: 'R010',
    title: '보드게임 카페',
    gameList: ['모노폴리', '루미큐브', '젠가'],
    maxMembers: 2,
    currentMembers: ['한예슬'],
    status: 'waiting'
  },
  {
    id: 11,
    roomNumber: 'R011',
    title: '신작게임 체험방',
    gameList: ['아컴호러', '사이즈', '윙스팬'],
    maxMembers: 2,
    currentMembers: [],
    status: 'waiting'
  }
];

const RoomListPage: React.FC<RoomListPageProps> = ({ onJoinRoom }) => {
  const { currentUser } = useUser();
  const [rooms] = useState<MockRoom[]>(MOCK_ROOMS);

  // 방 상태에 따른 원 색깔 결정
  const getStatusColor = (room: MockRoom) => {
    const memberCount = room.currentMembers.length;
    const maxMembers = room.maxMembers;
    
    if (memberCount === 0) return '#gray'; // 회색 - 0명
    if (memberCount === maxMembers) return '#ff4757'; // 빨강 - 만원
    return '#2ed573'; // 초록 - 대기중
  };

  // 방 상태 텍스트
  const getStatusText = (room: MockRoom) => {
    if (room.status === 'playing') return '대기중';
    if (room.status === 'full') return '가득참';
    return '대기중';
  };

  const handleJoinRoom = (room: MockRoom) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (room.status === 'full') {
      alert('방이 가득 찼습니다.');
      return;
    }

    onJoinRoom(room.roomNumber);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-5 max-w-6xl mx-auto">
        <div className="text-center py-15 card">
          <h2 className="text-red-500 text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 text-lg">방 목록을 보려면 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 max-w-6xl mx-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center mb-8 card">
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--color-text-title)' }}>🎲 게임 방 목록</h1>
        <div className="text-lg font-medium" style={{ color: 'var(--color-text-light)' }}>총 {rooms.length}개의 방</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto">
        {rooms.map((room) => (
          <div key={room.id} className="card hover-lift min-h-80 flex flex-col">
            {/* 방 헤더 */}
            <div className="card-header">
              <div className="flex-1">
                <h3 className="card-title">{room.title}</h3>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold tracking-wide"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' }}>
                  {room.roomNumber}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                  style={{
                    backgroundColor: room.currentMembers.length === 0 ? 'var(--color-gray-dark)' :
                                   room.currentMembers.length === room.maxMembers ? 'var(--color-error)' : 'var(--color-success)'
                  }}
                ></div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-title)' }}>{getStatusText(room)}</span>
              </div>
            </div>

            {/* 게임 목록 */}
            <div className="mb-5 flex-1">
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-title)' }}>🎮 게임 목록</h4>
              <div className="flex flex-wrap gap-2">
                {room.gameList.map((game, index) => (
                  <span key={index} className="tag-game">{game}</span>
                ))}
              </div>
            </div>

            {/* 인원 정보 */}
            <div className="mb-5 p-4 rounded-xl border-l-4" 
                 style={{ 
                   backgroundColor: 'var(--color-gray)', 
                   borderLeftColor: 'var(--color-primary)' 
                 }}>
              <div className="font-semibold mb-2" style={{ color: 'var(--color-text-title)' }}>
                👥 {room.currentMembers.length}/{room.maxMembers}명
              </div>
              <div className="flex flex-wrap gap-2">
                {room.currentMembers.length > 0 ? (
                  room.currentMembers.map((member, index) => (
                    <span key={index} className="tag-member">{member}</span>
                  ))
                ) : (
                  <span className="italic text-sm" style={{ color: 'var(--color-text-light)' }}>대기 중인 인원이 없습니다</span>
                )}
              </div>
            </div>

            {/* 입장 버튼 */}
            <div className="mt-auto pt-4">
              <button 
                className={room.status === 'full' ? 'btn-disabled w-full' : 'btn-success w-full'}
                onClick={() => handleJoinRoom(room)}
                disabled={room.status === 'full'}
              >
                {room.status === 'full' ? '🚫 가득참' : '🚪 입장하기'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomListPage;