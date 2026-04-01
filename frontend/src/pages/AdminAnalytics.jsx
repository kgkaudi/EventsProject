import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import api from "../lib/axios";
import Navbar from "../components/Navbar";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);

  const loggedIn = JSON.parse(localStorage.getItem("user"));

  if (!loggedIn || loggedIn.user.role !== "admin") {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/events/stats");
        setStats(res.data);
      } catch (error) {
        console.log("Error loading stats", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Analytics</h1>

        {!stats && <p>Loading analytics...</p>}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="stat shadow">
              <div className="stat-title">Total Events</div>
              <div className="stat-value">{stats.totalEvents}</div>
            </div>

            <div className="stat shadow">
              <div className="stat-title">Events Per User</div>
              <div className="stat-value">{stats.eventsPerUser.length}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
