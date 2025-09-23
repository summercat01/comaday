'use client'

import React from 'react'
import { MessageProvider, UserProvider } from '../../components/providers'
import AdminPage from '../../page-components/AdminPage'

export default function AdminPageRoute() {
  return (
    <MessageProvider>
      <UserProvider>
        <AdminPage />
      </UserProvider>
    </MessageProvider>
  )
}
