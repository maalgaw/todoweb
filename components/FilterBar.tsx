//Định nghĩa kiểu dữ liệu nhận được từ component cha
interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
}

//Định nghĩa các filter
const FILTER_LABELS: Record<string, string> = {
  all: "Tất cả",
  doing: "Đang làm",
  completed: "Hoàn thành",
  overdue: "Quá hạn",
};

export default function FilterBar({
  //Destructuring
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
}: Props) {
  return (
    <>
      {/* Ô tìm kiếm */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Tìm kiếm công việc 🔍"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-400 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-shadow"
        />
      </div>

      {/* Hiển thị các nút lọc */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {Object.entries(FILTER_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:scale-110 ${
              filter === key
                ? "bg-emerald-600 text-white scale-[1.1]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent hover:border-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
