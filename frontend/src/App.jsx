import React from 'react'
import { Route, Routes, Navigate } from "react-router";
import { useSelector } from "react-redux";

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage.jsx";
import EventDetailPage from "./pages/EventDetailPage";
import UserDetailPage from "./pages/UserDetailPage.jsx";
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { UsersPage } from './pages/UsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ChangePasswordPage from './pages/ChangePaswordPage';
import AdminAnalytics from "./pages/AdminAnalytics.jsx";

const App = () => {
  const user = useSelector((s) => s.auth.user);

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/create"
          element={user ? <CreatePage /> : <Navigate to="/login" />}
        />

        <Route path="/event/:id" element={<EventDetailPage />} />

        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" />}
        />

        <Route
          path="/signup"
          element={!user ? <SignupPage /> : <Navigate to="/" />}
        />

        <Route
          path="/users"
          element={
            user && user.user.role === "admin" ? (
              <UsersPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/user/:id"
          element={
            user && user.user.role === "admin" ? (
              <UserDetailPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/profile/:id"
          element={user ? <ProfilePage /> : <Navigate to="/" />}
        />

        <Route
          path="/change-password/:id"
          element={user ? <ChangePasswordPage /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/analytics"
          element={
            user && user.user.role === "admin" ? (
              <AdminAnalytics />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
