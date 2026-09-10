import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Category } from "../types";
import SidebarFilters from "./SidebarFilters";
import SidebarTags from "./SidebarTags";
import FriendsModal from "./FriendsModal";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  onAddCategory: (name: string) => void;
  user: {
    avatarUrl?: string | null;
    displayName?: string | null;
    username?: string | null;
    role?: string | null;
  } | null;
  onLogout: () => void;
  onEditCategory?: (id: number, name: string) => void;
  onDeleteCategory?: (id: number) => void;
  onOpenAddModal?: () => void; // Dành cho nút thêm công việc (tạm thời)
}

export default function Sidebar({
  isOpen,
  onToggle,
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  categories,
  onAddCategory,
  user,
  onLogout,
  onEditCategory,
  onDeleteCategory,
}: SidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`bg-gray-50 flex flex-col h-screen border-r border-gray-200 shrink-0 shadow-sm ${
        isOpen ? "w-72" : "w-0 overflow-hidden border-none"
      }`}
    >
      <div className="w-72 flex flex-col h-full">
        {/* Header: User Info */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
          <div className="relative" ref={userMenuRef}>
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg -ml-1.5"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-500 shrink-0">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-emerald-700 font-bold text-lg">
                    {user?.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.displayName || user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  Tài khoản
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsFriendsModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  Quản lý bạn bè
                </button>
                {user?.role === "Admin" && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push("/admin");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    Quản lý
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md "
            title="Đóng thanh bên"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-gray-50">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {/* Filters extracted to separate component */}
        <SidebarFilters
          currentFilter={currentFilter}
          onFilterChange={onFilterChange}
        />

        {/* Tags extracted to separate component */}
        <SidebarTags
          categories={categories}
          currentFilter={currentFilter}
          onFilterChange={onFilterChange}
          onAddCategory={onAddCategory}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
        />
      </div>

      <FriendsModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
      />
    </div>
  );
}
