import { useEffect } from "react";
import { Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import { fetchAnalytics } from "../store/slices/eventsSlice";

export default function AdminAnalytics() {
  const dispatch = useDispatch();

  const loggedIn = useSelector((s) => s.auth.user);
  const { analytics, analyticsLoading } = useSelector((s) => s.events);

  if (!loggedIn || loggedIn.user.role !== "admin") {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Analytics</h1>

        {analyticsLoading && <p>Loading analytics...</p>}

        {!analyticsLoading && !analytics && (
          <p className="text-error">Failed to load analytics</p>
        )}

        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="stat shadow">
              <div className="stat-title">Total Events</div>
              <div className="stat-value">{analytics.totalEvents}</div>
            </div>

            <div className="stat shadow">
              <div className="stat-title">Events Per User</div>
              <div className="stat-value">{analytics.eventsPerUser.length}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
