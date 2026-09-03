"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/axiosConfig";
import { useAuth } from "../../contexts/AuthContext";
import { calculatePasswordStrength } from "../../lib/passwordUtils";
import { toast, Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    if (username.includes(" ")) {
      toast.error("Tên đăng nhập không được để trống");
      return;
    }
    if (password.includes(" ")) {
      toast.error("Mật khẩu không được chứa khoảng trắng!");
      return;
    }
    if (email.includes(" ")) {
      toast.error("Email không được có khoảng trắng");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/register", {
        username,
        email,
        password,
      });

      const {
        token,
        username: returnedUsername,
        email: returnedEmail,
        role,
        displayName,
        avatarUrl,
      } = response.data;
      login(
        token,
        returnedUsername,
        returnedEmail,
        role,
        displayName,
        avatarUrl,
      );
      toast.success("Đăng ký thành công!");
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Đăng ký thất bại");
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
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bắt đầu quản lý công việc của bạn
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm mt-1"
                placeholder="Địa chỉ Email"
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
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Độ mạnh mật khẩu:</span>
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
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
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
              {passwordsMatch && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  ✓ Mật khẩu trùng khớp
                </p>
              )}
              {passwordsMismatch && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  ✗ Mật khẩu chưa khớp
                </p>
              )}
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
