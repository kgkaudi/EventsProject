import React from 'react'
import Navbar from "../components/Navbar"
import { useState } from 'react'
import RateLimitedUi from "../components/RateLimitedUI" 
import EventsNotFound from '../components/EventsNotFound'
import { useEffect } from "react";
import api from "../lib/axios"
import toast from 'react-hot-toast';
import EventCard from '../components/EventCard'

export const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
        try {
            const res = await api.get("/events")
            // const data = await res.data();
            console.log(res.data);
            setEvents(res.data);
            setIsRateLimited(false);
        } catch (error) {
            console.log("Error fetching events", error);
            if(error.response?.status === 429){
                setIsRateLimited(true)
            }
            else {
                toast.error("Failed to load events");
            }
        } finally {
            setLoading(false);
        }
    }

    fetchEvents();
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && <div className="text-center text-primary py-10">Loading events...</div>}

        {events.length === 0 && !isRateLimited && <EventsNotFound />}

        {events.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} setEvents={setEvents} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
