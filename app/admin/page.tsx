"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../lib/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import { calculatePasswordStrength } from "../../lib/passwordUtils";

interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "Admin") {
        router.push("/"); // Chỉ Admin mới được vào
      } else {
        fetchUsers();
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await api.get("/api/users/admin");
      setUsers(res.data);
    } catch {
      toast.error("Lỗi khi tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (
      !confirm(
        "Cảnh báo: Hành động này sẽ xoá vĩnh viễn tài khoản và toàn bộ dữ liệu công việc của họ. Bạn có chắc chắn?",
      )
    )
      return;

    try {
      await api.delete(`/api/users/admin/${id}`);
      toast.success("Xoá tài khoản thành công!");
      fetchUsers();
    } catch {
      toast.error("Không thể xoá tài khoản.");
    }
  };

  const handleToggleRole = async (userToUpdate: AdminUser) => {
    if (userToUpdate.username === user?.username) {
      toast.error("Bạn không thể tự đổi quyền của chính mình.");
      return;
    }
    const newRole = userToUpdate.role === "Admin" ? "User" : "Admin";
    if (
      !confirm(
        `Bạn có muốn cấp quyền ${newRole} cho tài khoản ${userToUpdate.username}?`,
      )
    )
      return;

    try {
      await api.put(`/api/users/admin/${userToUpdate.id}/role`, {
        role: newRole,
      });
      toast.success("Cập nhật quyền thành công!");
      fetchUsers();
    } catch {
      toast.error("Cập nhật quyền thất bại.");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (
      editingUser.username === user?.username &&
      editingUser.role !== "Admin"
    ) {
      toast.error("Bạn không thể tự giảm quyền của chính mình.");
      return;
    }

    if (newPassword && newPassword.includes(" ")) {
      toast.error("Mật khẩu mới không được chứa khoảng trắng");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      const payload: {
        displayName: string | null;
        email: string | null;
        newPassword?: string;
      } = {
        displayName: editingUser.displayName,
        email: editingUser.email,
      };

      if (newPassword.trim() !== "") {
        payload.newPassword = newPassword;
      }

      await api.put(`/api/users/admin/${editingUser.id}`, payload);
      toast.success("Cập nhật thông tin thành công!");
      setEditingUser(null);
      setNewPassword("");
      setConfirmPassword("");
      fetchUsers();
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string; title?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.title ||
        "Cập nhật thông tin thất bại.";
      toast.error(errorMessage);
    }
  };

  if (isLoading || loading)
    return <div className="text-center p-8">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster
        position="bottom-left"
        reverseOrder={true}
        toastOptions={{ duration: 1500 }}
      />
      <nav className="bg-emerald-600 text-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          🛠 Trang Quản Trị Hệ Thống (Admin)
        </h1>
        <div className="flex gap-4 items-center">
          <span className="font-medium">
            Xin chào, {user?.displayName || user?.username}
          </span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách người dùng
            </h2>
            <span className="text-sm text-gray-500">
              Tổng cộng: {users.length} tài khoản
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Tài khoản</th>
                  <th className="p-4">Ngày tạo</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-gray-500">
                      #{u.id}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
                          {u.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatarUrl}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-emerald-700 font-bold text-xs">
                              {u.displayName
                                ? u.displayName.charAt(0).toUpperCase()
                                : u.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {u.displayName || u.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{u.username} {u.email ? `• ${u.email}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          u.role === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={u.username === user?.username}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            u.username === user?.username
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                          }`}
                        >
                          Đổi quyền
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Cập nhật thông tin</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={editingUser.displayName || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      displayName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới (bỏ trống nếu không đổi)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Độ mạnh:</span>
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            passwordStrength.color === "bg-red-500"
                              ? "#ef4444"
                              : passwordStrength.color === "bg-orange-500"
                                ? "#f97316"
                                : passwordStrength.color === "bg-yellow-500"
                                  ? "#eab308"
                                  : "#10b981",
                        }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập lại mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
                {passwordsMatch && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    ✓ Trùng khớp
                  </p>
                )}
                {passwordsMismatch && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    ✗ Chưa khớp
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
