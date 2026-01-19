import { Calendar1Icon, NotebookIcon } from "lucide-react";
import { Link } from "react-router";

const EventsNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
      <div className="bg-primary/10 rounded-full p-8">
        <Calendar1Icon className="size-10 text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No events yet</h3>
      <p className="text-base-content/70">
        Ready to spread the word? Create your first event to get started on your journey.
      </p>
      <Link to="/create" className="btn btn-primary">
        Create Your First Event
      </Link>
    </div>
  );
};
export default EventsNotFound;