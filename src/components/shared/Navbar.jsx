import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, UserPlus } from "lucide-react";
import NavbarMenu from "./NavbarMenu";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="glass-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div
              className="glass-icon-container p-2 rounded-full 
                          bg-gradient-to-br from-primary/20 to-secondary/20
                          group-hover:scale-110 transition-all duration-300"
            >
              <img
                src="src/components/shared/logo.png"
                alt="logo"
                className="w-[60px] h-[30px]"
              />
            </div>
            <span
              className="text-xl font-bold bg-gradient-to-r from-primary to-secondary 
                           bg-clip-text text-transparent"
            >
              NRolEHub
            </span>
          </Link>

          {user ? (
            <div className="hidden md:flex md:items-center md:space-x-6">
              <NavbarMenu />
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          ) : (
            // Display login and register for unauthenticated users
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Link
                to="/login"
                className="flex items-center space-x-2 text-primary bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-800"
              >
                <User className="h-5 w-5 text-primary dark:text-primary-dark" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-2 text-primary bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-800"
              >
                <UserPlus className="h-5 w-5 text-primary dark:text-primary-dark" />
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="glass-button ml-2 p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="glass-morphism md:hidden p-4 animate-float">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-end space-x-2">
                <UserMenu />
                <span>{user.username}</span>
              </div>
              {/* Render NavbarMenu options */}
              <NavbarMenu isMobile />
              {/* Render UserMenu for authenticated users */}
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                to="/login"
                className="flex items-center space-x-2 text-primary bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-800"
              >
                <User className="h-5 w-5 text-primary dark:text-primary-dark" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-2 text-primary bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-800"
              >
                <UserPlus className="h-5 w-5 text-primary dark:text-primary-dark" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
