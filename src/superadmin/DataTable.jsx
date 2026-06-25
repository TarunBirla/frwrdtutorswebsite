import React from "react";

const THEME = "#5D4C29";

export const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
    style={
      active
        ? { backgroundColor: THEME, color: "#fff", boxShadow: "0 2px 8px #4B499B44" }
        : { backgroundColor: "#f1f5f9", color: "#64748b" }
    }
  >
    {label}
  </button>
);

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [...Array(totalPages)]
    .map((_, i) => i + 1)
    .filter(
      (p) =>
        p === 1 ||
        p === totalPages ||
        (p >= currentPage - 2 && p <= currentPage + 2)
    );

  return (
    <div className="flex justify-center items-center gap-1.5 mt-6 flex-wrap">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
      >
        ← Prev
      </button>

      {pages.map((page, index, arr) => (
        <React.Fragment key={page}>
          {index > 0 && arr[index - 1] !== page - 1 && (
            <span className="px-1 text-gray-400 text-sm">…</span>
          )}
          <button
            onClick={() => onPageChange(page)}
            className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all"
            style={
              currentPage === page
                ? { backgroundColor: THEME, color: "#fff" }
                : { backgroundColor: "#f1f5f9", color: "#475569" }
            }
          >
            {page}
          </button>
        </React.Fragment>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Next →
      </button>
    </div>
  );
};

const DataTable = ({
  columns,
  rows,
  loading,
  emptyMessage = "No records found",
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-3"
          style={{ borderColor: "#4B499B", borderTopColor: "transparent" }}
        />
        <p className="text-sm">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#f5f5fb" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide"
                style={{ color: "#4B499B" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12 text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="border-t border-gray-50 hover:bg-[#f5f5fb]/60 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;