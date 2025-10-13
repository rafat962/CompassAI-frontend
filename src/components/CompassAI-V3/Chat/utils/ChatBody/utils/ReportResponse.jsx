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
import { HiOutlineBookOpen } from "react-icons/hi2";
import { LuHardDriveDownload } from "react-icons/lu";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
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
                className="w-full flex items-center justify-between cursor-pointer hover:text-violet-800 transition-all duration-200"
            >
                <span>Show Report ({report.reportType || "general"} type)</span>
                <HiOutlineBookOpen className="text-red-900 text-xl" />
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
                        p: 1,
                        bgcolor:
                            theme.palette.mode === "dark"
                                ? "#1e1e1e"
                                : "#f9fafb",
                    },
                }}
            >
                <DialogTitle className="flex justify-between items-center">
                    <span className="font-semibold text-lg">
                        📊 Report Details
                    </span>
                    <div className="flex items-center space-x-2">
                        <Tooltip title="Export To PDF">
                            <LuHardDriveDownload className="text-xl cursor-pointer hover:text-emerald-800 transition-all" />
                        </Tooltip>
                        <IconButton onClick={handleDialogClose}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent
                    dividers
                    sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs value={tabIndex} onChange={handleTabChange}>
                            <Tab label="Statistics" />
                            <Tab label="Charts" />
                        </Tabs>
                    </Box>

                    {tabIndex === 0 && (
                        <Box className="overflow-auto flex-1 p-2">
                            {summary.length === 0 ? (
                                <p className="text-center text-gray-500">
                                    No summary data available.
                                </p>
                            ) : (
                                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                                    {summary.map((field, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 border rounded-xl bg-white shadow-sm"
                                        >
                                            <h3 className="font-semibold text-gray-700 mb-2 text-center">
                                                {field.alias || field.field}
                                            </h3>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>
                                                    <span className="font-semibold">
                                                        Count:
                                                    </span>{" "}
                                                    {field.statistics.count}
                                                </li>
                                                <li>
                                                    <span className="font-semibold">
                                                        Non-null:
                                                    </span>{" "}
                                                    {
                                                        field.statistics
                                                            .nonNullCount
                                                    }
                                                </li>
                                                <li>
                                                    <span className="font-semibold">
                                                        Null:
                                                    </span>{" "}
                                                    {field.statistics.nullCount}
                                                </li>
                                                <li>
                                                    <span className="font-semibold">
                                                        Unique:
                                                    </span>{" "}
                                                    {
                                                        field.statistics
                                                            .uniqueValues
                                                    }
                                                </li>
                                                <li>
                                                    <span className="font-semibold">
                                                        Most common:
                                                    </span>{" "}
                                                    {
                                                        field.statistics
                                                            .mostCommon
                                                    }
                                                </li>
                                                {field.type === "number" && (
                                                    <>
                                                        <li>
                                                            <span className="font-semibold">
                                                                Min:
                                                            </span>{" "}
                                                            {
                                                                field.statistics
                                                                    .min
                                                            }
                                                        </li>
                                                        <li>
                                                            <span className="font-semibold">
                                                                Max:
                                                            </span>{" "}
                                                            {
                                                                field.statistics
                                                                    .max
                                                            }
                                                        </li>
                                                        <li>
                                                            <span className="font-semibold">
                                                                Average:
                                                            </span>{" "}
                                                            {field.statistics.average?.toFixed(
                                                                2
                                                            )}
                                                        </li>
                                                    </>
                                                )}
                                                <li className="mt-2">
                                                    <span className="font-semibold">
                                                        Top 3:
                                                    </span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {field.statistics.top3?.map(
                                                            (t, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                                                                        i === 0
                                                                            ? "bg-blue-500"
                                                                            : i ===
                                                                                1
                                                                              ? "bg-green-500"
                                                                              : "bg-yellow-500"
                                                                    }`}
                                                                >
                                                                    value{" "}
                                                                    {t.value}{" "}
                                                                    repeat (
                                                                    {t.count})
                                                                    Time
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Box>
                    )}

                    {tabIndex === 1 && (
                        <Box className="overflow-auto flex-1 p-3">
                            {charts.length === 0 ? (
                                <p className="text-center text-gray-500">
                                    No chart data available.
                                </p>
                            ) : (
                                <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                                    {charts.map((chart, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-4 border rounded-xl bg-white shadow-sm flex flex-col transition-transform duration-200"
                                        >
                                            <h3 className="font-semibold mb-3 text-gray-700 text-center">
                                                {chart.title || chart.alias}
                                            </h3>
                                            <div className="flex-1 min-h-[300px]">
                                                {renderChart(chart)}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500 text-center">
                                                Type: {chart.type}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ReportResponse;
