/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    Box,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { HiOutlineBookOpen, HiOutlineChevronRight } from "react-icons/hi2";
import { LuHardDriveDownload } from "react-icons/lu";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
    Bar,
    Pie,
    Line,
    Doughnut,
    PolarArea,
    Radar,
    Bubble,
    Scatter,
} from "react-chartjs-2";
import "chart.js/auto";

const ReportResponse = ({ data }) => {
    const [open, setOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const handleDownloadPDF = async () => {
        try {
            const element = document.getElementById("report-content");
            if (!element) {
                console.error("Report content not found.");
                return;
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            // حساب المقاسات حسب الطول والعرض
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("Report.pdf");
        } catch (err) {
            console.error("Error generating PDF:", err);
        }
    };

    const handleDialogOpen = () => setOpen(true);
    const handleDialogClose = () => setOpen(false);
    const handleTabChange = (_, newValue) => setTabIndex(newValue);

    const report = data || {};
    const charts = Array.isArray(report?.charts) ? report.charts : [];
    const summary = Array.isArray(report?.summary) ? report.summary : [];

    const generateColors = (count) => {
        const baseColors = [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
            "#14b8a6",
            "#84cc16",
            "#f97316",
            "#6b7280",
            "#06b6d4",
            "#a855f7",
            "#d946ef",
            "#0ea5e9",
            "#22c55e",
        ];
        return Array.from(
            { length: count },
            (_, i) => baseColors[i % baseColors.length]
        );
    };

    const getCommonOptions = (chart) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position:
                    chart.type === "pie" || chart.type === "doughnut"
                        ? "bottom"
                        : "top",
            },
            title: {
                display: !!chart.title,
                text: chart.title || "",
            },
        },
    });

    const renderChart = (chart) => {
        const labels = chart.labels || [];
        const values = chart.values || [];
        const colors = generateColors(values.length);

        const commonDataset = {
            labels,
            datasets: [
                {
                    label: chart.alias || chart.field,
                    data: values,
                    backgroundColor: colors,
                    borderColor:
                        chart.type === "line" || chart.type === "radar"
                            ? colors
                            : "#fff",
                    borderWidth: 1,
                    tension: chart.type === "line" ? 0.4 : undefined,
                },
            ],
        };

        switch (chart.type) {
            case "bar":
                return (
                    <Bar
                        data={commonDataset}
                        options={getCommonOptions(chart)}
                    />
                );
            case "line":
                return (
                    <Line
                        data={commonDataset}
                        options={getCommonOptions(chart)}
                    />
                );
            case "pie":
                return (
                    <Pie
                        data={commonDataset}
                        options={getCommonOptions(chart)}
                    />
                );
            case "doughnut":
                return (
                    <Doughnut
                        data={commonDataset}
                        options={getCommonOptions(chart)}
                    />
                );
            case "polarArea":
                return (
                    <PolarArea
                        data={commonDataset}
                        options={getCommonOptions(chart)}
                    />
                );
            case "radar":
                return (
                    <Radar
                        data={commonDataset}
                        options={getCommonOptions(chart)}
                    />
                );
            case "bubble": {
                // For bubble charts, data should be in format: [{x: value, y: value, r: radius}]
                const bubbleData = {
                    datasets: [
                        {
                            label: chart.alias || chart.field,
                            data: values.map((value, index) => ({
                                x: index,
                                y: value,
                                r:
                                    (Math.abs(value) /
                                        Math.max(
                                            ...values.map((v) => Math.abs(v))
                                        )) *
                                        30 +
                                    5,
                            })),
                            backgroundColor: colors[0],
                        },
                    ],
                };
                return (
                    <Bubble
                        data={bubbleData}
                        options={getCommonOptions(chart)}
                    />
                );
            }
            case "scatter": {
                const scatterData = {
                    datasets: [
                        {
                            label: chart.alias || chart.field,
                            data: values.map((value, index) => ({
                                x: index,
                                y: value,
                            })),
                            backgroundColor: colors[0],
                        },
                    ],
                };
                return (
                    <Scatter
                        data={scatterData}
                        options={getCommonOptions(chart)}
                    />
                );
            }
            default:
                // Fallback to bar chart for unknown types
                console.warn(
                    `Unknown chart type: ${chart.type}, falling back to bar chart`
                );
                return (
                    <Bar
                        data={commonDataset}
                        options={getCommonOptions(chart)}
                    />
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full"
        >
            {/* Trigger */}
            <div
                onClick={handleDialogOpen}
                className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-violet-100 p-2 rounded-lg transition-colors duration-300 group-hover:bg-violet-200">
                        <HiOutlineBookOpen className="text-violet-600 text-lg transition-transform duration-300 group-hover:rotate-6" />
                    </div>
                    <div>
                        <p className="text-gray-900 font-medium transition-colors duration-300">
                            {report.reportType || "General Report"}
                        </p>
                        <p className="text-gray-500 text-sm transition-opacity duration-300">
                            Tap to view details
                        </p>
                    </div>
                </div>
            </div>

            {/* Dialog */}
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
                        p: 0,
                        overflow: "hidden",
                        bgcolor:
                            theme.palette.mode === "dark"
                                ? "#18181b"
                                : "#f3f4f6",
                        boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-3 border-b bg-gradient-to-r from-violet-100 to-indigo-100">
                    <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        📊 Report Details
                    </h2>

                    <div className="flex items-center gap-3">
                        {/* <Tooltip title="Download as PDF">
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
                            >
                                <LuHardDriveDownload className="text-lg" />
                                <span>Download</span>
                            </button>
                        </Tooltip> */}
                        <IconButton onClick={handleDialogClose}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                </div>

                {/* BODY */}
                <DialogContent
                    dividers
                    sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        p: 0,
                    }}
                >
                    <div id="report-content" className="h-full flex flex-col">
                        <Box
                            sx={{
                                borderBottom: 1,
                                borderColor: "divider",
                                px: 4,
                                pt: 2,
                            }}
                        >
                            <Tabs
                                value={tabIndex}
                                onChange={handleTabChange}
                                textColor="secondary"
                                indicatorColor="secondary"
                                centered
                            >
                                <Tab label="📈 Statistics" />
                                <Tab label="📊 Charts" />
                            </Tabs>
                        </Box>

                        {/* TAB: STATISTICS */}
                        {tabIndex === 0 && (
                            <motion.div
                                key="stats"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex-1 overflow-auto p-6"
                            >
                                {summary.length === 0 ? (
                                    <p className="text-center text-gray-500">
                                        No summary data available.
                                    </p>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {summary.map((field, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ scale: 1.02 }}
                                                className="p-5 border rounded-2xl bg-white shadow-md hover:shadow-lg transition"
                                            >
                                                <h3 className="font-semibold text-indigo-700 mb-3 text-center text-lg">
                                                    {field.alias || field.field}
                                                </h3>

                                                <ul className="text-sm text-gray-700 space-y-1">
                                                    <li>
                                                        <b>Count:</b>{" "}
                                                        {field.statistics.count}
                                                    </li>
                                                    <li>
                                                        <b>Non-null:</b>{" "}
                                                        {
                                                            field.statistics
                                                                .nonNullCount
                                                        }
                                                    </li>
                                                    <li>
                                                        <b>Null:</b>{" "}
                                                        {
                                                            field.statistics
                                                                .nullCount
                                                        }
                                                    </li>
                                                    <li>
                                                        <b>Unique:</b>{" "}
                                                        {
                                                            field.statistics
                                                                .uniqueValues
                                                        }
                                                    </li>
                                                    <li>
                                                        <b>Most common:</b>{" "}
                                                        {
                                                            field.statistics
                                                                .mostCommon
                                                        }
                                                    </li>

                                                    {field.type ===
                                                        "number" && (
                                                        <>
                                                            <li>
                                                                <b>Min:</b>{" "}
                                                                {
                                                                    field
                                                                        .statistics
                                                                        .min
                                                                }
                                                            </li>
                                                            <li>
                                                                <b>Max:</b>{" "}
                                                                {
                                                                    field
                                                                        .statistics
                                                                        .max
                                                                }
                                                            </li>
                                                            <li>
                                                                <b>Average:</b>{" "}
                                                                {field.statistics.average?.toFixed(
                                                                    2
                                                                )}
                                                            </li>
                                                        </>
                                                    )}

                                                    {field.statistics.top3 && (
                                                        <li className="mt-3">
                                                            <b>Top 3:</b>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {field.statistics.top3.map(
                                                                    (t, i) => (
                                                                        <span
                                                                            key={
                                                                                i
                                                                            }
                                                                            className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                                                                                i ===
                                                                                0
                                                                                    ? "bg-blue-500"
                                                                                    : i ===
                                                                                        1
                                                                                      ? "bg-green-500"
                                                                                      : "bg-yellow-500"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                t.value
                                                                            }{" "}
                                                                            (
                                                                            {
                                                                                t.count
                                                                            }
                                                                            )
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </li>
                                                    )}
                                                </ul>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB: CHARTS */}
                        {tabIndex === 1 && (
                            <motion.div
                                key="charts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex-1 overflow-auto p-6"
                            >
                                {charts.length === 0 ? (
                                    <p className="text-center text-gray-500">
                                        No chart data available.
                                    </p>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {charts.map((chart, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ scale: 1.03 }}
                                                className="p-4 border rounded-2xl bg-white shadow-md hover:shadow-lg transition flex flex-col"
                                            >
                                                <h3 className="font-semibold mb-3 text-center text-gray-800">
                                                    {chart.title || chart.alias}
                                                </h3>
                                                <div className="flex-1 min-h-[280px]">
                                                    {renderChart(chart)}
                                                </div>
                                                <div className="mt-2 text-xs text-gray-500 text-center">
                                                    Type: {chart.type}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ReportResponse;
