import { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

export interface RecurrenceConfig {
 isRecurring: boolean;
 recurrenceType: number; // 0=None, 1=Daily, 2=Weekly, 3=Monthly, 4=Yearly
 recurrenceInterval: number;
 recurrenceDaysOfWeek: string | null;
}

interface Props {
 value: RecurrenceConfig;
 onChange: (value: RecurrenceConfig) => void;
 onClose: () => void;
}

export default function RecurrenceSelector({
 value,
 onChange,
 onClose,
}: Props) {
 const [mode, setMode] = useState<"preset" | "custom">(
 value.isRecurring &&
 (value.recurrenceInterval > 1 || value.recurrenceDaysOfWeek)
 ? "custom"
 : "preset",
 );

 const [interval, setRecurrenceInterval] = useState(
 value.recurrenceInterval || 1,
 );
 const [type, setType] = useState(value.recurrenceType || 1);
 const [days, setDays] = useState<string[]>(
 value.recurrenceDaysOfWeek ? value.recurrenceDaysOfWeek.split(",") : [],
 );

 const presets = [
 { label: "Không lặp lại", type: 0 },
 { label: "Hàng ngày", type: 1 },
 { label: "Hàng tuần", type: 2 },
 { label: "Hàng tháng", type: 3 },
 { label: "Hàng năm", type: 4 },
 ];

 const weekDays = [
 { label: "T2", value: "1" },
 { label: "T3", value: "2" },
 { label: "T4", value: "3" },
 { label: "T5", value: "4" },
 { label: "T6", value: "5" },
 { label: "T7", value: "6" },
 { label: "CN", value: "0" },
 ];

 const handleSaveCustom = () => {
 onChange({
 isRecurring: true,
 recurrenceType: type,
 recurrenceInterval: interval,
 recurrenceDaysOfWeek:
 type === 2 && days.length > 0 ? days.join(",") : null,
 });
 onClose();
 };

 const toggleDay = (dayValue: string) => {
 if (days.includes(dayValue)) {
 setDays(days.filter((d) => d !== dayValue));
 } else {
 setDays([...days, dayValue]);
 }
 };

 return (
 <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
 {mode === "preset" ? (
 <>
 {presets.map((preset) => (
 <button
 key={preset.type}
 onClick={() => {
 if (preset.type === 0) {
 onChange({
 isRecurring: false,
 recurrenceType: 0,
 recurrenceInterval: 1,
 recurrenceDaysOfWeek: null,
 });
 onClose();
 } else {
 onChange({
 isRecurring: true,
 recurrenceType: preset.type,
 recurrenceInterval: 1,
 recurrenceDaysOfWeek: null,
 });
 onClose();
 }
 }}
 className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${
 (value.isRecurring &&
 value.recurrenceType === preset.type &&
 value.recurrenceInterval === 1 &&
 !value.recurrenceDaysOfWeek) ||
 (!value.isRecurring && preset.type === 0)
 ? "text-emerald-600 font-medium bg-emerald-50"
 : "text-gray-700"
 }`}
 >
 {preset.label}
 {((value.isRecurring &&
 value.recurrenceType === preset.type &&
 value.recurrenceInterval === 1 &&
 !value.recurrenceDaysOfWeek) ||
 (!value.isRecurring && preset.type === 0)) && (
 <CheckIcon className="w-4 h-4" />
 )}
 </button>
 ))}
 <div className="border-t border-gray-100 mt-1 pt-1">
 <button
 onClick={() => setMode("custom")}
 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 "
 >
 Tùy chỉnh...
 </button>
 </div>
 </>
 ) : (
 <div className="px-4 py-2">
 <div className="flex items-center justify-between mb-3">
 <span className="font-semibold text-sm text-gray-800">
 Tùy chỉnh lặp lại
 </span>
 <button
 onClick={() => setMode("preset")}
 className="text-xs text-emerald-600 hover:underline"
 >
 Quay lại
 </button>
 </div>
 <div className="flex items-center gap-2 mb-3">
 <span className="text-sm text-gray-600">Lặp lại mỗi</span>
 <input
 type="number"
 min="1"
 value={interval}
 onChange={(e) =>
 setRecurrenceInterval(parseInt(e.target.value) || 1)
 }
 className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:border-emerald-500"
 />
 <select
 value={type}
 onChange={(e) => setType(parseInt(e.target.value))}
 className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-emerald-500 bg-white"
 >
 <option value={1}>ngày</option>
 <option value={2}>tuần</option>
 <option value={3}>tháng</option>
 <option value={4}>năm</option>
 </select>
 </div>

 {type === 2 && (
 <div className="mb-4">
 <span className="text-xs text-gray-500 block mb-2">
 Vào các ngày:
 </span>
 <div className="flex justify-between gap-1">
 {weekDays.map((day) => (
 <button
 key={day.value}
 onClick={() => toggleDay(day.value)}
 className={`w-7 h-7 rounded-full text-xs flex items-center justify-center ${
 days.includes(day.value)
 ? "bg-emerald-500 text-white"
 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
 }`}
 >
 {day.label}
 </button>
 ))}
 </div>
 </div>
 )}

 <button
 onClick={handleSaveCustom}
 className="w-full bg-emerald-600 text-white rounded-md py-2 text-sm font-medium hover:bg-emerald-700 "
 >
 Lưu
 </button>
 </div>
 )}
 </div>
 );
}

