/* eslint-disable no-unused-vars */
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
// ------------------------------------------------------ Export ------------------------------------------------------
// دالة الاكسبورت الرئيسية المعدلة
export async function executeExport(view, featureLayer, exportSettings) {
    try {
        console.log("🔹 Starting export process...", exportSettings);

        if (exportSettings.status !== "success") {
            throw new Error(
                exportSettings.message || "Invalid export settings"
            );
        }

        const {
            exportCategory,
            exportType,
            fileName,
            selectedFields,
            layoutOptions,
            message,
        } = exportSettings;

        let result;

        if (exportCategory === "layer") {
            result = await exportLayerData(
                featureLayer,
                exportType,
                fileName,
                selectedFields
            );
        } else if (exportCategory === "layout") {
            if (exportType === "pdf") {
                result = await exportToPDF(
                    view,
                    featureLayer,
                    fileName,
                    layoutOptions
                );
            } else if (exportType === "image") {
                result = await exportToImage(
                    view,
                    featureLayer,
                    fileName,
                    layoutOptions
                );
            } else {
                throw new Error(
                    `Unsupported layout export type: ${exportType}`
                );
            }
        } else {
            throw new Error("Unknown export category");
        }

        return {
            status: "success",
            message: message || "Export completed successfully",
            exportType: exportType,
            fileName,
            downloadUrl: result.downloadUrl,
            fileSize: result.fileSize,
        };
    } catch (error) {
        console.error("❌ Export error:", error);
        return {
            status: "error",
            message: `Export failed: ${error.message}`,
            error: String(error),
        };
    }
}
// تصدير بيانات الطبقة
async function exportLayerData(
    featureLayer,
    exportType,
    fileName,
    selectedFields
) {
    console.log(`📊 Exporting layer as ${exportType}...`);

    const query = featureLayer.createQuery();
    query.outFields = selectedFields;
    query.returnGeometry = exportType === "geojson";

    const result = await featureLayer.queryFeatures(query);
    const features = result.features;

    if (!features.length) {
        throw new Error("No features found to export");
    }

    switch (exportType) {
        case "csv":
            return await exportToCSV(features, fileName, selectedFields);
        case "excel":
            return await exportToExcel(features, fileName, selectedFields);
        case "geojson":
            return await exportToGeoJSON(features, fileName, selectedFields);
        default:
            throw new Error(`Unsupported layer export type: ${exportType}`);
    }
}

