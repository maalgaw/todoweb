# TodoApp - Frontend

Đây là mã nguồn Giao diện (Frontend) cho ứng dụng TodoApp, được xây dựng bằng **Next.js**.

## Công nghệ sử dụng
- **Framework:** Next.js (App Router)
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS
- **Kết nối API:** Axios
- **Quản lý file (Upload Ảnh):** Supabase Storage

## Yêu cầu hệ thống
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản LTS).

## Hướng dẫn Cài đặt & Chạy ứng dụng

### Bước 1: Cài đặt thư viện
Mở Terminal tại thư mục `todoweb` và chạy lệnh sau để tải các gói thư viện cần thiết:
```bash
npm install
```

### Bước 2: Cấu hình Biến môi trường (Supabase)
Để tính năng tải ảnh đại diện hoạt động, bạn cần cấu hình Supabase.
Tạo một file tên là `.env.local` ở ngay thư mục gốc `todoweb` (ngang hàng với file `package.json`) và thêm nội dung sau:
```env
NEXT_PUBLIC_SUPABASE_URL=Đường_link_project_supabase_của_bạn
NEXT_PUBLIC_SUPABASE_ANON_KEY=Khóa_anon_key_của_bạn
```
*(Nếu bạn đã clone code này, có thể bạn cần tạo lại file `.env.local` vì nó không được đưa lên Github).*

### Bước 3: Chạy ứng dụng
Dùng lệnh sau để khởi động Frontend ở chế độ phát triển:
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ **`http://localhost:3001`**. 

**⚠️ Lưu ý:** Để đăng nhập và sử dụng, bạn bắt buộc phải khởi động cả Backend chạy song song ở cổng `5001`.
