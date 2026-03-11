import { PlusIcon, Pen, LogIn, LogOut, User } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext'
import toast from "react-hot-toast";

const Navbar = () => {
  const { logout } = useLogout()
  const { user } = useAuthContext()
  
  const handleLogout = () => {
    logout()
    toast.success("User logged out successfully!");
  }

  return (
    <header className='bg-base-300 border-b border-base-content/10'>
        <div className='mx-auto max-w-6xl p-4'>
            <div className='flex items-center justify-between'>
              <h1 className='text-3xl font-bold text-primary font-mono tracking-tighter'>                
                <Link to={"/"}>
                  <span>Sweden Events</span>
                </Link>
              </h1>
              <div className='flex items-center gap-4'>
                {user && (
                  <div className='parent_div'>
                    <span className='hello-navbar'>Hello, {user.name}!</span>
                  </div>
                )}
                {user && (
                  <button className='btn btn-primary' onClick={handleLogout}>
                    <LogOut className='size-5' />
                    Logout
                  </button>
                )}
                {user && (
                  <Link to={"/create"} className='btn btn-primary'>
                    <PlusIcon className='size-5'/>
                    <span>New Event</span>
                  </Link>
                )}
                {user && user.role === "admin" && (
                  <Link to={"/users"} className='btn btn-primary'>
                    <User className='size-5'/>
                    <span>Users</span>
                  </Link>
                )}
                {user && (
                  <Link to={`/profile/${user.id}`} className="btn btn-primary">                  
                    <User className='size-5'/>
                    <span>My Profile</span>
                  </Link>
                )}
                {!user && (
                  <div>
                    <Link to={"/login"} className='btn btn-primary link-btn'>
                      <LogIn className='size-5'/>
                      <span>Login</span>
                    </Link>
                    
                    <Link to={"/signup"} className='btn btn-primary link-btn'>
                      <Pen className='size-5'/>
                      <span>Signup</span>
                    </Link>
                    
                  </div>
                )}
              </div>
            </div>
        </div>
    </header>
  )
}

export default Navbar