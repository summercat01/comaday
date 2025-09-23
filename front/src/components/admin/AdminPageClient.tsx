'use client'

import React from 'react'
import { MessageProvider, UserProvider } from '../providers'
import AdminPage from '../../page-components/AdminPage'

export default function AdminPageClient() {
  return (
    <MessageProvider>
      <UserProvider>
        <AdminPage />
      </UserProvider>
    </MessageProvider>
  )
}
