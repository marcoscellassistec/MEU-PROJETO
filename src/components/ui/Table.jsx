import React from "react";

export const Table = ({ columns, rows }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-500">
        <tr>
          {columns.map((col) => (
            <th key={col} className="px-4 py-3 font-semibold">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, index) => (
          <tr key={index} className="text-slate-700">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-4 py-3">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
