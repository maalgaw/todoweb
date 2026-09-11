# TodoApp - Frontend (todoweb)

Giao diện Web (Client Frontend) hiện đại, trực quan cho hệ thống **Quản lý công việc cá nhân & Cộng tác nhóm (TodoApp)**. Ứng dụng được xây dựng trên nền tảng **Next.js 16 (App Router)** kết hợp **React 19**, **TypeScript**, **Tailwind CSS v4**, **SignalR WebSocket** và tích hợp dịch vụ lưu trữ đám mây **Supabase Storage**.

---

## 🚀 Tính năng nổi bật

- **Quản lý công việc thông minh:** Thêm nhanh (Quick Add), đặt hạn chót (Due Date), phân loại mức độ ưu tiên (Low, Medium, High), ghim công việc quan trọng (Pinned), lọc theo ("Hôm nay", "Quan trọng", "Đã xong").
- **Lặp lại công việc tự động (Recurrence):** Thiết lập chu kỳ lặp lại hàng ngày, hàng tuần, hàng tháng, hàng năm.
- **Công việc con (Sub-tasks / Steps):** Chia nhỏ công việc phức tạp thành các bước nhỏ và theo dõi tiến độ hoàn thành.
- **Danh mục & Nhãn dán (Categories / Tags):** Phân loại công việc theo danh mục màu sắc riêng biệt.
- **Cộng tác & Chia sẻ thời gian thực (Real-time):** Chia sẻ danh sách việc cho bạn bè qua SignalR WebSocket, đồng bộ tức thì không cần tải lại trang.
- **Thùng rác (Trash):** Khôi phục công việc đã xóa hoặc xóa vĩnh viễn khỏi hệ thống.
- **Hồ sơ cá nhân & Đám mây (Cloud Storage):** Cập nhật thông tin, đổi mật khẩu và upload ảnh đại diện (Avatar) trực tiếp lên **Supabase Cloud Storage**.
- **Quản trị người dùng (Admin Dashboard):** Dành cho tài khoản quản trị theo dõi người dùng trong hệ thống.

---

## 🛠️ Công nghệ & Thư viện sử dụng

| Công nghệ / Thư viện | Phiên bản | Vai trò / Mục đích |
| :--- | :--- | :--- |
| **Next.js** | `16.3.0` | React Framework mạnh mẽ với kiến trúc App Router tối ưu hiệu năng |
| **React / React DOM** | `19.2.8` | Thư viện xây dựng giao diện người dùng theo component |
| **TypeScript** | `^5` | Kiểm soát kiểu dữ liệu an toàn, hạn chế lỗi runtime |
| **Tailwind CSS** | `^4.0` | Framework tiện ích xây dựng giao diện tùy biến, responsive |
| **Axios** | `^1.19.0` | Thư viện gọi HTTP Request kết nối RESTful API Backend |
| **@microsoft/signalr** | `^10.0.11` | Kết nối WebSocket thời gian thực nhận thông báo cập nhật công việc |
| **@supabase/supabase-js** | `^2.112.4` | SDK kết nối Supabase Cloud để lưu trữ và tải ảnh đại diện (Avatar) |
| **react-hot-toast** | `^2.6.0` | Hiển thị thông báo Toast đẹp mắt, thông minh |
| **@heroicons/react** | `^2.2.0` | Bộ biểu tượng icon hiện đại |

---

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:
- **Node.js**: Phiên bản `18.x` trở lên (khuyên dùng bản LTS `v20.x` hoặc `v22.x`). Kiểm tra bằng lệnh: `node -v`
- **npm**: Đi kèm với Node.js (`npm -v`).
- **Backend API (`Todo.Api`)**: Đã được khởi động và chạy tại cổng `http://localhost:5001`.

---

## ⚙️ Hướng dẫn Cài đặt & Cấu hình

### Bước 1: Mở Terminal tại thư mục Frontend

```bash
cd todoweb
```

### Bước 2: Cài đặt các gói phụ thuộc (Dependencies)

