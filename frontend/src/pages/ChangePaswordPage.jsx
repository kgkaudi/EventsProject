import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router";
import { BASE_URL } from "../lib/axios";
import api from "../lib/axios";
import { useAuthContext } from "../hooks/useAuthContext";

const ChangePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [newpassword, setNewpassword] = useState("");
  const [repeatpassword, setRepeatpassword] = useState("");
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState(null)
  const { dispatch } = useAuthContext()
  const { users } = useAuthContext()

  const navigate = useNavigate();

  const { id } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim() || !newpassword.trim() || !repeatpassword.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (newpassword !== repeatpassword) {
      toast.error("New passwords do not match");
      return;
    }

    const users = JSON.parse(localStorage.getItem("user"));

    setLoading(true);
    setError(null)

    // const body = ;

    try {
      await api.put(`/users/change-password/${id}`, 
        {
          password: password,
          newPassword: newpassword,
        },
      {
        headers: {
          Authorization: `Bearer ${users?.token}`,
        },
      });
      toast.success("Password updated successfully");
      navigate(`/profile/${id}`);
    } catch (error) {
      console.log("Error saving the user:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else {
        toast.error("Failed to update user");
      }
    } finally {
      setLoading(false);
    }
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
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Password..."
                    className="input input-bordered"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">New Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="New Password..."
                    className="input input-bordered"
                    value={newpassword}
                    onChange={(e) => setNewpassword(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Repeat New Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat New Password..."
                    className="input input-bordered"
                    value={repeatpassword}
                    onChange={(e) => setRepeatpassword(e.target.value)}
                  />
                </div>

                <div className="card-actions justify-end">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
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
export default ChangePasswordPage ;