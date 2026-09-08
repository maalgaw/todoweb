"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/axiosConfig";
import { useAuth } from "../../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";

// Giao diện trang đăng nhập
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  async function handleLogin(e: React.SubmitEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });

      const {
        token,
        username: returnedUsername,
        email,
        role,
        displayName,
        avatarUrl,
      } = response.data;
      login(token, returnedUsername, email, role, displayName, avatarUrl);
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-size-[20px_20px]">
      <Toaster position="bottom-left" toastOptions={{ duration: 1500 }} />
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chào mừng bạn quay trở lại Todo App
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md space-y-4">
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
                Mật khẩu
              </label>
              <input
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm mt-1"
                placeholder="Mật khẩu"
              />
            </div>

            <div className="flex items-center justify-end mt-2">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Chưa có tài khoản? </span>
          <Link
            href="/register"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
