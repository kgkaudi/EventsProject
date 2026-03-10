import React from 'react'
import Navbar from "../components/Navbar"
import { useState } from 'react'
import RateLimitedUi from "../components/RateLimitedUI" 
import UsersNotFound from '../components/UsersNotFound'
import { useEffect } from "react";
import api from "../lib/axios"
import toast from 'react-hot-toast';
import UserCard from '../components/UserCard'

export const UsersPage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const res = await api.get("/users")
            // const data = await res.data();
            console.log(res.data);
            setUsers(res.data);
            setIsRateLimited(false);
        } catch (error) {
            console.log("Error fetching users", error);
            if(error.response?.status === 429){
                setIsRateLimited(true)
            }
            else {
                toast.error("Failed to load users");
            }
        } finally {
            setLoading(false);
        }
    }

    fetchUsers();
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && <div className="text-center text-primary py-10">Loading users...</div>}

        {users.length === 0 && !isRateLimited && <UsersNotFound />}

        {users.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard key={user._id} user={user} setUsers={setUsers} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
