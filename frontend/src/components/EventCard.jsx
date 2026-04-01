import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router";
import { formatDate, formatLocalDateTime } from "../lib/utils";
import api from "../lib/axios";
import { useAuthContext } from "../hooks/useAuthContext";
import toast from "react-hot-toast";

const EventCard = ({ event, setEvents }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const isOwner = user?.user?.id === event.createdBy?._id;

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();

    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((event) => event._id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <div
      onClick={() => navigate(`/event/${event._id}`)}
      className="card bg-base-100 hover:shadow-lg transition-all duration-200 
      border-t-4 border-solid border-[#00FF9D] cursor-pointer"
    >
      <div className="card-body">
        <h3 className="card-title text-base-content">{event.title}</h3>
        <p className="text-base-content/70 line-clamp-3">{event.content}</p>
        <p className="text-base-content/70">Location: {event.location}</p>
        <p className="text-base-content/70">Max Capacity: {event.maxcapacity ?? "-"}</p>
        <p className="text-base-content/70">Date: {formatLocalDateTime(event.date)}</p>

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
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={(e) => handleDelete(e, event._id)}
              >
                <Trash2Icon className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default EventCard;