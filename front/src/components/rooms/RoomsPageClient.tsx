'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { MessageProvider, UserProvider } from '../providers'
import RoomListPage from '../../page-components/RoomListPage'

export default function RoomsPageClient() {
  const router = useRouter()

  const handleJoinRoom = (roomCode: string) => {
    router.push(`/rooms/${roomCode}`)
  }

  const handleCreateRoom = () => {
    alert('방 생성 기능은 준비 중입니다.')
  }

  const handleGoBack = () => {
    router.push('/')
  }

  return (
    <MessageProvider>
      <UserProvider>
        <RoomListPage 
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          onGoBack={handleGoBack}
        />
      </UserProvider>
    </MessageProvider>
  )
}
