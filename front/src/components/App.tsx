'use client'

import React from "react";
import { MessageProvider, UserProvider } from "./providers";
import MainContent from "./MainContent";

const App = () => {
  return (
    <MessageProvider>
      <UserProvider>
        <MainContent />
      </UserProvider>
    </MessageProvider>
  );
};

export default App;