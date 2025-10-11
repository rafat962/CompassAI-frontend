/* eslint-disable no-unused-vars */
import React, { useRef, useState } from "react";
import {
    Card,
    CardHeader,
    CardContent,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Tooltip,
} from "@mui/material";
import { ZoomIn, Download, Close } from "@mui/icons-material";
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip as ChartTooltip,
    Legend,
    Title,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// ✅ تسجيل العناصر المطلوبة لجميع الأنواع
ChartJS.register(
    ArcElement,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    ChartTooltip,
    Legend,
    Title
);

const ChartDisplay = ({ chartData }) => {
    const chartRef = useRef(null);
    const [open, setOpen] = useState(false);

    if (
        !chartData ||
        !chartData.type ||
        !chartData.labels ||
        !chartData.datasets
    ) {
        return (
            <Typography
                variant="body1"
                color="textSecondary"
                align="center"
                sx={{ p: 4 }}
            >
                ⚠️ No valid chart data provided.
            </Typography>
        );
    }

    // ✅ تحديد نوع الرسم البياني الديناميكي
    const ChartComponent =
        chartData.type === "pie" ? Pie : chartData.type === "line" ? Line : Bar; // الافتراضي bar

    // ✅ إعدادات الرسم العامة
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: { color: "#444" },
            },
            title: {
                display: true,
                text: chartData.datasets[0]?.label || "Chart",
                font: { size: 18, weight: "bold" },
            },
        },
        scales:
            chartData.type !== "pie"
                ? {
                      x: { ticks: { color: "#666" } },
                      y: { beginAtZero: true, ticks: { color: "#666" } },
                  }
                : {},
    };

    // ✅ تحميل الشارت كصورة
    const handleDownload = () => {
        const chart = chartRef.current;
        if (!chart) return;

        const link = document.createElement("a");
        link.download = `${chartData.datasets[0]?.label || "chart"}.png`;
        link.href = chart.toBase64Image("image/png", 1);
        link.click();
    };

    // ✅ مكون الشارت
    const ChartRender = (
        <div style={{ height: "350px" }}>
            <ChartComponent
                ref={chartRef}
                data={{
                    labels: chartData.labels,
                    datasets: chartData.datasets,
                }}
                options={options}
            />
        </div>
    );

    return (
        <>
            <Card
                sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    p: 2,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.paper",
                }}
            >
                <CardHeader
                    title={
                        <Typography variant="h6" textAlign="center">
                            {chartData.datasets[0]?.label || "Chart Data"}
                        </Typography>
                    }
                    action={
                        <div>
                            <Tooltip title="Download chart as image">
                                <IconButton onClick={handleDownload}>
                                    <Download />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Expand chart">
                                <IconButton onClick={() => setOpen(true)}>
                                    <ZoomIn />
                                </IconButton>
                            </Tooltip>
                        </div>
                    }
                    sx={{ flexShrink: 0 }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                    <div style={{ height: "100%", minHeight: "320px" }}>
                        {ChartRender}
                    </div>
                </CardContent>
            </Card>

            {/* ✅ نافذة التكبير */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        width: "90vw",
                        height: "90vh",
                        p: 2,
                        bgcolor: "background.paper",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h6">
                        {chartData.datasets[0]?.label || "Chart Preview"}
                    </Typography>
                    <div>
                        <Tooltip title="Download chart as image">
                            <IconButton onClick={handleDownload}>
                                <Download />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Close">
                            <IconButton onClick={() => setOpen(false)}>
                                <Close />
                            </IconButton>
                        </Tooltip>
                    </div>
                </DialogTitle>

                <DialogContent>
                    <div style={{ height: "80vh" }}>{ChartRender}</div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ChartDisplay;
