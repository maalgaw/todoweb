"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

//Định nghĩa thông tin tài khoản
interface User {
  username: string;
  email?: string | null;
  role: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

//Định nghĩa kiểu dữ liệu xác thực
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    token: string,
    username: string,
    email: string | null,
    role: string,
    displayName?: string | null,
    avatarUrl?: string | null,
  ) => void;
  logout: () => void;
  updateUser: (data: {
    displayName?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
  }) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

//Khởi tạo kho chứa dữ liệu xác thực
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//Quản lý trạng thái đăng nhập toàn cục của ứng dụng
export function AuthProvider({ children }: { children: ReactNode }) {
  //Khởi tạo các hook trạng thái lưu trữ các loại thông tin xác thực
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    function initAuth() {
      const storedToken = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");
      const storedEmail = localStorage.getItem("email");
      const storedRole = localStorage.getItem("role");
      const storedDisplayName = localStorage.getItem("displayName");
      const storedAvatarUrl = localStorage.getItem("avatarUrl");

      if (storedToken && storedUsername && storedRole) {
        setToken(storedToken);
        setUser({
          username: storedUsername,
          email: storedEmail,
          role: storedRole,
          displayName: storedDisplayName,
          avatarUrl: storedAvatarUrl,
        });
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  function login(
    newToken: string,
    username: string,
    email: string | null,
    role: string,
    displayName?: string | null,
    avatarUrl?: string | null,
  ) {
    setToken(newToken);
    setUser({ username, email, role, displayName, avatarUrl });
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", username);
    if (email) localStorage.setItem("email", email);
    localStorage.setItem("role", role);
    if (displayName) localStorage.setItem("displayName", displayName);
    if (avatarUrl) localStorage.setItem("avatarUrl", avatarUrl);

    if (role === "Admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("displayName");
    localStorage.removeItem("avatarUrl");
    setToken(null);
    setUser(null);
    router.push("/login"); // Đăng xuất xong bị văng về trang đăng nhập
  };

  function updateUser(data: {
    displayName?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
  }) {
    setUser((prev) => {
      if (!prev) return prev;
      const newUser = { ...prev, ...data };
      if (data.displayName !== undefined) {
        if (data.displayName)
          localStorage.setItem("displayName", data.displayName);
        else localStorage.removeItem("displayName");
      }
      if (data.avatarUrl !== undefined) {
        if (data.avatarUrl) localStorage.setItem("avatarUrl", data.avatarUrl);
        else localStorage.removeItem("avatarUrl");
      }
      if (data.email !== undefined) {
        if (data.email) localStorage.setItem("email", data.email);
        else localStorage.removeItem("email");
      }
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook tuỳ chỉnh để lấy trạng thái đăng nhập
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}
