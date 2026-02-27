import { Calendar1Icon, NotebookIcon } from "lucide-react";
import { Link } from "react-router";
import { useAuthContext } from '../hooks/useAuthContext'

const EventsNotFound = () => {
  const { user } = useAuthContext()
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
      <div className="bg-primary/10 rounded-full p-8">
        <Calendar1Icon className="size-10 text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No events yet</h3>
      <p className="text-base-content/70">
        Ready to spread the word? Wait for our first event to be announced.
        Stay tuned.
      </p>
      {user && (
      <Link to="/create" className="btn btn-primary">
        Or create Your First Event here
      </Link>
      )}
    </div>
  );
};
export default EventsNotFound;