import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import { formatLocalDateTime } from "../lib/utils";
import toast from "react-hot-toast";
import { useAuthContext } from '../hooks/useAuthContext'
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";

const EventDetailPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthContext()

  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (error) {
        console.log("Error in fetching event", error);
        toast.error("Failed to fetch the event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleSave = async () => {
    if (!event.title.trim() || !event.content.trim() || !event.location.trim() || !event.date.trim()) {    
      toast.error("Please add a title, content, location, maximum capacity or date");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/events/${id}`, event);
      toast.success("Event updated successfully");
      navigate("/");
    } catch (error) {
      console.log("Error saving the event:", error);
      toast.error("Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }
  const eventDate = formatLocalDateTime(event.date);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Events
            </Link>
            {user && (
            <button onClick={handleDelete} className="btn btn-error btn-outline">
              <Trash2Icon className="h-5 w-5" />
              Delete Event
            </button>
            )}
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Title:</span>
                </label>
                {user && (
                <input
                  type="text"
                  placeholder="Event title"
                  className="input input-bordered"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                />
                )}
                {!user && (
                <label className="label">
                  <h1 className="label-text">{event.title}</h1>                  
                </label>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Content:</span>
                </label>
                {user && (
                <textarea
                  placeholder="Write your event here..."
                  className="textarea textarea-bordered h-32"
                  value={event.content}
                  onChange={(e) => setEvent({ ...event, content: e.target.value })}
                />
                )}
                {!user && (
                <label className="label">
                  <p className="label-text">{event.content}</p>                  
                </label>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Location:</span>
                </label>
                {user && (
                <input
                  type="text"
                  placeholder="Write your location here..."
                  className="input input-bordered"
                  value={event.location}
                  onChange={(e) => setEvent({ ...event, location: e.target.value })}
                />
                )}
                {!user && (
                <label className="label">
                  <p className="label-text">{event.location}</p>                  
                </label>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Maximum Capacity:</span>
                </label>
                {user && (
                <input
                  type="number"
                  placeholder="Write your max capacity here..."
                  className="input input-bordered"
                  value={event.maxcapacity}
                  onChange={(e) => setEvent({ ...event, maxcapacity: e.target.value })}
                />
                )}
                {!user && (
                <label className="label">
                  <p className="label-text">{event.maxcapacity ?? "-"}</p>
                </label>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Date: {eventDate}</span>
                </label>
                {user && (
                 <input
                    type="datetime-local"
                    value={event.date}
                    className="input input-bordered"
                    onChange={(e) => setEvent({ ...event, date: e.target.value })}
                  />
                  )}
              </div>

              {user && (
                <div className="card-actions justify-end">
                  <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EventDetailPage;