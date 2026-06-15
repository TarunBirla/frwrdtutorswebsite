// import React from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Area,
//   AreaChart,
// } from "recharts";

// const data = [
//   { label: "Jan", RFQViewed: 10, QuoteSubmitted: 15 },
//   { label: "Feb", RFQViewed: 25, QuoteSubmitted: 20 },
//   { label: "Mar", RFQViewed: 15, QuoteSubmitted: 35 },
//   { label: "Apr", RFQViewed: 30, QuoteSubmitted: 28 },
//   { label: "May", RFQViewed: 12, QuoteSubmitted: 50 },
//   { label: "Jun", RFQViewed: 18, QuoteSubmitted: 40 },
//   { label: "Jul", RFQViewed: 15, QuoteSubmitted: 42 },
//   { label: "Aug", RFQViewed: 22, QuoteSubmitted: 35 },
//   { label: "Sep", RFQViewed: 10, QuoteSubmitted: 50 },
// ];

// export default function VendorEngagementChart() {
//   return (
//     <div
//       style={{
//         width: "100%",
//         height: 300,
//         backgroundColor: "white",
//         borderRadius: "12px",
//         padding: "20px",
//         fontFamily: "sans-serif",
//       }}
//     >
//       <h3 style={{ color: "#2A2A2A", marginBottom: "10px", fontWeight: 500 }}>
//         Vendor Engagement Rate
//       </h3>

//       {/* Legend */}
//       <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//           <div
//             style={{
//               width: "10px",
//               height: "10px",
//               backgroundColor: "#FF6B00",
//               borderRadius: "50%",
//             }}
//           />
//           <span style={{ fontSize: "14px", color: "#434343" }}>RFQ Viewed</span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//           <div
//             style={{
//               width: "10px",
//               height: "10px",
//               backgroundColor: "#00BFFF",
//               borderRadius: "50%",
//             }}
//           />
//           <span style={{ fontSize: "14px", color: "#434343" }}>
//             Quote Submitted
//           </span>
//         </div>
//       </div>

//       <ResponsiveContainer width="100%" height="80%">
//         <LineChart data={data}>
//           <defs>
//             <linearGradient id="colorRFQ" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.3} />
//               <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
//             </linearGradient>
//             <linearGradient id="colorQuote" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor="#00BFFF" stopOpacity={0.3} />
//               <stop offset="100%" stopColor="#00BFFF" stopOpacity={0} />
//             </linearGradient>
//           </defs>

//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="label" />
//           <YAxis tickFormatter={(tick) => `${tick}%`} domain={[0, 70]} />
//           <Tooltip formatter={(value) => `${value}%`} />

//           {/* Area Fills Below Lines */}
//           <Area
//             type="monotone"
//             dataKey="RFQViewed"
//             stroke="none"
//             fill="url(#colorRFQ)"
//           />
//           <Area
//             type="monotone"
//             dataKey="QuoteSubmitted"
//             stroke="none"
//             fill="url(#colorQuote)"
//           />

//           {/* Lines on top */}
//           <Line
//             type="monotone"
//             dataKey="RFQViewed"
//             stroke="#FF6B00"
//             strokeWidth={2.5}
//             dot={false}
//           />
//           <Line
//             type="monotone"
//             dataKey="QuoteSubmitted"
//             stroke="#00BFFF"
//             strokeWidth={2.5}
//             dot={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine, // <-- add this
} from "recharts";

const data = [
  { name: "Electronics", value: 600000 },
  { name: "Packaging", value: 8000000 },
  { name: "Mobility", value: 700000 },
  { name: "Furniture", value: 16000000 },
  { name: "Medicine", value: 750000 },
];

const colors = ["#6EE7B7", "#FDBA74", "#86EFAC", "#C4B5FD", "#F9A8D4"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white rounded px-2 py-1 border border-gray-200 text-xs shadow">
        <p className="text-gray-800 font-medium">{name}</p>
        <p className="text-gray-500">
          {Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(value)}
        </p>
      </div>
    );
  }
  return null;
};

const AveragePOValueChart = () => {
  return (
    <div className="rounded-2xl bg-[#F9FAFB] p-4 shadow-sm w-full max-w-md">
      <h3 className="text-[#1A1A3C] text-lg font-semibold mb-4">
        Average PO Value
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid
            stroke="#E5E7EB"
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          <YAxis
            axisLine={{ stroke: "#E9E8EC", strokeWidth: 1 }}
            tickLine={false}
            tickFormatter={(tick) =>
              tick >= 1000000
                ? `${tick / 1000000}M`
                : tick >= 1000
                ? `${tick / 1000}K`
                : tick
            }
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />

          {/* ✅ Add this line at 1M (or any other threshold you want) */}
          <ReferenceLine
            y={1000000}
            stroke="#A78BFA"
            strokeDasharray="3 3"
            strokeWidth={1}
          />

          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AveragePOValueChart;
