import { PlusIcon, Pen, LogIn, LogOut, User, Menu, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("User logged out successfully!");
    setOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="bg-base-300 border-b border-base-content/10 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <h1 className="text-3xl font-bold text-primary font-mono tracking-tighter">
            <Link to="/" onClick={() => { setOpen(false); setProfileOpen(false); }}>
              Sweden Events
            </Link>
          </h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">

            {user && (
              <div className="relative">
                <button
                  className="btn btn-ghost flex items-center gap-2"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-8">
                      <span className="text-sm font-bold">
                        {user.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {user.user.name}
                  <ChevronDown className="size-4" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-base-100 shadow-lg rounded-lg p-2 animate-fadeIn">
                    <Link
                      to={`/profile/${user.user.id}`}
                      className="btn btn-ghost w-full justify-start"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Profile
                    </Link>

                    {user.user.role === "admin" && (
                      <Link
                        to="/users"
                        className="btn btn-ghost w-full justify-start"
                        onClick={() => setProfileOpen(false)}
                      >
                        Users
                      </Link>
                    )}

                    <Link
                      to="/create"
                      className="btn btn-ghost w-full justify-start"
                      onClick={() => setProfileOpen(false)}
                    >
                      <PlusIcon className="size-4" />
                      New Event
                    </Link>

                    <button
                      className="btn btn-ghost w-full justify-start text-error"
                      onClick={handleLogout}
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <>
                <Link to="/login" className="btn btn-primary link-btn">
                  <LogIn className="size-5" />
                  Login
                </Link>

                <Link to="/signup" className="btn btn-primary link-btn">
                  <Pen className="size-5" />
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden btn btn-ghost"
            onClick={() => setOpen(!open)}
          >
            <Menu className="size-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden mt-4 flex flex-col gap-3 animate-fadeIn">

            {user && (
              <span className="hello-navbar mb-2">
                Hello, {user.user.name}!
              </span>
            )}

            {user && (
              <Link
                to="/create"
                className="btn btn-primary w-full"
                onClick={() => setOpen(false)}
              >
                <PlusIcon className="size-5" />
                New Event
              </Link>
            )}

            {user && user.user.role === "admin" && (
              <Link
                to="/users"
                className="btn btn-primary w-full"
                onClick={() => setOpen(false)}
              >
                <User className="size-5" />
                Users
              </Link>
            )}

            {user && (
              <Link
                to={`/profile/${user.user.id}`}
                className="btn btn-primary w-full"
                onClick={() => setOpen(false)}
              >
                <User className="size-5" />
                My Profile
              </Link>
            )}

            {user && (
              <button
                className="btn btn-error w-full"
                onClick={handleLogout}
              >
                <LogOut className="size-5" />
                Logout
              </button>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  className="btn btn-primary w-full"
                  onClick={() => setOpen(false)}
                >
                  <LogIn className="size-5" />
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="btn btn-primary w-full"
                  onClick={() => setOpen(false)}
                >
                  <Pen className="size-5" />
                  Signup
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;