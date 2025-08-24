"use client";

import Link from "next/link";
import { Home, Search, Package, User } from "lucide-react";
import { useState, useEffect } from "react";

export function NavBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // TODO: Implement proper authentication check
    // For now, just checking if there's any token in localStorage
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#A6E3FF] border-t rounded-t-3xl border-gray-200 px-4 py-3">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          <Link
            href="/"
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1 font-semibold">Home</span>
          </Link>

          <Link
            href="/search"
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          >
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1 font-semibold">Search</span>
          </Link>

          <Link
            href="/products"
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          >
            <Package className="h-6 w-6" />
            <span className="text-xs mt-1 font-semibold">Products</span>
          </Link>

          <Link
            href={isAuthenticated ? "/account" : "/login"}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1 font-semibold">
              {isAuthenticated ? "Account" : "Login"}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