```bash
npm install
```

### Bước 3: Cấu hình Biến môi trường Đám mây (.env.local)

Ứng dụng sử dụng **Supabase Storage** để lưu trữ ảnh đại diện người dùng lên đám mây. Bạn cần tạo một file tên là `.env.local` tại thư mục gốc của `todoweb` (ngang hàng với `package.json`).

Nội dung file `.env.local`:

```env
# URL dự án Supabase Cloud
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Khóa công khai (Public / Anon Key) của Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# URL kết nối Backend API (mặc định http://localhost:5001/api)
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

> **📌 Lưu ý cấu hình Supabase Cloud:**
> - File `.env.local` nằm trong `.gitignore` để bảo vệ khóa API.
> - Nếu bạn tự tạo dự án Supabase riêng: Truy cập **Supabase Dashboard > Project Settings > API** để copy `Project URL` và `anon / public key`, đồng thời tạo một Bucket trong Storage tên là `avatars` ở chế độ **Public Bucket**.

---

## ▶️ Khởi chạy Ứng dụng

Khởi động máy chủ phát triển (Development Server):

```bash
npm run dev
```

Mở trình duyệt web và truy cập:
👉 **`http://localhost:3001`**

---

## 📦 Các lệnh thường dùng

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run dev` | Chạy ứng dụng ở môi trường phát triển (Cổng mặc định: `3001`) |
| `npm run build` | Đóng gói tối ưu hóa mã nguồn cho môi trường Production |
| `npm run start` | Khởi chạy bản build Production |
| `npm run lint` | Quét kiểm tra lỗi cú pháp và tiêu chuẩn code với ESLint |

---

## 📁 Cấu trúc thư mục chính

```
todoweb/
├── app/                      # Next.js App Router (Các trang giao diện)
│   ├── admin/                # Trang Quản trị hệ thống (Admin)
│   ├── forgot-password/      # Trang Quên & Đặt lại mật khẩu
│   ├── login/                # Trang Đăng nhập
│   ├── profile/              # Trang Quản lý hồ sơ cá nhân & Đổi Avatar
│   ├── register/             # Trang Đăng ký tài khoản
│   ├── layout.tsx            # Bố cục giao diện chung toàn app
│   └── page.tsx              # Bảng làm việc chính (Main Todo Dashboard)
├── components/               # Các React Component chức năng
│   ├── FriendsModal.tsx      # Modal quản lý danh sách bạn bè
│   ├── RecurrenceSelector.tsx# Bộ chọn chu kỳ lặp lại công việc
│   ├── SharePopover.tsx      # Popover chia sẻ việc cho bạn bè
│   ├── Sidebar.tsx           # Thanh điều hướng bộ lọc bên trái
│   ├── SidebarFilters.tsx    # Các bộ lọc: Hôm nay, Quan trọng, Đã xong...
│   ├── SidebarTags.tsx       # Quản lý danh mục & nhãn dán
│   ├── TodoForm.tsx          # Form nhập nhanh công việc (Quick Add)
│   ├── TodoItemEdit.tsx      # Side Drawer chỉnh sửa chi tiết & Sub-tasks
│   ├── TodoListItem.tsx      # Thẻ hiển thị từng dòng công việc
│   └── TrashView.tsx         # Màn hình quản lý thùng rác
├── contexts/
│   └── AuthContext.tsx       # Quản lý trạng thái phiên đăng nhập & User
├── lib/
│   ├── axiosConfig.ts        # Cấu hình Axios Interceptors tự động gửi JWT Token
│   ├── passwordUtils.ts      # Tiện ích kiểm tra độ mạnh mật khẩu
│   └── supabase.ts           # Khởi tạo Supabase Client tải ảnh lên cloud
├── types/                    # Định nghĩa kiểu dữ liệu TypeScript
├── .env.local                # File cấu hình biến môi trường (tự tạo)
└── package.json              # Khai báo phiên bản và thư viện
```
