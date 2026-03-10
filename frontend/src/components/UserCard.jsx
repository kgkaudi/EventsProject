import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";

const UserCard = ({ user, setUsers }) => {
  const handleDelete = async (e, id) => {
    e.preventDefault(); // get rid of the navigation behaviour

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id)); // get rid of the deleted one
      toast.success("User deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete user");
    }
  };

  return (
    <Link
      to={`/user/${user._id}`}
      className="card bg-base-100 hover:shadow-lg transition-all duration-200 
      border-t-4 border-solid border-[#00FF9D]"
    >
      <div className="card-body">
        <h3 className="card-title text-base-content">Name: {user.name}</h3>
        <p className="text-base-content/70 line-clamp-3">Email: {user.email}</p>        
        <p className="text-base-content/70 line-clamp-3">Role: <span className="user-card-role">{user.role}</span></p>        
        <div className="card-actions justify-between items-center mt-4">
          <span className="text-sm text-base-content/60"/>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4" />
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => handleDelete(e, user._id)}
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
          
        </div>
      </div>
    </Link>
  );
};
export default UserCard;