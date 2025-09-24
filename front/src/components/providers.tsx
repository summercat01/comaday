'use client'

import React, { useState, useEffect, createContext, useContext } from "react";
import { userService } from "../api/services/userService";
import { User } from "../types/user";
import { coinService } from "../api/services/coinService";

// Types
interface MessageContextType {
  message: { text: string; type: "error" | "success" } | null;
  showError: (text: string) => void;
  showSuccess: (text: string) => void;
  clearMessage: () => void;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isLoaded: boolean;
  login: (user: User) => void;
  logout: () => void;
  sendCoin: (
    toUserId: number,
    amount: number
  ) => Promise<Result<CoinTransferEvent>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

interface CoinTransferEvent {
  type: "COIN_TRANSFER";
  data: {
    fromUser: User;
    toUser: User;
    amount: number;
  };
}

interface Result<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Contexts
const MessageContext = createContext<MessageContextType | null>(null);
const UserContext = createContext<UserContextType | null>(null);

// Hooks
const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context)
    throw new Error("useMessage must be used within a MessageProvider");
  return context;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

// Providers
export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const showError = (text: string) => {
    setMessage({ text, type: "error" });
    setTimeout(() => setMessage(null), 3000);
  };

  const showSuccess = (text: string) => {
    setMessage({ text, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  const clearMessage = () => setMessage(null);

  return (
    <MessageContext.Provider
      value={{ message, showError, showSuccess, clearMessage }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // 초기 상태에서 localStorage 동기 확인하여 스켈레톤 UI 방지
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("currentUser");
        if (saved) {
          const userData = JSON.parse(saved);
          console.log('초기 로딩: localStorage에서 사용자 정보 복원:', userData);
          return userData;
        }
      } catch (error) {
        console.error('초기 로딩: localStorage 사용자 정보 로드 실패:', error);
        localStorage.removeItem("currentUser");
      }
    }
    return null;
  });
  
  const [isLoaded, setIsLoaded] = useState(true); // 즉시 로드됨으로 설정

  // 추가적인 초기화가 필요한 경우에만 useEffect 사용
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('UserProvider 초기화 완료, 현재 사용자:', currentUser);
    }
  }, []);
  const [users, setUsers] = useState<User[]>([]);
  const { showError } = useMessage();

  const login = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
    const found = users.find((u) => u.id === user.id);
    if (!found) setUsers((prev) => [...prev, user]);
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("currentUser");
    }
  };

  const sendCoin = async (
    toUserId: number,
    amount: number
  ): Promise<Result<CoinTransferEvent>> => {
    if (!currentUser) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    const toUser = users.find((u) => u.id === toUserId);
    if (!toUser) {
      return { success: false, message: "받는 사람을 찾을 수 없습니다." };
    }

    if (amount <= 0) {
      return { success: false, message: "올바른 코인 수량을 입력해주세요." };
    }

    if (currentUser.coinCount < amount) {
      return { success: false, message: "보유한 코인이 부족합니다." };
    }

    // 주의: 실제 구현 시 이 부분은 백엔드에서 트랜잭션으로 처리되어야 함
    const updatedUsers = users.map((user) => {
      if (user.id === currentUser.id)
        return { ...user, coinCount: user.coinCount - amount };
      if (user.id === toUserId)
        return { ...user, coinCount: user.coinCount + amount };
      return user;
    });

    setUsers(updatedUsers);
    const updatedCurrentUser = updatedUsers.find(
      (u) => u.id === currentUser.id
    )!;
    setCurrentUser(updatedCurrentUser);

    return {
      success: true,
      data: {
        type: "COIN_TRANSFER",
        data: {
          fromUser: updatedCurrentUser,
          toUser: updatedUsers.find((u) => u.id === toUserId)!,
          amount,
        },
      },
    };
  };

  return (
    <UserContext.Provider
      value={{ currentUser, users, isLoaded, login, logout, sendCoin, setCurrentUser }}
    >
      {children}
    </UserContext.Provider>
  );
};
