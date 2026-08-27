"use client";

import { useState } from "react";
import Link from "next/link";
import api from "../../lib/axiosConfig";
import { useAuth } from "../../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/register", {
        username,
        password,
      });

      const { token, username: returnedUsername, role, displayName, avatarUrl } = response.data;
      login(token, returnedUsername, role, displayName, avatarUrl);
      toast.success("Đăng ký thành công!");
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-size-[20px_20px]">
      <Toaster position="bottom-left" toastOptions={{ duration: 1500 }} />
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bắt đầu quản lý công việc của bạn
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên đăng nhập
              </label>
              <input
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm mt-1"
                placeholder="Tên đăng nhập"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu (ít nhất 6 ký tự)
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm mt-1"
                placeholder="Mật khẩu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nhập lại mật khẩu
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm mt-1"
                placeholder="Xác nhận mật khẩu"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Đã có tài khoản? </span>
          <Link
            href="/login"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
