/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import {
    MdOutlineBarChart,
    MdCheckCircle,
    MdErrorOutline,
} from "react-icons/md";

const AggregationResponse = ({ result }) => {
    // ✅ حالة بدون نتيجة
    if (!result) {
        return (
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500 text-sm">
                No aggregation results available.
            </div>
        );
    }

    // ✅ لو النتيجة نص (زي "Most common field...") نعرضها بشكل بسيط
    if (typeof result === "string") {
        const isError = result.toLowerCase().includes("error");
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-full p-5 rounded-2xl shadow-sm border ${
                    isError
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
            >
                <div className="flex items-center gap-2">
                    {isError ? (
                        <MdErrorOutline className="text-xl" />
                    ) : (
                        <MdOutlineBarChart className="text-xl" />
                    )}
                    <p className="text-sm font-medium leading-relaxed">
                        {result}
                    </p>
                </div>
            </motion.div>
        );
    }

    // ✅ لو النتيجة Object أو Array → نعرضها في جدول
    const stats = Array.isArray(result) ? result : [result];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4"
        >
            <div className="flex items-center gap-2 text-blue-800">
                <MdOutlineBarChart className="text-2xl" />
                <h3 className="text-lg font-semibold">Aggregation Results</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-100">
                    <thead className="bg-blue-50">
                        <tr>
                            {Object.keys(stats[0] || {}).map((key) => (
                                <th
                                    key={key}
                                    className="px-3 py-2 text-left text-gray-700 font-medium border-b border-gray-100"
                                >
                                    {key}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((row, i) => (
                            <tr
                                key={i}
                                className="hover:bg-blue-50/40 transition-colors"
                            >
                                {Object.values(row).map((val, j) => (
                                    <td
                                        key={j}
                                        className="px-3 py-2 border-b border-gray-100 text-gray-800"
                                    >
                                        {val ?? "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-end gap-1 text-green-700 text-sm">
                <MdCheckCircle className="text-base" />
                <span>Aggregation completed successfully</span>
            </div>
        </motion.div>
    );
};

export default AggregationResponse;
