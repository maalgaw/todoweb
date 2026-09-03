"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../lib/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import { calculatePasswordStrength } from "../../lib/passwordUtils";
import NavBar from "../../components/NavBar";

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Toaster
        position="bottom-left"
        reverseOrder={true}
        toastOptions={{ duration: 1500 }}
      />
      <NavBar hideTabs={true} showDirectLogout={true} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Quản lý người dùng
            </h2>
            <p className="text-slate-500 mt-1">
              Xem, chỉnh sửa và phân quyền các tài khoản trong hệ thống
            </p>
          </div>
          <div className="w-full sm:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo username hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-lg font-semibold text-slate-800">
              Danh sách tài khoản
            </h3>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold border border-emerald-100">
              Tổng: {filteredUsers.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-bold tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tài khoản</th>
                  <th className="px-6 py-4">Quyền hạn</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-slate-400">
                      #{u.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                          {u.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatarUrl}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-slate-500 font-bold text-sm">
                              {u.displayName
                                ? u.displayName.charAt(0).toUpperCase()
                                : u.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {u.displayName || u.username}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            @{u.username} {u.email ? `• ${u.email}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm ${
                          u.role === "Admin"
                            ? "bg-linear-to-r from-violet-500 to-fuchsia-500 text-white border-transparent"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                          className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={u.username === user?.username}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                            u.username === user?.username
                              ? "bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100"
                              : "bg-amber-50 hover:bg-amber-100 text-amber-600 hover:scale-105 active:scale-95"
                          }`}
                        >
                          Đổi quyền
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.username === user?.username}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                            u.username === user?.username
                              ? "bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100"
                              : "bg-rose-50 hover:bg-rose-100 text-rose-600 hover:scale-105 active:scale-95"
                          }`}
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

      {/* Modern Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                Cập nhật thông tin
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tài khoản: @{editingUser.username}
              </p>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none transition-all"
                  placeholder="Nhập tên hiển thị..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none transition-all"
                  placeholder="Nhập địa chỉ email..."
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Mật khẩu mới{" "}
                  <span className="text-slate-400 font-normal">
                    (Bỏ trống nếu không đổi)
                  </span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none transition-all"
                  placeholder="••••••••"
                />
                {newPassword && (
                  <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">
                        Độ bảo mật:
                      </span>
                      <span
                        className="font-bold"
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
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 ease-out ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {newPassword && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none transition-all"
                    placeholder="••••••••"
                  />
                  {passwordsMatch && (
                    <p className="text-xs text-emerald-600 mt-2 font-semibold flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Mật khẩu trùng khớp
                    </p>
                  )}
                  {passwordsMismatch && (
                    <p className="text-xs text-rose-500 mt-2 font-semibold flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Mật khẩu chưa khớp
                    </p>
                  )}
                </div>
              )}

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 rounded-xl transition-all active:scale-95"
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
