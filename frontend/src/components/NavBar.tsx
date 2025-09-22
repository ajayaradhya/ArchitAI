import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "App", path: "/app" },
    { label: "History", path: "/history" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed w-full z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-opacity-90 backdrop-blur-md shadow-lg">

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-100 to-pink-300">
          ArchitAI
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-1 py-1 font-semibold text-gray-800 dark:text-gray-100 transition-all duration-300
                  ${isActive ? "text-indigo-500" : "hover:text-indigo-400"}
                `}
              >
                {item.label}
                <span
                  className={`absolute left-0 -bottom-1 h-0.5 bg-indigo-500 transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-6 h-0.5 bg-gray-800 dark:bg-white mb-1 transition-all"></div>
            <div className="w-6 h-0.5 bg-gray-800 dark:bg-white mb-1 transition-all"></div>
            <div className="w-6 h-0.5 bg-gray-800 dark:bg-white transition-all"></div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md shadow-lg">
          <div className="flex flex-col items-center py-4 space-y-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300
                    ${isActive ? "text-indigo-500" : "hover:text-indigo-400"}
                  `}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
