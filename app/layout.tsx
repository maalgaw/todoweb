import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

export const metadata: Metadata = {
 title: "Todo App",
 description: "Ứng dụng quản lý công việc đơn giản",
 icons:
 "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9' /%3E%3C/svg%3E",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
 return (
 <html lang="vi">
 <body className="bg-gray-50 min-h-screen bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-size-[20px_20px]">
 <AuthProvider>
 {children}
 </AuthProvider>
 </body>
 </html>
 );
}

