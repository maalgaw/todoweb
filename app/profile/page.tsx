"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/axiosConfig";
import { supabase } from "../../lib/supabase";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { calculatePasswordStrength } from "../../lib/passwordUtils";

export default function ProfilePage() {
  const {
    user,
    updateUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    //Làm mới profile
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/users/profile");
        const data = response.data;
        setDisplayName(data.displayName || "");
        setEmail(data.email || "");
        setAvatarUrl(data.avatarUrl || "");
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  //Xử lý thay đổi avatar (Chỉ tạo preview cục bộ)
  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    // Giải phóng bộ nhớ của URL preview cũ nếu có
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  //Xử lý cập nhật thông tin
  async function handleSave() {
    if (newPassword && newPassword.includes(" ")) {
      toast.error("Mật khẩu mới không được chứa khoảng trắng");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return;
    }

    if (newPassword && !oldPassword) {
      toast.error("Vui lòng nhập mật khẩu cũ để đổi mật khẩu mới");
      return;
    }

    setIsLoading(true);

    try {
      let finalAvatarUrl = avatarUrl; // Mặc định giữ URL cũ

      // Nếu có chọn file mới -> Upload lên Supabase trước khi lưu profile
      if (selectedFile) {
        setIsUploading(true);
        const toastId = toast.loading("Đang tải ảnh lên Cloud...");
        
        try {
          const fileExt = selectedFile.name.split(".").pop();
          const fileName = `${user?.username}-${Date.now()}.${fileExt}`;

          // Xoá avatar cũ (nếu có)
          const oldUrl = avatarUrl || user?.avatarUrl;
          if (oldUrl) {
            const oldFileName = oldUrl.split("/avatars/").pop();
            if (oldFileName) {
              await supabase.storage
                .from("avatars")
                .remove([oldFileName])
                .catch(() => {});
            }
          }

          const { error } = await supabase.storage
            .from("avatars")
            .upload(fileName, selectedFile);

          if (error) throw error;

          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);

          finalAvatarUrl = publicUrlData.publicUrl;
          setAvatarUrl(finalAvatarUrl);
          toast.success("Tải ảnh thành công!", { id: toastId });
        } catch (uploadError) {
          const msg = (uploadError as Error).message || "Lỗi khi tải ảnh lên Supabase";
          toast.error(msg, { id: toastId });
          setIsUploading(false);
          setIsLoading(false);
          return; // Dừng việc lưu profile nếu tải ảnh thất bại
        }
        setIsUploading(false);
      }

      await api.put("/api/users/profile", {
        displayName: displayName || null,
        email: email || null,
        avatarUrl: finalAvatarUrl || null,
        oldPassword: oldPassword || null,
        newPassword: newPassword || null,
      });

      // Cập nhật lại context
      updateUser({
        displayName: displayName || null,
        email: email || null,
        avatarUrl: avatarUrl || null,
      });
      toast.success("Cập nhật thông tin thành công!");

      // Xóa form và trạng thái tạm
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const msg =
        axiosError.response?.data?.message || "Lỗi khi cập nhật thông tin";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-size-[20px_20px] py-10">
      <Toaster position="bottom-left" toastOptions={{ duration: 1500 }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            <span>&larr;</span> Quay lại trang chủ
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Tài khoản
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
        >
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-10">
              {/* Cột trái: Avatar */}
              <div className="flex flex-col items-center shrink-0 relative">
                {previewUrl && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-20 transform translate-x-2 -translate-y-1">
                    CHƯA LƯU
                  </div>
                )}
                <div className="w-40 h-40 rounded-full bg-emerald-100 border-4 border-emerald-500 overflow-hidden shadow-lg relative group flex items-center justify-center mb-4">
                  {previewUrl || avatarUrl || user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl || avatarUrl || user?.avatarUrl || ""}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl text-emerald-700 font-bold">
                      {displayName
                        ? displayName.charAt(0).toUpperCase()
                        : user?.username.charAt(0).toUpperCase()}
                    </span>
                  )}

                  {/* Overlay hover */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                  >
                    <span className="text-2xl mb-1">📸</span>
                    <span className="text-sm font-medium">
                      {isUploading ? "Đang tải..." : "Đổi ảnh"}
                    </span>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isUploading ? "Đang tải lên..." : "Tải ảnh mới lên"}
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center max-w-37.5">
                  Dung lượng tối đa 2MB. Hỗ trợ JPG, PNG.
                </p>
              </div>

              {/* Cột phải: Form */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                    Thông tin cơ bản
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên đăng nhập (Không thể đổi)
                      </label>
                      <input
                        type="text"
                        value={user?.username}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên hiển thị
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Nhập tên hiển thị của bạn..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập địa chỉ Email..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                    Đổi mật khẩu
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Bỏ trống nếu không muốn đổi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                      />
                      <div className="mt-2 flex justify-end">
                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                        >
                          Bạn quên mật khẩu hiện tại?
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                        />
                        {newPassword && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Độ mạnh:</span>
                              <span className="font-semibold" style={{ color: passwordStrength.color === 'bg-red-500' ? '#ef4444' : passwordStrength.color === 'bg-orange-500' ? '#f97316' : passwordStrength.color === 'bg-yellow-500' ? '#eab308' : '#10b981' }}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden flex">
                              <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 4) * 100}%` }}></div>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                        />
                        {passwordsMatch && (
                          <p className="text-xs text-emerald-600 mt-1 font-medium">✓ Trùng khớp</p>
                        )}
                        {passwordsMismatch && (
                          <p className="text-xs text-red-500 mt-1 font-medium">✗ Chưa khớp</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
