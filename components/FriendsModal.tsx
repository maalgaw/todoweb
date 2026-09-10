import { useState, useEffect } from "react";
import api from "../lib/axiosConfig";
import { Friend, FriendRequest } from "../types";
import { toast } from "react-hot-toast";
import {
  XMarkIcon,
  UserPlusIcon,
  CheckIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendsModal({ isOpen, onClose }: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      fetchRequests();
    }
  }, [isOpen]);

  async function fetchFriends() {
    try {
      const res = await api.get("/api/friends");
      setFriends(res.data);
    } catch {
      toast.error("Không thể tải danh sách bạn bè");
    }
  }

  async function fetchRequests() {
    try {
      const res = await api.get("/api/friends/requests");
      setRequests(res.data);
    } catch {
      toast.error("Không thể tải danh sách lời mời");
    }
  }

  const handleAddFriend = async () => {
    if (!newFriendEmail.trim()) return;
    setIsLoading(true);
    try {
      await api.post("/api/friends/add", { email: newFriendEmail.trim() });
      toast.success("Đã gửi lời mời kết bạn");
      setNewFriendEmail("");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Không thể gửi lời mời kết bạn",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await api.post(`/api/friends/accept/${friendshipId}`);
      toast.success("Đã chấp nhận lời mời");
      fetchFriends();
      fetchRequests();
    } catch {
      toast.error("Không thể chấp nhận lời mời");
    }
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa/từ chối?")) return;
    try {
      await api.delete(`/api/friends/${friendshipId}`);
      toast.success("Đã xóa");
      fetchFriends();
      fetchRequests();
    } catch {
      toast.error("Không thể thực hiện thao tác");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Bạn bè</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-2">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "friends"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Bạn bè ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "requests"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Lời mời ({requests.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === "friends" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Nhập email để thêm bạn..."
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleAddFriend}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 flex items-center gap-1 disabled:opacity-50"
                >
                  <UserPlusIcon className="w-4 h-4" />
                  Thêm
                </button>
              </div>

              {friends.length === 0 ? (
                <p className="text-center text-gray-500 text-sm mt-8">
                  Bạn chưa có người bạn nào.
                </p>
              ) : (
                <ul className="space-y-2 mt-4">
                  {friends.map((friend) => (
                    <li
                      key={friend.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                          {friend.displayName
                            ? friend.displayName.charAt(0).toUpperCase()
                            : friend.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {friend.displayName || friend.username}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {friend.email}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div>
              {requests.length === 0 ? (
                <p className="text-center text-gray-500 text-sm mt-8">
                  Không có lời mời kết bạn nào.
                </p>
              ) : (
                <ul className="space-y-2">
                  {requests.map((req) => (
                    <li
                      key={req.friendshipId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                          {req.user.displayName
                            ? req.user.displayName.charAt(0).toUpperCase()
                            : req.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {req.user.displayName || req.user.username}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {req.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => handleAcceptRequest(req.friendshipId)}
                          className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200"
                          title="Chấp nhận"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(req.friendshipId)}
                          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          title="Từ chối"
                        >
                          <NoSymbolIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
