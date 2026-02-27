import React from 'react'

import {Route, Routes} from "react-router";

import { HomePage } from "./pages/HomePage";
import CreatePage from "./pages/CreatePage.jsx";
import EventDetailPage from "./pages/EventDetailPage";
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

const App = () => {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage/>} />
        <Route path="/event/:id" element={<EventDetailPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignupPage/>} />
      </Routes>
    </div>
  )
}

export default App