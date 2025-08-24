import userContext from "@/context/User";
import { BACKEND_URL } from "@/lib/constants";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";

function Navbar() {
  const { user } = useContext(userContext);

  return (
    <nav className="bg-popover shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold text-2xl tracking-tight hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Our Base.
              </div>
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Avatar & Name */}
                <div className="flex items-center space-x-2 bg-background rounded-full px-3 py-2 border border-gray-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                    {user.name}
                  </span>
                </div>
                
                {/* Logout Button */}
                <Link 
                  to={`${BACKEND_URL}/auth/logout`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Link>
              </div>
            ) : (
              /* Login Button */
              <Link 
                to={`${BACKEND_URL}/auth/google`}
                className="inline-flex items-center px-6 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:bg-accent hover:text-accent-foreground"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login with Google
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
