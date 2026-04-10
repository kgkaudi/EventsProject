import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import RateLimitedUi from "../components/RateLimitedUI";
import UsersNotFound from "../components/UsersNotFound";
import UserCard from "../components/UserCard";

import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../store/slices/usersSlice";

export const UsersPage = () => {
  const dispatch = useDispatch();

  const { users, loading, isRateLimited } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && (
          <div className="text-center text-primary py-10">
            Loading users...
          </div>
        )}

        {!loading && users.length === 0 && !isRateLimited && <UsersNotFound />}

        {!loading && users.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
