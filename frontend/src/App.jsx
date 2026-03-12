import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from './Header';
import Feed from './Feed';
import CreatePost from './CreatePost';
import Auth from './Auth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main className="pt-40 sm:pt-52 min-h-screen bg-[#f8fafc] px-4 sm:px-6">
          <div className="max-w-3xl mx-auto pb-12">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/create" element={<CreatePost />} />
            </Routes>
          </div>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
