import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventById,
  updateEvent,
  removeEvent,
} from "../store/slices/eventsSlice";

import { formatLocalDateTime } from "../lib/utils";
import api from "../lib/axios";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { singleEvent, singleLoading } = useSelector((s) => s.events);
  const user = useSelector((s) => s.auth.user);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isOwner = user?.user?.id === singleEvent?.createdBy?._id;

  // Fetch event on mount
  useEffect(() => {
    dispatch(fetchEventById(id));
  }, [id, dispatch]);

  // Sync form when event loads
  useEffect(() => {
    if (singleEvent) {
      setForm({
        title: singleEvent.title ?? "",
        content: singleEvent.content ?? "",
        location: singleEvent.location ?? "",
        maxcapacity: singleEvent.maxcapacity ?? "",
        categories: singleEvent.categories?.join(", ") ?? "",
        tags: singleEvent.tags?.join(", ") ?? "",
        date: singleEvent.date?.slice(0, 16) ?? "",
      });
    }
  }, [singleEvent]);

  // Delete event (modal version)
  const handleDelete = async () => {
    try {
      await api.delete(`/events/${id}`);
      dispatch(removeEvent(id));
      toast.success("Event deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting event:", error);
      toast.error(error.response?.data?.message || "Failed to delete event");
    } finally {
      setShowConfirm(false);
    }
  };

  const handleSave = async () => {
    if (
      !form.title.trim() ||
      !form.content.trim() ||
      !form.location.trim() ||
      !form.date.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);

    dispatch(
      updateEvent({
        id,
        data: {
          ...form,
          categories: form.categories
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Event updated successfully");
        navigate("/");
      })
      .catch((err) => {
        console.log("Error updating event:", err);
        toast.error(err?.message || "Failed to update event");
      })
      .finally(() => setSaving(false));
  };

  if (singleLoading || !form) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  const eventDate = formatLocalDateTime(singleEvent.date);

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
              <button
                onClick={() => setShowConfirm(true)}
                className="btn btn-error btn-outline"
              >
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
                    value={form.title ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                ) : (
                  <p className="label-text">{form.title}</p>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Content:</span>
                </label>

                {isOwner ? (
                  <textarea
                    className="textarea textarea-bordered h-32"
                    value={form.content ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                  />
                ) : (
                  <p className="label-text">{form.content}</p>
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
                    value={form.location ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                ) : (
                  <p className="label-text">{form.location}</p>
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
                    value={form.maxcapacity ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, maxcapacity: e.target.value })
                    }
                  />
                ) : (
                  <p className="label-text">{form.maxcapacity ?? "-"}</p>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Categories</span>
                </label>

                {isOwner ? (
                  <input
                    type="text"
                    className="input input-bordered"
                    value={form.categories ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, categories: e.target.value })
                    }
                  />
                ) : (
                  <p className="label-text">{form.categories || "-"}</p>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>

                {isOwner ? (
                  <input
                    type="text"
                    className="input input-bordered"
                    value={form.tags ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, tags: e.target.value })
                    }
                  />
                ) : (
                  <p className="label-text">{form.tags || "-"}</p>
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
                    value={form.date ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                  />
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">
                    Created By: {isOwner ? "You" : singleEvent.createdBy?.name}
                  </span>
                </label>
              </div>

              {isOwner && (
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
              Are you sure you want to delete{" "}
              <strong>{singleEvent.title}</strong>?
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
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EventDetailPage;