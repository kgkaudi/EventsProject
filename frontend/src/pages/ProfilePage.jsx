import { useEffect } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
            <Link to={"/"} className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Events
            </Link>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Name:</span>
                </label>
                <label className="label">
                  <h1 className="label-text">{user.name}</h1>
                </label>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Email:</span>
                </label>
                <label className="label">
                  <h1 className="label-text">{user.email}</h1>
                </label>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Role:</span>
                </label>
                <label className="label">
                  <h1 className="label-text"><span className="user-card-role">{user.role}</span></h1>
                </label>
              </div>

              <div className="card-actions justify-end">
                <Link to={`/change-password/${id}`} className="btn btn-primary">
                  Change password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;