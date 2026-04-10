import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router";

import { useDispatch } from "react-redux";
import { changePassword } from "../store/slices/usersSlice";

import PasswordInput from "../components/PasswordInput";

const ChangePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [newpassword, setNewpassword] = useState("");
  const [repeatpassword, setRepeatpassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password.trim() || !newpassword.trim() || !repeatpassword.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (newpassword !== repeatpassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);

    dispatch(
      changePassword({
        id,
        password,
        newPassword: newpassword,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Password updated successfully");
        navigate(`/profile/${id}`);
      })
      .catch((err) => {
        console.log("Error updating password:", err);

        if (err?.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else {
          toast.error(err?.message || "Failed to update password");
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={`/profile/${id}`} className="btn btn-ghost">
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Profile
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Change Password</h2>

              <form onSubmit={handleSubmit}>
                <PasswordInput
                  label="Current Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <PasswordInput
                  label="New Password"
                  value={newpassword}
                  onChange={(e) => setNewpassword(e.target.value)}
                />

                <PasswordInput
                  label="Repeat New Password"
                  value={repeatpassword}
                  onChange={(e) => setRepeatpassword(e.target.value)}
                />

                <div className="card-actions justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
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

export default ChangePasswordPage;
