import { PenSquareIcon, Trash2Icon, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { deleteUser, updateUserRole } from "../store/slices/usersSlice";

const UserCard = ({ user }) => {
  const dispatch = useDispatch();
  const loggedIn = useSelector((state) => state.auth.user);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleDelete = () => {
    if (!deletePassword.trim()) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }

    dispatch(deleteUser({ id: user._id, password: deletePassword }))
      .unwrap()
      .then(() => {
        toast.success("User deleted successfully");
      })
      .catch((error) => {
        if (error?.status === 400) {
          toast.error("Incorrect password");
        } else {
          toast.error("Failed to delete user");
        }
      });
  };

  const handleRoleChange = (newRole) => {
    dispatch(updateUserRole({ id: user._id, role: newRole }))
      .unwrap()
      .then(() => toast.success(`Role updated to ${newRole}`))
      .catch(() => toast.error("Failed to update role"));
  };

  return (
    <>
      <Link
        to={`/user/${user._id}`}
        className="card bg-base-100 hover:shadow-lg transition-all duration-200 
        border-t-4 border-solid border-[#00FF9D]"
      >
        <div className="card-body">
          <h3 className="card-title text-base-content">Name: {user.name}</h3>
          <p className="text-base-content/70">Email: {user.email}</p>

          <div className="text-base-content/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Role:</span>
              <span className="badge badge-outline">{user.role}</span>

              {loggedIn?.user?.role === "admin" && (
                <div className="flex gap-1">
                  <button
                    className="btn btn-xs btn-success"
                    disabled={user.role === "admin"}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRoleChange("admin");
                    }}
                  >
                    Promote
                  </button>

                  <button
                    className="btn btn-xs btn-warning"
                    disabled={user.role === "user"}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRoleChange("user");
                    }}
                  >
                    Demote
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card-actions justify-between items-center mt-4">
            <span className="text-sm text-base-content/60" />

            <div className="flex items-center gap-1">
              <PenSquareIcon className="size-4" />

              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteModal(true);
                }}
              >
                <Trash2Icon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>

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
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
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
    </>
  );
};
export default UserCard;