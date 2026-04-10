import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  LoaderIcon,
  Trash2Icon,
  Eye,
  EyeOff,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserById,
  updateUser,
  deleteUser,
} from "../store/slices/usersSlice";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { singleUser, singleLoading } = useSelector((s) => s.users);
  const loggedIn = useSelector((s) => s.auth.user);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isAdmin = loggedIn?.user?.role === "admin";

  // Fetch user on mount
  useEffect(() => {
    dispatch(fetchUserById(id));
  }, [id, dispatch]);

  // Sync form when user loads
  useEffect(() => {
    if (singleUser) {
      setForm({
        name: singleUser.name ?? "",
        email: singleUser.email ?? "",
        role: singleUser.role ?? "user",
      });
    }
  }, [singleUser]);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);

    dispatch(updateUser({ id, data: form }))
      .unwrap()
      .then(() => {
        toast.success("User updated successfully");
        navigate("/users");
      })
      .catch((err) => {
        console.log("Error updating user:", err);
        toast.error(err?.message || "Failed to update user");
      })
      .finally(() => setSaving(false));
  };

  const handleDelete = () => {
    if (!deletePassword.trim()) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }

    dispatch(deleteUser({ id, password: deletePassword }))
      .unwrap()
      .then(() => {
        toast.success("User deleted");
        navigate("/users");
      })
      .catch((err) => {
        if (err?.status === 400) toast.error("Incorrect password");
        else if (err?.status === 403)
          toast.error("You do not have permission to delete this user");
        else toast.error("Failed to delete user");
      });
  };

  if (singleLoading || !form) {
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
                  className="input input-bordered"
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Email:</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={form.email ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Role:</span>
                </label>

                <select
                  className="select select-bordered"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
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

      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete User</h3>
            <p className="py-4">
              To confirm deletion, please enter your password.
              This will permanently delete this user and all events created by them.
            </p>

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