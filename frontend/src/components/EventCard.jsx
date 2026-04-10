import { Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate, formatLocalDateTime } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

import { useSelector, useDispatch } from "react-redux";
import { removeEvent } from "../store/slices/eventsSlice";
import { useState } from "react";

const EventCard = ({ event }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [showConfirm, setShowConfirm] = useState(false);

  const isOwner = user?.user?.id === event.createdBy?._id;

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      dispatch(removeEvent(id));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete event");
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* CARD */}
      <Link
        to={`/event/${event._id}`}
        className="card bg-base-100 hover:shadow-lg transition-all duration-200 
        border-t-4 border-solid border-[#00FF9D] cursor-pointer"
      >
        <div className="card-body">
          <h3 className="card-title text-base-content">{event.title}</h3>
          <p className="text-base-content/70 line-clamp-3">{event.content}</p>
          <p className="text-base-content/70">Location: {event.location}</p>
          <p className="text-base-content/70">
            Max Capacity: {event.maxcapacity ?? "-"}
          </p>
          <p className="text-base-content/70">
            Date: {formatLocalDateTime(event.date)}
          </p>

          {event.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {event.categories.map((cat, i) => (
                <span key={i} className="badge badge-primary badge-outline">
                  {cat}
                </span>
              ))}
            </div>
          )}

          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {event.tags.map((tag, i) => (
                <span key={i} className="badge badge-secondary badge-outline">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="card-actions justify-between items-center mt-4">
            <span className="text-sm text-base-content/60">
              Created By: {event.createdBy?.name ?? "-"}
            </span>
          </div>

          <div className="card-actions justify-between items-center mt-4">
            <span className="text-sm text-base-content/60">
              Created At: {formatDate(new Date(event.createdAt))}
            </span>

            {isOwner && (
              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirm(true);
                }}
              >
                <Trash2Icon className="size-4" />
              </button>
            )}
          </div>
        </div>
      </Link>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-base-100 p-6 rounded-lg shadow-xl w-80 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">Delete Event?</h3>
            <p className="text-base-content/70 mb-4">
              Are you sure you want to delete <strong>{event.title}</strong>?
            </p>

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-sm btn-error"
                onClick={() => handleDelete(event._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default EventCard;