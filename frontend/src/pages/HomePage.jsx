import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import RateLimitedUi from "../components/RateLimitedUI";
import EventsNotFound from "../components/EventsNotFound";
import EventCard from "../components/EventCard";
import api from "../lib/axios";
import toast from "react-hot-toast";

export const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [query, setQuery] = useState("");

  const eventsContainerRef = useRef(null);

  const fetchEvents = async (pageNumber) => {
    try {
      const res = await api.get(
        `/events?page=${pageNumber}&limit=9&q=${query}`
      );

      if (pageNumber === 1) {
        setEvents(res.data.events);
      } else {
        setEvents((prev) => [...prev, ...res.data.events]);
      }

      setHasMore(res.data.hasMore);
      setIsRateLimited(false);

      // Smooth scroll only when loading more
      if (pageNumber > 1) {
        setTimeout(() => {
          const container = eventsContainerRef.current;
          if (!container) return;

          const prevHeight = Number(container.dataset.prevHeight || 0);

          window.scrollTo({
            top: container.offsetTop + prevHeight - 200,
            behavior: "smooth",
          });
        }, 50);
      }
    } catch (error) {
      console.log("Error fetching events", error);
      if (error.response?.status === 429) {
        setIsRateLimited(true);
      } else {
        toast.error("Failed to load events");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchEvents(1);
  }, [query]);

  const handleLoadMore = () => {
    if (eventsContainerRef.current) {
      const { scrollHeight } = eventsContainerRef.current;
      eventsContainerRef.current.dataset.prevHeight = scrollHeight;
    }

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && events.length === 0 && (
          <div className="text-center text-primary py-10">Loading events...</div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search events (title, tags, categories, location, date)..."
            className="input input-bordered w-full mb-6"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            className="btn btn-outline"
            onClick={() => {
              setQuery("");
              setPage(1);
              fetchEvents(1);
            }}
          >
            Clear
          </button>
        </div>

        {events.length === 0 && !loading && !isRateLimited && <EventsNotFound />}

        {events.length > 0 && !isRateLimited && (
          <>
            <div
              ref={eventsContainerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {events.map((event) => (
                <EventCard key={event._id} event={event} setEvents={setEvents} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn btn-primary"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
