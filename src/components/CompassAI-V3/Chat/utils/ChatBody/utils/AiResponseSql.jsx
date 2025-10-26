/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
    HiArrowsPointingOut,
    HiChevronDoubleDown,
    HiChevronDoubleUp,
    HiTableCells,
} from "react-icons/hi2";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    useMediaQuery,
    useTheme,
    IconButton,
    Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

const AiResponseSql = ({ data, view }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedRow, setSelectedRow] = useState(null);
    // ----------------- zoom -----------------
    const zoomTooItem = (row, id) => {
        setSelectedRow(id);
        view.goTo(row?.geometry);
    };
    // -----------------  -----------------
    const ExportToExcel = () => {
        try {
            // تحضير البيانات للتصدير
            const dataToExport = data.map((item) => item.attributes);
            // إنشاء ورقة عمل من البيانات
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            // إنشاء مصنف وإضافة الورقة
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "البيانات");

            // توليد ملف Excel وتنزيله
            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            // إنشاء رابط تنزيل
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "Data.xlsx";
            link.click();
            // تحرير الذاكرة
            setTimeout(() => URL.revokeObjectURL(url), 100);
            toast.success("Data exported to Excel successfully");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("An error occurred while exporting the data");
        }
    };
    // ✅ الفتح والغلق
    const handleDialogOpen = () => setOpen(true);
    const handleDialogClose = () => setOpen(false);

    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500">there is no Data</div>
        );
    }

    // ✅ استخراج كل الحقول من الـ attributes
    const fields = Array.from(
        new Set(data.flatMap((item) => Object.keys(item.attributes)))
    );

    // ✅ جدول جاهز للاستخدام في أكثر من مكان
    const TableComponent = (
        <div
            className={`overflow-auto transition-all duration-500 ${
                expanded ? "max-h-[75vh]" : "max-h-64"
            } border `}
        >
            <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                        {fields.slice(0, 3).map((field) => (
                            <th key={field} className="px-4 py-3">
                                {t(field)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr
                            key={idx}
                            className={`${selectedRow === idx ? "bg-gray-50" : "bg-white"}  border-b dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                            onClick={() => zoomTooItem(row, idx)}
                        >
                            {fields.slice(0, 3).map((field) => (
                                <td key={field} className="px-4 py-2">
                                    {row.attributes[field] ?? "---"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full space-y-2"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="text-lg text-gray-800">
                    recorde Num :{" "}
                    <span className="font-bold">{data.length}</span>
                </div>
                {/* Fullscreen Dialog Button */}
                <button
                    onClick={handleDialogOpen}
                    className="flex items-center justify-center cursor-pointer hover:text-blue-600  px-3 py-1 rounded-xl transition-all duration-300"
                    title="Display"
                >
                    <HiArrowsPointingOut className="text-xl" />
                </button>

                {/* <div className="flex items-center gap-2"> */}
                {/* Expand/Collapse Button */}
                {/* <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl transition-all duration-300"
                        title={expanded ? "إخفاء" : "توسيع"}
                    >
                        {expanded ? (
                            <HiChevronDoubleUp />
                        ) : (
                            <HiChevronDoubleDown />
                        )}
                    </button> */}
                {/* </div> */}
            </div>

            {/* Inline Table */}
            {TableComponent}

            {/* Dialog (Full-screen or Wide modal) */}
            <Dialog
                open={open}
                onClose={handleDialogClose}
                fullScreen={fullScreen}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        width: "90vw",
                        height: "85vh",
                        p: 1,
                        bgcolor:
                            theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                    },
                }}
            >
                <DialogTitle className="flex justify-between items-center">
                    <span>📊 Table Data</span>
                    <div className="flex items-center justify-center space-x-2">
                        <Tooltip title="Export To Excel">
                            <HiTableCells
                                onClick={ExportToExcel}
                                className="text-xl cursor-pointer hover:text-emerald-800 trans"
                            />
                        </Tooltip>
                        <IconButton onClick={handleDialogClose}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>
                {/* ✅ هنا بنرسم الجدول بحالة expanded داخل الديالوج */}
                <DialogContent
                    dividers
                    sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div className="flex-1 overflow-auto">
                        <div
                            className={`overflow-auto transition-all duration-500 max-h-full border `}
                        >
                            <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 sticky top-0">
                                    <tr>
                                        {fields.map((field) => (
                                            <th
                                                key={field}
                                                className="px-4 py-3"
                                            >
                                                {field}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, idx) => (
                                        <tr
                                            onClick={() =>
                                                zoomTooItem(row, idx)
                                            }
                                            key={idx}
                                            className={`${selectedRow === idx ? "bg-gray-50" : "bg-white"}  border-b dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                                        >
                                            {fields.map((field) => (
                                                <td
                                                    key={field}
                                                    className="px-4 py-2"
                                                >
                                                    {row.attributes[field] ??
                                                        "---"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default AiResponseSql;
