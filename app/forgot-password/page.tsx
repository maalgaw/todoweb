"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { calculatePasswordStrength } from "../../lib/passwordUtils";

// Giao diện trang quên mật khẩu và khôi phục
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      toast.success(res.data.message || "Mã xác nhận đã được gửi đi.");
      setStep(2);
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message || "Có lỗi xảy ra khi gửi email.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đủ thông tin");
      return;
    }

    if (newPassword.includes(" ")) {
      toast.error("Mật khẩu mới không được chứa khoảng trắng");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/reset-password", {
        email,
        code: otp,
        newPassword,
      });
      toast.success(res.data.message || "Đổi mật khẩu thành công!");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message ||
          "Mã xác nhận không đúng hoặc đã hết hạn.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster
        position="bottom-left"
        reverseOrder={true}
        toastOptions={{ duration: 1500 }}
      />
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Khôi phục mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1
              ? "Nhập email của bạn để nhận mã xác nhận"
              : "Nhập mã xác nhận và mật khẩu mới"}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Địa chỉ Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Ví dụ: abcd1234@gmail.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mã xác nhận (6 số)
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm text-center tracking-[0.5em] font-bold"
                  placeholder="------"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
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
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
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
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Đang xử lý..." : "Khôi phục mật khẩu"}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                Gửi lại mã
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
          >
            ← Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
}
