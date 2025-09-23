'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardTitle } from '../ui';
import { UserInfo } from '../auth';
import { rankingService } from '../../api/services/rankingService';
import { RankingUser } from '../../types/ranking';

export const RankingTable: React.FC = () => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await rankingService.getRankingsWithRank();
        setRankings(data);
      } catch (error) {
        console.error('랭킹 조회 실패:', error);
        setError('랭킹을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRankings();
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p style={{ color: 'var(--color-text-light)' }}>랭킹을 불러오는 중...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p style={{ color: 'var(--color-error)' }}>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <UserInfo rankings={rankings} />
      <Card>
        <CardTitle level={2} className="mb-5 text-center">
          🏆 랭킹
        </CardTitle>
        <div className="overflow-hidden rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' }}>
              <tr>
                <th className="px-6 py-4 text-center font-semibold">순위</th>
                <th className="px-6 py-4 text-left font-semibold">이름</th>
                <th className="px-6 py-4 text-center font-semibold">코인</th>
              </tr>
            </thead>
            <tbody style={{ borderColor: 'var(--color-border)' }} className="divide-y">
              {rankings.map((user, index) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-opacity-50"
                  style={{
                    backgroundColor: index % 2 === 0 ? 'var(--color-card-bg)' : 'var(--color-gray-main)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--color-card-bg)' : 'var(--color-gray-main)'}
                >
                  <td className="px-6 py-4 text-center font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                    {user.rank}
                  </td>
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-text-title)' }}>
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold" style={{ color: 'var(--color-success)' }}>
                    {user.totalCoins.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default RankingTable;
