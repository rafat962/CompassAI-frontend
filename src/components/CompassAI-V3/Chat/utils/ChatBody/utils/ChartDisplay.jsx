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
    Menu,
    MenuItem,
    Snackbar,
    Alert,
    Button,
    Stack,
} from "@mui/material";
import {
    ZoomIn,
    Download,
    Close,
    Insights,
    Palette,
    Shuffle,
} from "@mui/icons-material";
import { Bar, Pie, Line } from "react-chartjs-2";
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
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [snack, setSnack] = useState({
        open: false,
        message: "",
        severity: "info",
    });
    const [aiOpen, setAiOpen] = useState(false);
    const [colorDialog, setColorDialog] = useState(false);
    const [currentColor, setCurrentColor] = useState("#4e79a7");
    const [localChart, setLocalChart] = useState(chartData);
    const [aiInsight, setAiInsight] = useState("");

    if (!localChart?.type || !localChart?.labels || !localChart?.datasets) {
        return (
            <Typography align="center" sx={{ p: 4 }}>
                ⚠️ No valid chart data.
            </Typography>
        );
    }

    const ChartComponent =
        localChart.type === "pie"
            ? Pie
            : localChart.type === "line"
              ? Line
              : Bar;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: "easeInOutQuart" },
        plugins: {
            legend: {
                position: "top",
                labels: { color: "#555", boxWidth: 20 },
            },
            title: {
                display: true,
                text: localChart.datasets[0]?.label || "Chart",
                font: { size: 18, weight: "bold" },
            },
        },
        scales:
            localChart.type !== "pie"
                ? {
                      x: { ticks: { color: "#666" } },
                      y: { beginAtZero: true, ticks: { color: "#666" } },
                  }
                : {},
    };

    // ✅ توليد ألوان عشوائية
    const randomColor = () =>
        `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`;

    const generateRandomColors = () => {
        const newDatasets = localChart.datasets.map((ds) => ({
            ...ds,
            backgroundColor: ds.data.map(() => randomColor()),
            borderColor: ds.data.map(() => randomColor()),
        }));
        setLocalChart({ ...localChart, datasets: newDatasets });
        setSnack({
            open: true,
            message: "🎨 Random colors generated!",
            severity: "success",
        });
    };

    // ✅ تغيير لون dataset الأساسي
    const handleColorChange = (e) => {
        const color = e.target.value;
        setCurrentColor(color);

        const updated = {
            ...localChart,
            datasets: localChart.datasets.map((ds) => ({
                ...ds,
                backgroundColor: color,
                borderColor: color,
            })),
        };
        setLocalChart(updated);
    };

    // ✅ تحميل كصورة PNG
    const handleDownloadPNG = () => {
        const chart = chartRef.current;
        if (!chart) {
            setSnack({
                open: true,
                message: "Chart not ready for download",
                severity: "error",
            });
            return;
        }

        try {
            const canvas = chart.canvas;
            if (!canvas) {
                throw new Error("Canvas not found");
            }

            const link = document.createElement("a");
            link.download = `${localChart.datasets[0]?.label || "chart"}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSnack({
                open: true,
                message: "📸 Chart downloaded as PNG",
                severity: "success",
            });
        } catch (error) {
            console.error("Download failed:", error);
            setSnack({
                open: true,
                message: "Download failed",
                severity: "error",
            });
        }
        setMenuAnchor(null);
    };

    // ✅ تحميل كـ CSV
    const handleDownloadCSV = () => {
        try {
            let csvContent = "";
            const chartTitle = localChart.datasets[0]?.label || "chart";

            if (localChart.type === "pie") {
                // تنسيق CSV للـ Pie chart
                csvContent = "Label,Value\n";
                localChart.labels.forEach((label, index) => {
                    const value = localChart.datasets[0].data[index];
                    csvContent += `"${label}",${value}\n`;
                });
            } else {
                // تنسيق CSV للـ Bar/Line charts (متعدد datasets)
                const headers = [
                    "Label",
                    ...localChart.datasets.map((ds) => ds.label || "Data"),
                ];
                csvContent = headers.join(",") + "\n";

                localChart.labels.forEach((label, rowIndex) => {
                    const row = [label];
                    localChart.datasets.forEach((dataset) => {
                        row.push(dataset.data[rowIndex] || 0);
                    });
                    csvContent += row.join(",") + "\n";
                });
            }

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${chartTitle}_data.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setSnack({
                open: true,
                message: "📊 Data exported as CSV",
                severity: "success",
            });
        } catch (error) {
            console.error("CSV export failed:", error);
            setSnack({
                open: true,
                message: "CSV export failed",
                severity: "error",
            });
        }
        setMenuAnchor(null);
    };

    // ✅ تحميل كـ JPEG
    const handleDownloadJPEG = () => {
        const chart = chartRef.current;
        if (!chart) return;

        try {
            const canvas = chart.canvas;
            const link = document.createElement("a");
            link.download = `${localChart.datasets[0]?.label || "chart"}.jpg`;
            link.href = canvas.toDataURL("image/jpeg", 0.9); // جودة 90%
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSnack({
                open: true,
                message: "🖼️ Chart downloaded as JPEG",
                severity: "success",
            });
        } catch (error) {
            console.error("JPEG download failed:", error);
            setSnack({
                open: true,
                message: "JPEG download failed",
                severity: "error",
            });
        }
        setMenuAnchor(null);
    };

    // ✅ توليد Insight بسيط
    const handleAIInsight = () => {
        setAiOpen(true);
        setTimeout(() => {
            if (localChart.datasets[0]?.data) {
                const maxValue = Math.max(...localChart.datasets[0].data);
                const maxIndex = localChart.datasets[0].data.indexOf(maxValue);
                const maxLabel = localChart.labels[maxIndex];

                setAiInsight(
                    `📊 Based on chart "${localChart.datasets[0]?.label}", the highest value is ${maxValue} for "${maxLabel}".`
                );
            } else {
                setAiInsight("📊 No data available for analysis.");
            }
        }, 700);
    };

    const ChartRender = (
        <div style={{ height: "350px" }}>
            <ChartComponent
                ref={chartRef}
                data={localChart}
                options={options}
            />
        </div>
    );

    return (
        <>
            <Card
                sx={{
                    borderRadius: 4,
                    boxShadow: 4,
                    p: 2,
                    width: "100%",
                    bgcolor: "background.paper",
                    transition: "0.3s",
                    "&:hover": { boxShadow: 8, transform: "scale(1.01)" },
                }}
            >
                <CardHeader
                    title={
                        <Typography variant="h6" textAlign="center">
                            {localChart.datasets[0]?.label}
                        </Typography>
                    }
                    action={
                        <>
                            <Tooltip title="Change color">
                                <IconButton
                                    color="primary"
                                    onClick={() => setColorDialog(true)}
                                >
                                    <Palette />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Random colors">
                                <IconButton
                                    color="secondary"
                                    onClick={generateRandomColors}
                                >
                                    <Shuffle />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="AI Insight">
                                <IconButton
                                    color="info"
                                    onClick={handleAIInsight}
                                >
                                    <Insights />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Download options">
                                <IconButton
                                    color="primary"
                                    onClick={(e) =>
                                        setMenuAnchor(e.currentTarget)
                                    }
                                >
                                    <Download />
                                </IconButton>
                            </Tooltip>

                            <Menu
                                anchorEl={menuAnchor}
                                open={Boolean(menuAnchor)}
                                onClose={() => setMenuAnchor(null)}
                                PaperProps={{
                                    sx: {
                                        borderRadius: 2,
                                        boxShadow: 4,
                                        bgcolor: "#fff",
                                        color: "#222",
                                        minWidth: 200,
                                    },
                                }}
                            >
                                <MenuItem onClick={handleDownloadPNG}>
                                    🖼️ Download as PNG
                                </MenuItem>
                                <MenuItem onClick={handleDownloadJPEG}>
                                    📷 Download as JPEG
                                </MenuItem>
                                <MenuItem onClick={handleDownloadCSV}>
                                    📊 Export as CSV
                                </MenuItem>
                            </Menu>

                            <Tooltip title="Expand chart">
                                <IconButton onClick={() => setOpen(true)}>
                                    <ZoomIn />
                                </IconButton>
                            </Tooltip>
                        </>
                    }
                />
                <CardContent>{ChartRender}</CardContent>
            </Card>

            {/* 🎨 Dialog لتغيير اللون */}
            <Dialog
                open={colorDialog}
                onClose={() => setColorDialog(false)}
                maxWidth="xs"
            >
                <DialogTitle>🎨 Customize Chart Color</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2, alignItems: "center" }}>
                        <input
                            type="color"
                            value={currentColor}
                            onChange={handleColorChange}
                            style={{
                                width: "80px",
                                height: "50px",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: "10px",
                            }}
                        />
                        <Typography variant="body2" color="textSecondary">
                            Pick your preferred color for the chart
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setColorDialog(false)}
                        >
                            Done
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* 🔍 تكبير */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xl"
                fullWidth
            >
                <DialogTitle
                    sx={{ display: "flex", justifyContent: "space-between" }}
                >
                    <Typography>{localChart.datasets[0]?.label}</Typography>
                    <IconButton onClick={() => setOpen(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div style={{ height: "80vh" }}>{ChartRender}</div>
                </DialogContent>
            </Dialog>

            {/* 🤖 AI Insight */}
            <Dialog
                open={aiOpen}
                onClose={() => setAiOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>AI Insight</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mt: 2 }}>
                        {aiInsight || "Generating insight..."}
                    </Typography>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={2500}
                onClose={() => setSnack({ ...snack, open: false })}
            >
                <Alert severity={snack.severity} sx={{ width: "100%" }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ChartDisplay;
