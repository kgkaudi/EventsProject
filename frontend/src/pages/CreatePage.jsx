import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";

import { useDispatch } from "react-redux";
import { createEvent } from "../store/slices/eventsSlice";

const CreatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [maxcapacity, setMaxcapacity] = useState("");
  const [date, setDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (e) => {
    const raw = e.target.value;
    if (!raw) {
      setDate("");
      return;
    }

    const formatted = raw.replace("T", " ") + ":00";
    setDate(formatted);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !location.trim() || !date.trim()) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    dispatch(
      createEvent({
        title,
        content,
        location,
        maxcapacity,
        date,
        categories,
        tags,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Event created successfully!");
        navigate("/");
      })
      .catch((error) => {
        console.log("Error creating event", error);

        if (error?.status === 401) {
          toast.error("Session expired. Please login again.", {
            duration: 4000,
            icon: "💀",
          });
        } else if (error?.status === 429) {
          toast.error("Slow down! You're creating events too fast", {
            duration: 4000,
            icon: "💀",
          });
        } else {
          toast.error("Failed to create event");
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={"/"} className="btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-5" />
            Back to Events
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Create New Event</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Event Title"
                    className="input input-bordered"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Content</span>
                  </label>
                  <textarea
                    placeholder="Write your event here..."
                    className="textarea textarea-bordered h-32"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Location</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Location"
                    className="input input-bordered"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Maximum Capacity</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Max capacity"
                    className="input input-bordered"
                    value={maxcapacity}
                    onChange={(e) => setMaxcapacity(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Categories (comma separated)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Music, Sports, Tech"
                    onChange={(e) =>
                      setCategories(
                        e.target.value.split(",").map((c) => c.trim())
                      )
                    }
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Tags (comma separated)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Free, Outdoor, Family"
                    onChange={(e) =>
                      setTags(e.target.value.split(",").map((t) => t.trim()))
                    }
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Date</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={date}
                    onChange={handleDateChange}
                  />
                </div>

                <div className="card-actions justify-end">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Creating..." : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreatePage;