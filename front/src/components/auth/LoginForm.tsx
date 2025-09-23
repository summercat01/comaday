'use client'

import React, { useState } from 'react';
import { Card, CardTitle, Button, Input } from '../ui';
import { authService } from '../../api/services/authService';
import { User } from '../../types/user';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('아이디와 비밀번호를 모두 입력하세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await authService.login({ username, password });
      onLogin(user);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
         style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-background))' }}>
      <Card className="w-full max-w-md animate-slide-up">
        <CardTitle level={2} className="text-3xl text-center mb-8">
          🔐 로그인
        </CardTitle>
        
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <Input
            id="username"
            type="text"
            label="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요"
            autoComplete="off"
            error={error && !username ? '아이디를 입력하세요' : ''}
          />
          
          <Input
            id="password"
            type="password"
            label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            autoComplete="new-password"
            error={error && !password ? '비밀번호를 입력하세요' : ''}
          />

          {error && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            fullWidth 
            loading={isLoading}
          >
            로그인
          </Button>
        </form>
        
        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-light)' }}>
          계정이 없다면 자동으로 생성됩니다
        </p>
      </Card>
    </div>
  );
};

export default LoginForm;
