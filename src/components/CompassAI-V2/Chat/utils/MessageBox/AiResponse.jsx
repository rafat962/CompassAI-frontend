/* eslint-disable no-unused-vars */
import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
const AiResponse = ({ data }) => {
    const { t } = useTranslation();

    if (!data || data.length === 0) {
        return <div>لا توجد بيانات لعرضها</div>;
    }

    // استخراج جميع الحقول الفريدة من البيانات
    const allFields = new Set();
    data.forEach((item) => {
        Object.keys(item.attributes).forEach((key) => {
            allFields.add(key);
        });
    });

    const fields = Array.from(allFields);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative overflow-auto w-full space-y-2 "
            dir="rtl"
        >
            <div className="mt-2 text-lg text-gray-600 text-center">
                عدد السجلات: {data.length}
            </div>
            <table className="w- rounded-2xl text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                {/* Table Header */}
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        {fields.map((field) => (
                            <th key={field} scope="col" className="px-6 py-3">
                                {t(field)}
                            </th>
                        ))}
                    </tr>
                </thead>
                {/* Table Rows */}
                <tbody>
                    {data.map((row, idx) => (
                        <tr
                            key={idx}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                            {fields.map((field) => (
                                <td key={field} className="px-6 py-4">
                                    {row.attributes[field] || "---"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    );
};

export default AiResponse;
