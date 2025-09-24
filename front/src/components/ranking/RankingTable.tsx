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

  // 로딩 중일 때는 테이블 구조는 유지하고 데이터만 스켈레톤 표시
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr
        key={`skeleton-${index}`}
        className="animate-pulse"
        style={{
          backgroundColor: index % 2 === 0 ? 'var(--color-card-bg)' : 'var(--color-gray)',
        }}
      >
        <td className="px-6 py-4 text-center">
          <div className="h-4 bg-gray-300 rounded w-6 mx-auto"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
        </td>
      </tr>
    ));
  };

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
              {loading ? (
                // 로딩 중일 때는 스켈레톤 행들 표시
                renderSkeletonRows()
              ) : (
                // 데이터 로드 완료 시 실제 랭킹 데이터 표시
                rankings.map((user, index) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default RankingTable;
