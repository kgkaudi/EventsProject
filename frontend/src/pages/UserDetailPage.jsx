import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon, Eye, EyeOff } from "lucide-react";

const UserDetailPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);
      } catch (error) {
        console.log("Error in fetching user", error);
        toast.error("Failed to fetch the user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }

    const users = JSON.parse(localStorage.getItem("user"));

    try {
      await api.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${users?.token}`,
        },
        data: {
          password: deletePassword,
        },
      });

      toast.success("User deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the user:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        toast.error("You do not have permission to delete this user.");
      } else if (error.response?.status === 400) {
        toast.error("Incorrect password");
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleSave = async () => {
    if (!user.name.trim() || !user.email.trim() || !user.role.trim()) {
      toast.error("Please add a name, email or role");
      return;
    }

    const users = JSON.parse(localStorage.getItem("user"));
    setSaving(true);

    try {
      await api.put(
        `/users/${id}`,
        user,
        {
          headers: {
            Authorization: `Bearer ${users?.token}`,
          },
        }
      );

      toast.success("User updated successfully");
      navigate("/users");
    } catch (error) {
      console.log("Error saving the user:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else {
        toast.error("Failed to update user");
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

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/users" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Users
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-error btn-outline"
            >
              <Trash2Icon className="h-5 w-5" />
              Delete User
            </button>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Name:</span>
                </label>
                <input
                  type="text"
                  placeholder="Write your user name here..."
                  className="input input-bordered"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Email:</span>
                </label>
                <input
                  type="text"
                  placeholder="Write your email here..."
                  className="input input-bordered"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Role:</span>
                </label>

                <select
                  className="select select-bordered"
                  value={user.role}
                  onChange={(e) => setUser({ ...user, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete User</h3>
            <p className="py-4">
              To confirm deletion, please enter your password.
              This will permanently delete this user and all events created by them.
            </p>

            {/* PASSWORD FIELD WITH TOGGLE */}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="input input-bordered w-full"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/70"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setShowPassword(false);
                }}
              >
                Cancel
              </button>

              <button
                className="btn btn-error"
                onClick={() => {
                  handleDelete();
                  setShowDeleteModal(false);
                }}
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
export default UserDetailPage;