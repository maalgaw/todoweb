import { useState, useEffect, useRef } from "react";
import api from "../lib/axiosConfig";
import { Friend } from "../types";
import { toast } from "react-hot-toast";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface SharePopoverProps {
  todoId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function SharePopover({
  todoId,
  isOpen,
  onClose,
}: SharePopoverProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      api.get("/api/friends")
        .then((res) => setFriends(res.data))
        .catch(() => toast.error("Không thể tải danh sách bạn bè"));
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleToggleFriend = (id: number) => {
    if (selectedFriendIds.includes(id)) {
      setSelectedFriendIds((prev) => prev.filter((fid) => fid !== id));
    } else {
      setSelectedFriendIds((prev) => [...prev, id]);
    }
  };

  const handleShare = async () => {
    if (selectedFriendIds.length === 0) {
      toast("Vui lòng chọn ít nhất 1 người để chia sẻ", { icon: "ℹ️" });
      return;
    }
    setIsLoading(true);
    try {
      await api.post(`/api/todos/${todoId}/share`, {
        friendIds: selectedFriendIds,
      });
      toast.success("Chia sẻ công việc thành công!");
      onClose();
    } catch {
      toast.error("Không thể chia sẻ công việc");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col"
    >
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          Chia sẻ công việc
        </h3>
      </div>
      <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
        {friends.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            Bạn chưa có bạn bè nào.
          </p>
        ) : (
          <ul className="space-y-1">
            {friends.map((friend) => (
              <li key={friend.id}>
                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0 text-xs">
                    {friend.displayName
                      ? friend.displayName.charAt(0).toUpperCase()
                      : friend.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {friend.displayName || friend.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {friend.email}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500"
                    checked={selectedFriendIds.includes(friend.id)}
                    onChange={() => handleToggleFriend(friend.id)}
                  />
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-3 border-t border-gray-100 bg-white">
        <button
          onClick={handleShare}
          disabled={isLoading || selectedFriendIds.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          Gửi
        </button>
      </div>
    </div>
  );
}