// تصدير الـ CSV
async function exportToCSV(features, fileName, selectedFields) {
    const headers = selectedFields.join(",");
    const rows = features.map((feature) => {
        return selectedFields
            .map((field) => {
                const value = feature.attributes[field];
                return `"${String(value || "").replace(/"/g, '""')}"`;
            })
            .join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    return downloadFile(csvContent, `${fileName}.csv`, "text/csv");
}

// تصدير الـ Excel
async function exportToExcel(features, fileName, selectedFields) {
    if (typeof XLSX === "undefined") {
        throw new Error("XLSX library not loaded");
    }

    const data = features.map((f) => {
        const row = {};
        selectedFields.forEach((field) => {
            row[field] = f.attributes[field];
        });
        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    return downloadFile(
        excelBuffer,
        `${fileName}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
}

// تصدير الـ GeoJSON
async function exportToGeoJSON(features, fileName, selectedFields) {
    const geoJSON = {
        type: "FeatureCollection",
        features: features.map((feature) => ({
            type: "Feature",
            geometry: feature.geometry,
            properties: feature.attributes,
        })),
    };

    return downloadFile(
        JSON.stringify(geoJSON),
        `${fileName}.geojson`,
        "application/geo+json"
    );
}

// تصدير صورة مع إضافة عناصر التخطيط الكاملة
async function exportToImage(view, featureLayer, fileName, layoutOptions) {
    try {
        console.log("🖼️ Creating enhanced image with layout...");

        // 1. ناخد سكرين شوت للخريطة بدقة عالية
        const imageData = await view.takeScreenshot({
            format: "png",
            quality: 1,
            width: 1200, // دقة أعلى
            height: 800,
        });

        // 2. نعمل canvas كبير للتخطيط الكامل
        const canvas = await createEnhancedLayout(
            view,
            featureLayer,
            imageData,
            layoutOptions,
            fileName
        );

        // 3. نحول ال canvas لصورة
        const finalImageUrl = canvas.toDataURL("image/png");

        // 4. ننزل الملف
        const link = document.createElement("a");
        link.href = finalImageUrl;
        link.download = `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 5. نرجع المعلومات
        return {
            downloadUrl: finalImageUrl,
            fileSize: `${(canvas.toDataURL().length / 1024).toFixed(2)} KB`,
            fileName: `${fileName}.png`,
        };
    } catch (error) {
        throw new Error(`Enhanced image export failed: ${error.message}`);
    }
}

// دالة محسنة لإنشاء تخطيط كامل
async function createEnhancedLayout(
    view,
    featureLayer,
    imageData,
    layoutOptions,
    fileName
) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // نحط حجم مناسب للتخطيط الكامل
    canvas.width = 1000;
    canvas.height = 1200; // مساحة إضافية للعناصر

    // 1. خلفية بيضاء
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. عنوان رئيسي
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 28px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(fileName || "Map Export", canvas.width / 2, 40);

    // 3. خط فاصل تحت العنوان
    ctx.strokeStyle = "#3498db";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 60);
    ctx.lineTo(canvas.width - 50, 60);
    ctx.stroke();

    // 4. نرسم الخريطة
    const mapImg = new Image();
    await new Promise((resolve) => {
        mapImg.onload = resolve;
        mapImg.src = imageData.dataUrl;
    });

    // نحسب أبعاد الخريطة
    const mapWidth = canvas.width - 100; // هامش
    const mapHeight = 600;
    const mapX = 50;
    const mapY = 80;

    ctx.drawImage(mapImg, mapX, mapY, mapWidth, mapHeight);

    // 5. إطار حول الخريطة
    ctx.strokeStyle = "#bdc3c7";
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);

    // 6. معلومات الطبقة
    let currentY = mapY + mapHeight + 30;

    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Layer Information", 50, currentY);

    currentY += 30;

    // معلومات مفصلة عن الطبقة
    const layerInfo = await getLayerInfo(featureLayer, view);
    ctx.font = "16px Arial, sans-serif";
    ctx.fillStyle = "#34495e";

    layerInfo.forEach((info, index) => {
        ctx.fillText(info, 50, currentY + index * 25);
    });

    currentY += layerInfo.length * 25 + 20;

    // 7. الليجند (لو مطلوب)
    await drawLegend(ctx, featureLayer, 50, currentY, canvas.width - 100);
    currentY += 120;

    // 8. العناصر الإضافية
    ctx.fillStyle = "#7f8c8d";
    ctx.font = "14px Arial, sans-serif";

    // شريط المقياس

    drawScaleBar(ctx, view, canvas.width - 200, currentY);

    // سهم الشمال
    drawNorthArrow(ctx, canvas.width - 80, currentY);

    // 9. التوقيع والطابع الزمني
    ctx.fillStyle = "#95a5a6";
    ctx.font = "12px Arial, sans-serif";
    ctx.textAlign = "center";

    const now = new Date();
    ctx.fillText(
        `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
        canvas.width / 2,
        canvas.height - 30
    );

    ctx.fillText(
        "Created with CompassAI",
        canvas.width / 2,
        canvas.height - 10
    );

    // 10. إطار خارجي
    ctx.strokeStyle = "#ecf0f1";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    return canvas;
}

// دالة للحصول على معلومات الطبقة
async function getLayerInfo(featureLayer, view) {
    try {
        const count = await featureLayer.queryFeatureCount();

        return [
            `• Layer Name: ${featureLayer.title || "Untitled"}`,
            `• Feature Count: ${count.toLocaleString()}`,
            `• Geometry Type: ${getGeometryTypeName(featureLayer.geometryType)}`,
            `• Scale: 1:${Math.round(view.scale).toLocaleString()}`,
            `• Coordinate System: EPSG:${view.spatialReference.wkid}`,
            `• Fields: ${featureLayer.fields.length} attribute fields`,
        ];
    } catch (error) {
        return [
            `• Layer Name: ${featureLayer.title || "Untitled"}`,
            `• Geometry Type: ${getGeometryTypeName(featureLayer.geometryType)}`,
            `• Scale: 1:${Math.round(view.scale).toLocaleString()}`,
        ];
    }
}

// دالة لرسم الليجند
async function drawLegend(ctx, featureLayer, x, y, width) {
    try {
        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText("Legend", x, y);

        const renderer = featureLayer.renderer;
        if (!renderer) return y + 30;

        let currentY = y + 40;
        const legendItemHeight = 25;
        const colorBoxSize = 15;
        const textOffset = 25;

        if (renderer.type === "simple") {
            // Simple Renderer
            const symbol = renderer.symbol;
            const label = renderer.label || "All Features";

            // Color box
            ctx.fillStyle = symbol.color || "#000000";
            ctx.fillRect(
                x,
                currentY - colorBoxSize / 2,
                colorBoxSize,
                colorBoxSize
            );

            // Label
            ctx.fillStyle = "#2c3e50";
            ctx.font = "14px Arial, sans-serif";
            ctx.fillText(label, x + textOffset, currentY + 5);

            currentY += legendItemHeight;
        } else if (renderer.type === "unique-value") {
            // Unique Value Renderer
            ctx.font = "14px Arial, sans-serif";

            const uniqueValueInfos = renderer.uniqueValueInfos || [];
            const itemsToShow = uniqueValueInfos.slice(0, 8); // نحدد لـ 8 عناصر

            itemsToShow.forEach((info, index) => {
                if (currentY > y + 200) return; // منع الخروج عن المساحة

                // Color box
                if (info.symbol && info.symbol.color) {
                    ctx.fillStyle = info.symbol.color;
                    ctx.fillRect(
                        x,
                        currentY - colorBoxSize / 2,
                        colorBoxSize,
                        colorBoxSize
                    );
                }

                // Label
                ctx.fillStyle = "#2c3e50";
                const label =
                    info.label || info.value || `Category ${index + 1}`;
                ctx.fillText(label, x + textOffset, currentY + 5);

                currentY += legendItemHeight;
            });

            if (uniqueValueInfos.length > 8) {
                ctx.fillText(
                    `... and ${uniqueValueInfos.length - 8} more`,
                    x + textOffset,
                    currentY + 5
                );
            }
        }

        return currentY + 20;
    } catch (error) {
        console.warn("Could not draw legend:", error);
        return y + 30;
    }
}

// دالة لرسم شريط المقياس
function drawScaleBar(ctx, view, x, y) {
    try {
        const scale = view.scale;
        const displayScale = `1:${Math.round(scale).toLocaleString()}`;

        ctx.fillStyle = "#2c3e50";
        ctx.font = "12px Arial, sans-serif";
        ctx.fillText(`Scale: ${displayScale}`, x, y);

        // شريط رسومي
        const barWidth = 100;
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + barWidth, y + 10);
        ctx.stroke();

        // علامات
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + 5);
        ctx.lineTo(x, y + 15);
        ctx.moveTo(x + barWidth, y + 5);
        ctx.lineTo(x + barWidth, y + 15);
        ctx.stroke();

        ctx.fillText("0", x - 5, y + 30);
        ctx.fillText(
            getScaleDistance(scale, barWidth),
            x + barWidth - 20,
            y + 30
        );
    } catch (error) {
        console.warn("Could not draw scale bar:", error);
    }
}

// دالة لرسم سهم الشمال
function drawNorthArrow(ctx, x, y) {
    try {
        ctx.fillStyle = "#2c3e50";
        ctx.font = "12px Arial, sans-serif";
        ctx.fillText("N", x, y);

        // سهم
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 5);
        ctx.lineTo(x, y + 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - 5, y + 10);
        ctx.lineTo(x, y + 5);
        ctx.lineTo(x + 5, y + 10);
        ctx.stroke();
    } catch (error) {
        console.warn("Could not draw north arrow:", error);
    }
}

// دوال مساعدة
function getGeometryTypeName(geometryType) {
    const types = {
        point: "Point",
        multipoint: "MultiPoint",
        polyline: "Polyline",
        polygon: "Polygon",
        multipatch: "MultiPatch",
    };
    return types[geometryType] || geometryType;
}

function getScaleDistance(scale, barWidth) {
    const realDistance = (scale * barWidth) / 1000;
    if (realDistance >= 1000) {
        return `${(realDistance / 1000).toFixed(1)} km`;
    } else {
        return `${Math.round(realDistance)} m`;
    }
}

// دالة محسنة لتصدير PDF مع تخطيط
async function exportToPDF(view, featureLayer, fileName, layoutOptions) {
    try {
        console.log("🖨️ Creating PDF with layout...");

        // 1. Take screenshot of the map
        const screenshot = await view.takeScreenshot({
            format: "png",
            quality: 2,
            width: 800,
            height: 500,
        });

        // 2. Create PDF
        const pdf = new jsPDF({
            orientation:
                layoutOptions.orientation === "landscape"
                    ? "landscape"
                    : "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        // 3. Add title
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(fileName || "Map Export", pageWidth / 2, margin + 5, {
            align: "center",
        });

        // 4. Add map image
        const imgWidth = pageWidth - margin * 2;
        const imgHeight =
            (imgWidth * screenshot.data.height) / screenshot.data.width;

        pdf.addImage(
            screenshot.dataUrl,
            "PNG",
            margin,
            margin + 10,
            imgWidth,
            Math.min(imgHeight, pageHeight - 60) // Ensure it fits on page
        );

        let currentY = margin + 15 + Math.min(imgHeight, pageHeight - 60);

        // 5. Add layer information
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Layer Information:", margin, currentY + 5);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        const layerInfo = [
            `Layer Name: ${featureLayer.title || "Untitled"}`,
            `Feature Count: ${await getFeatureCount(featureLayer)}`,
            `Geometry Type: ${featureLayer.geometryType}`,
            `Fields: ${featureLayer.fields.length} fields`,
        ];

        layerInfo.forEach((info, index) => {
            pdf.text(info, margin, currentY + 10 + index * 5);
        });

        currentY += 30;

        // 6. Add legend if requested
        if (layoutOptions.includeLegend && featureLayer.renderer) {
            await addLegendToPDF(
                pdf,
                featureLayer,
                margin,
                currentY,
                pageWidth - margin * 2
            );
            currentY += 40;
        }

        // 7. Add scale bar if requested
        if (layoutOptions.includeScaleBar) {
            addScaleBarToPDF(
                pdf,
                view,
                margin,
                currentY,
                pageWidth - margin * 2
            );
            currentY += 15;
        }

        // 8. Add north arrow if requested
        if (layoutOptions.includeNorthArrow) {
            addNorthArrowToPDF(
                pdf,
                margin + (pageWidth - margin - 10),
                currentY - 10
            );
        }

        // 9. Add timestamp
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
            `Generated on: ${new Date().toLocaleString()}`,
            margin,
            pageHeight - margin
        );

        // 10. Add page border
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(
            margin / 2,
            margin / 2,
            pageWidth - margin,
            pageHeight - margin
        );

        // 11. Save PDF
        pdf.save(`${fileName}.pdf`);

        return {
            downloadUrl: URL.createObjectURL(pdf.output("blob")),
            fileSize: "PDF file",
            fileName: `${fileName}.pdf`,
        };
    } catch (error) {
        console.error("❌ PDF export error:", error);
        throw new Error(`PDF creation failed: ${error.message}`);
    }
}

// دالة مساعدة للحصول على عدد الميزات
async function getFeatureCount(featureLayer) {
    try {
        const countResult = await featureLayer.queryFeatureCount();
        return countResult;
    } catch {
        return "Unknown";
    }
}

// إضافة الليجند للـ PDF
async function addLegendToPDF(pdf, featureLayer, x, y, width) {
    try {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Legend:", x, y);

        const renderer = featureLayer.renderer;
        if (!renderer) return;

        let currentY = y + 8;
        const legendItemHeight = 6;
        const colorBoxSize = 4;
        const textOffset = 8;

        if (renderer.type === "simple") {
            // Simple Renderer
            const symbol = renderer.symbol;
            const label = renderer.label || "Features";

            // Color box
            pdf.setFillColor(...hexToRgb(symbol.color || "#000000"));
            pdf.rect(
                x,
                currentY - colorBoxSize / 2,
                colorBoxSize,
                colorBoxSize,
                "F"
            );

            // Label
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(label, x + textOffset, currentY);

            currentY += legendItemHeight;
        } else if (renderer.type === "unique-value") {
            // Unique Value Renderer
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");

            const uniqueValueInfos = renderer.uniqueValueInfos || [];
            const itemsToShow = uniqueValueInfos.slice(0, 10); // Limit to 10 items

            itemsToShow.forEach((info, index) => {
                if (currentY > 250) return; // Don't go beyond page

                // Color box
                if (info.symbol && info.symbol.color) {
                    pdf.setFillColor(...hexToRgb(info.symbol.color));
                    pdf.rect(
                        x,
                        currentY - colorBoxSize / 2,
                        colorBoxSize,
                        colorBoxSize,
                        "F"
                    );
                }

                // Label
                const label = info.label || info.value || `Item ${index + 1}`;
                const truncatedLabel = pdf.splitTextToSize(
                    label,
                    width - textOffset - 5
                );

                pdf.text(truncatedLabel[0], x + textOffset, currentY);
                currentY +=
                    legendItemHeight + (truncatedLabel.length > 1 ? 3 : 0);
            });

            if (uniqueValueInfos.length > 10) {
                pdf.text(
                    `... and ${uniqueValueInfos.length - 10} more items`,
                    x + textOffset,
                    currentY
                );
            }
        }
    } catch (error) {
        console.warn("Could not add legend:", error);
    }
}

// إضافة شريط المقياس
function addScaleBarToPDF(pdf, view, x, y, width) {
    try {
        const scale = view.scale;
        const roundScale = Math.pow(10, Math.floor(Math.log10(scale)));
        const displayScale = Math.round(scale / roundScale) * roundScale;

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Scale: 1:${displayScale.toLocaleString()}`, x, y);

        // Simple scale bar graphic
        const barWidth = 40;
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(x, y + 2, x + barWidth, y + 2);
        pdf.line(x, y + 1, x, y + 3);
        pdf.line(x + barWidth, y + 1, x + barWidth, y + 3);

        pdf.text("0", x - 1, y + 6);
        pdf.text(
            getScaleDistance(displayScale, barWidth),
            x + barWidth - 5,
            y + 6
        );
    } catch (error) {
        console.warn("Could not add scale bar:", error);
    }
}

// إضافة سهم الشمال
function addNorthArrowToPDF(pdf, x, y) {
    try {
        pdf.setFontSize(8);
        pdf.text("N", x, y - 2);

        // Simple arrow
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(1);
        pdf.line(x, y, x, y + 8); // Arrow line
        pdf.line(x - 2, y + 2, x, y); // Arrow head left
        pdf.line(x + 2, y + 2, x, y); // Arrow head right
    } catch (error) {
        console.warn("Could not add north arrow:", error);
    }
}

// دوال مساعدة
function hexToRgb(hex) {
    if (!hex) return [0, 0, 0];

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
              parseInt(result[1], 16),
              parseInt(result[2], 16),
              parseInt(result[3], 16),
          ]
        : [0, 0, 0];
}

// دالة مساعدة للتحميل
function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return {
        downloadUrl: url,
        fileSize: `${(blob.size / 1024).toFixed(2)} KB`,
    };
}
