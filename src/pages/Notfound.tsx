import { MoveRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

function Notfound() {
  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-md">
        {/* Large 404 text with gradient */}
        <h1 className="text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 leading-none">
          404
        </h1>

        {/* Error message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Home link button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Go Home
          <MoveRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Optional decorative element */}
        <div className="mt-6 opacity-20">
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default Notfound;
