'use client'

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { useUser } from '../providers';
import { userService } from '../../api/services/userService';
import { coinService } from '../../api/services/coinService';

interface CoinTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ReceiverUser {
  id: number;
  username: string;
  coinCount: number;
}

export const CoinTransferModal: React.FC<CoinTransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useUser();
  const [receivers, setReceivers] = useState<ReceiverUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && isOpen) {
      userService.getReceivers(currentUser.id).then(setReceivers);
    }
  }, [currentUser, isOpen]);

  const filtered = receivers.filter((user) =>
    user.username.toLowerCase().includes(keyword.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    if (!selectedUserId || !amount || !currentUser) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await coinService.transfer(
        currentUser.id,
        Number(selectedUserId),
        Number(amount)
      );
      
      alert('코인 전송이 완료되었습니다.');
      setAmount('');
      setSelectedUserId('');
      setKeyword('');
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '코인 전송에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSelect = (user: ReceiverUser) => {
    setSelectedUserId(user.id.toString());
    setKeyword(user.username);
    setShowDropdown(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💰 코인 전송"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 받는 사람 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-title)' }}>
            받는 사람
          </label>
          <div className="relative">
            <Input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="사용자 이름을 검색하세요"
              fullWidth
            />
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filtered.map((user) => (
                  <div
                    key={user.id}
                    className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-500">
                      보유 코인: {user.coinCount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 코인 수량 */}
        <Input
          type="number"
          label="코인 수량"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="전송할 코인 수량"
          min="1"
          max={currentUser?.coinCount || 0}
          error={error}
        />
        
        <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
          보유 코인: {currentUser?.coinCount?.toLocaleString() || 0}
        </p>

        {/* 버튼 그룹 */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="danger"
            size="md"
            fullWidth
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant={!selectedUserId || !amount || parseInt(amount) <= 0 ? 'disabled' : 'success'}
            size="md"
            fullWidth
            loading={isSubmitting}
            disabled={!selectedUserId || !amount || parseInt(amount) <= 0}
          >
            💸 전송
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CoinTransferModal;
