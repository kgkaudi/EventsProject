import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import RateLimitedUi from "../components/RateLimitedUI";
import EventsNotFound from "../components/EventsNotFound";
import EventCard from "../components/EventCard";

import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, setQuery, resetEvents } from "../store/slices/eventsSlice";

const HomePage = () => {
  const dispatch = useDispatch();

  const { events, page, query, hasMore, loading } = useSelector(
    (state) => state.events
  );

  const [loadingMore, setLoadingMore] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const eventsContainerRef = useRef(null);

  // Fetch events on first load + whenever query changes
  useEffect(() => {
    dispatch(resetEvents());
    dispatch(fetchEvents({ page: 1, query }))
      .unwrap()
      .then(() => setIsRateLimited(false))
      .catch((err) => {
        if (err?.status === 429) setIsRateLimited(true);
      });
  }, [query, dispatch]);

  // Load more handler
  const handleLoadMore = () => {
    if (eventsContainerRef.current) {
      const { scrollHeight } = eventsContainerRef.current;
      eventsContainerRef.current.dataset.prevHeight = scrollHeight;
    }

    setLoadingMore(true);

    dispatch(fetchEvents({ page, query }))
      .unwrap()
      .then(() => {
        setIsRateLimited(false);

        setTimeout(() => {
          const container = eventsContainerRef.current;
          if (!container) return;

          const prevHeight = Number(container.dataset.prevHeight || 0);

          window.scrollTo({
            top: container.offsetTop + prevHeight - 200,
            behavior: "smooth",
          });
        }, 50);
      })
      .catch((err) => {
        if (err?.status === 429) setIsRateLimited(true);
      })
      .finally(() => setLoadingMore(false));
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto p-4 mt-6">

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search events (title, tags, categories, location, date)..."
            className="input input-bordered w-full"
            value={query}
            onChange={(e) => dispatch(setQuery(e.target.value))}
          />

          <button
            className="btn btn-outline"
            onClick={() => {
              dispatch(setQuery(""));
              dispatch(resetEvents());
              dispatch(fetchEvents({ page: 1, query: "" }));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Clear
          </button>
        </div>
        {loading && events.length === 0 && (
          <div className="text-center text-primary py-10">Loading events...</div>
        )}

        {events.length === 0 && !loading && !isRateLimited && <EventsNotFound />}

        {events.length > 0 && !isRateLimited && (
          <>
            <div
              ref={eventsContainerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
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
export default HomePage;