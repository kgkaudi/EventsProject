import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import { formatLocalDateTime } from "../lib/utils";
import toast from "react-hot-toast";
import { useAuthContext } from "../hooks/useAuthContext";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";

const EventDetailPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { user } = useAuthContext();
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

    const storedUser = JSON.parse(localStorage.getItem("user"));

    try {
      await api.delete(`/events/${id}`, {
        headers: {
          Authorization: `Bearer ${storedUser?.token}`,
        },
      });

      toast.success("Event deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the event:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        toast.error("You do not have permission to delete this event.");
      } else {
        toast.error("Failed to delete event");
      }
    }
  };

  const handleSave = async () => {
    if (
      !event.title.trim() ||
      !event.content.trim() ||
      !event.location.trim() ||
      !event.date.trim()
    ) {
      toast.error("Please add a title, content, location, maximum capacity or date");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setSaving(true);

    try {
      await api.put(`/events/${id}`, event, {
        headers: {
          Authorization: `Bearer ${storedUser?.token}`,
        },
      });
      toast.success("Event updated successfully");
      navigate("/");
    } catch (error) {
      console.log("Error saving the event:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else {
        toast.error("Failed to update event");
      }
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
  const isOwner = user?.user?.id === event.createdBy?._id;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Events
            </Link>

            {isOwner && (
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

                {isOwner ? (
                  <input
                    type="text"
                    className="input input-bordered"
                    value={event.title ?? ""}
                    onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  />
                ) : (
                  <p className="label-text">{event.title}</p>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Content:</span>
                </label>

                {isOwner ? (
                  <textarea
                    className="textarea textarea-bordered h-32"
                    value={event.content ?? ""}
                    onChange={(e) => setEvent({ ...event, content: e.target.value })}
                  />
                ) : (
                  <p className="label-text">{event.content}</p>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Location:</span>
                </label>

                {isOwner ? (
                  <input
                    type="text"
                    className="input input-bordered"
                    value={event.location ?? ""}
                    onChange={(e) => setEvent({ ...event, location: e.target.value })}
                  />
                ) : (
                  <p className="label-text">{event.location}</p>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Maximum Capacity:</span>
                </label>

                {isOwner ? (
                  <input
                    type="number"
                    className="input input-bordered"
                    value={event.maxcapacity ?? ""}
                    onChange={(e) => setEvent({ ...event, maxcapacity: e.target.value })}
                  />
                ) : (
                  <p className="label-text">{event.maxcapacity ?? "-"}</p>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Date: {eventDate}</span>
                </label>

                {isOwner && (
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={event.date ? event.date.slice(0, 16) : ""}
                    onChange={(e) => setEvent({ ...event, date: e.target.value })}
                  />
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">
                    Created By: {isOwner ? "You" : event.createdBy?.name ?? "-"}
                  </span>
                </label>
              </div>

              {isOwner && (
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