// Hàm tính toán độ mạnh yếu của mật khẩu
export function calculatePasswordStrength(password: string): { score: number, label: string, color: string } {
  if (!password) return { score: 0, label: "", color: "bg-gray-200" };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Cao nhất là 5, chia ra làm 4 cấp: 1 (Yếu), 2 (Trung bình), 3 (Khá), 4,5 (Mạnh)
  if (score <= 1) return { score: 1, label: "Rất yếu", color: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Yếu", color: "bg-orange-500" };
  if (score === 3) return { score: 3, label: "Trung bình", color: "bg-yellow-500" };
  return { score: 4, label: "Mạnh", color: "bg-emerald-500" };
};
