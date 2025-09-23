'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MessageProvider, UserProvider } from '../providers'
import RoomPage from '../../page-components/RoomPage'

export default function RoomPageClient() {
  const router = useRouter()
  const params = useParams()
  const roomCode = params?.roomCode as string

  const handleLeaveRoom = () => {
    router.push('/rooms')
  }

  return (
    <MessageProvider>
      <UserProvider>
        <RoomPage 
          roomCode={roomCode}
          onLeaveRoom={handleLeaveRoom}
        />
      </UserProvider>
    </MessageProvider>
  )
}
