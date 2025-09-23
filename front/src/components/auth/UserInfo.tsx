'use client'

import React from 'react';
import { Card } from '../ui';
import { RankingUser } from '../../types/ranking';
import { useUser } from '../providers';

interface UserInfoProps {
  rankings: RankingUser[];
}

export const UserInfo: React.FC<UserInfoProps> = ({ rankings }) => {
  const { currentUser } = useUser();
  
  if (!currentUser) return null;
  
  const myRanking = rankings.find((r) => r.id === currentUser.id);
  if (!myRanking) return null;

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-center text-lg font-semibold" style={{ color: 'var(--color-text-title)' }}>
        <span className="px-3">번호: {myRanking.id}</span>
        <span style={{ color: 'var(--color-text-light)' }}>|</span>
        <span className="px-3">{myRanking.username}</span>
        <span style={{ color: 'var(--color-text-light)' }}>|</span>
        <span className="px-3" style={{ color: 'var(--color-primary-dark)' }}>
          코인: {myRanking.totalCoins.toLocaleString()}
        </span>
      </div>
    </Card>
  );
};

export default UserInfo;
