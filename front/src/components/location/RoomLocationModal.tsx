'use client'

import React from 'react';
import { Card, CardTitle, Button } from '../ui';

// 이미지 캐시 버스팅을 위한 버전 상수
const IMAGE_VERSION = '20241225_v2';

interface RoomLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoomLocationModal: React.FC<RoomLocationModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-2xl font-bold">
            🗺️ 게임 방 위치 안내
          </CardTitle>
          <Button
            variant="danger"
            size="sm"
            onClick={onClose}
            className="ml-4"
          >
            ✕
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="text-center mb-4">
            <p className="text-lg mb-2" style={{ color: 'var(--color-text-light)' }}>
              보드게임 카페 내 게임 방 배치도
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
              각 방의 위치를 확인하여 원하는 방을 찾아보세요
            </p>
          </div>
          
          {/* 방 위치 이미지 */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <img
              src={`/room-layout.png?v=${IMAGE_VERSION}`}
              alt="게임 방 배치도"
              className="w-full h-auto rounded-lg shadow-lg max-w-full object-contain"
              style={{ maxHeight: '500px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* 이미지 로드 실패 시 대체 컨텐츠 */}
            <div className="hidden text-center py-16">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-title)' }}>
                게임 방 배치도
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto text-sm">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <div className="font-bold text-blue-800">1-3번 방</div>
                  <div className="text-blue-600">입구 근처</div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="font-bold text-green-800">4-6번 방</div>
                  <div className="text-green-600">중앙 구역</div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <div className="font-bold text-purple-800">7-9번 방</div>
                  <div className="text-purple-600">창가 구역</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <div className="font-bold text-orange-800">10-11번 방</div>
                  <div className="text-orange-600">조용한 구역</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RoomLocationModal;
