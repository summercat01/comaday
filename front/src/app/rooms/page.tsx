'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { MessageProvider, UserProvider } from '../../components/providers'
import RoomListPage from '../../page-components/RoomListPage'

export default function RoomsPageRoute() {
  const router = useRouter()

  const handleJoinRoom = (roomCode: string) => {
    router.push(`/rooms/${roomCode}`)
  }

  return (
    <MessageProvider>
      <UserProvider>
        <RoomListPage 
          onJoinRoom={handleJoinRoom}
          onCreateRoom={() => {}}
        />
      </UserProvider>
    </MessageProvider>
  )
}
