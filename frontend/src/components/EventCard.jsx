import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate, formatLocalDateTime } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

const EventCard = ({ event, setEvents }) => {
  const handleDelete = async (e, id) => {
    e.preventDefault(); // get rid of the navigation behaviour

    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((event) => event._id !== id)); // get rid of the deleted one
      toast.success("Event deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <Link
      to={`/event/${event._id}`}
      className="card bg-base-100 hover:shadow-lg transition-all duration-200 
      border-t-4 border-solid border-[#00FF9D]"
    >
      <div className="card-body">
        <h3 className="card-title text-base-content">{event.title}</h3>
        <p className="text-base-content/70 line-clamp-3">{event.content}</p>
        <p className="text-base-content/70 line-clamp-3">Location: {event.location}</p>
        <p className="text-base-content/70 line-clamp-3">Max Capacity: {event.maxcapacity ?? "-"}</p>
        <p className="text-base-content/70 line-clamp-3">Date: {formatLocalDateTime(event.date)}</p>
        <div className="card-actions justify-between items-center mt-4">
          <span className="text-sm text-base-content/60">
            Created At: {formatDate(new Date(event.createdAt))}
          </span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4" />
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => handleDelete(e, event._id)}
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default EventCard;