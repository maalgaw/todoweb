//Định nghĩa thanh navbar
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
interface Props {
  currentTab?: string;
  onTabChange?: (tab: "list" | "add" | "manage_categories" | "trash") => void;
  hideTabs?: boolean;
  showDirectLogout?: boolean;
}

export default function NavBar({ currentTab, onTabChange, hideTabs, showDirectLogout }: Props) {
  const tabs = [
    { id: "list", label: "Danh sách công việc" },
    { id: "add", label: "Thêm công việc" },
    { id: "manage_categories", label: "Quản lý thẻ" },
    { id: "trash", label: "Thùng rác" },
  ] as const;

  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/20 backdrop-blur-md shadow-sm border-b border-gray-400 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          {/* Cụm Logo */}
          <div className="flex shrink-0 items-center mr-4 sm:mr-8 select-none">
            <span className="text-xl font-black text-emerald-600 tracking-tighter flex items-center gap-2">
              <span className="text-2xl drop-shadow-sm">📒</span>
              <span className="hidden sm:block">TodoApp</span>
            </span>
          </div>

          {/* Cụm Tabs */}
          {!hideTabs ? (
            <div className="flex flex-1 overflow-x-auto overflow-y-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange && onTabChange(tab.id as "list" | "add" | "manage_categories" | "trash")}
                  className={`shrink-0 inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                    currentTab === tab.id
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-1"></div>
          )}

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center ml-4 relative" ref={dropdownRef}>
              {showDirectLogout ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-500 shrink-0">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 hidden sm:block font-medium">
                      {user.displayName || user.username}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                  <button
                    onClick={logout}
                    className="bg-gray-800 text-gray-200 hover:bg-rose-500 hover:text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-500 shrink-0">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          {user.displayName
                            ? user.displayName.charAt(0).toUpperCase()
                            : user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 hidden sm:block font-medium">
                      {user.displayName || user.username}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Thông tin tài khoản
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
