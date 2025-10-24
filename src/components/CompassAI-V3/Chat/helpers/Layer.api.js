/* eslint-disable no-unused-vars */
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline";
// --------------------------- Export ---------------------------
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";
export const graphicsLayer = new GraphicsLayer();
// --------------------------- Sql ---------------------------
async function getLayerData(view, whereClause, featureLayer) {
    // حط الـ whereClause
    featureLayer.definitionExpression = whereClause;

    // نفّذ الكويري
    const res = await featureLayer.queryFeatures({
        where: whereClause,
        outFields: ["*"],
        returnGeometry: true, // مهم عشان نرسم
    });

    // امسح الجرافيكس القديمة
    graphicsLayer.removeAll();

    // لو الطبقة مش مضافة، أضفها
    if (!view.map.layers.includes(graphicsLayer)) {
        view.map.add(graphicsLayer);
    }

    // ارسم كل Feature برمز مناسب حسب نوع الـ geometry
    const graphics = res.features.map((feature) => {
        const geometryType = feature.geometry.type;

        let symbol;

        switch (geometryType) {
            case "point":
            case "multipoint":
                symbol = {
                    type: "simple-marker",
                    color: [255, 0, 0, 0.8],
                    size: 8,
                    outline: {
                        color: [255, 255, 255],
                        width: 1,
                    },
                };
                break;

            case "polyline":
                symbol = {
                    type: "simple-line",
                    color: [0, 0, 255, 1],
                    width: 2,
                };
                break;

            case "polygon":
                symbol = {
                    type: "simple-fill",
                    color: [0, 255, 0, 0.3],
                    outline: {
                        color: [0, 255, 0, 1],
                        width: 1,
                    },
                };
                break;

            default:
                symbol = {
                    type: "simple-marker",
                    color: [128, 128, 128, 0.5],
                };
                break;
        }

        return new Graphic({
            geometry: feature.geometry,
            attributes: feature.attributes,
            symbol,
            popupTemplate: {
                title: "Feature Info",
                content: Object.entries(feature.attributes)
                    .map(([key, val]) => `<b>${key}:</b> ${val}`)
                    .join("<br>"),
            },
        });
    });
    graphicsLayer.title = "Selected Items";

    graphicsLayer.addMany(graphics);

    // اعمل zoom على النتيجة
    // if (res.features.length > 0) {
    //     await view.goTo(res.features);
    // }
    let data = res.features;
    return data;
}

// --------------------------- Sympology ---------------------------

function fixSymbolTypeForGeometry(symbol, geometryType) {
    if (!symbol || !geometryType) return symbol;

    const color = symbol.color || "#cccccc";

    switch (geometryType) {
        case "polygon":
            return {
                type: "simple-fill",
                color,
                outline: { color: "#ffffff", width: 0.5 },
            };
        case "polyline":
            return {
                type: "simple-line",
                color,
                width: 2,
            };
        case "point":
        default:
            return {
                type: "simple-marker",
                color,
                size: symbol.size || 8,
                outline: { color: "#ffffff", width: 0.5 },
            };
    }
}
function fixRendererForGeometry(renderer, geometryType) {
    if (!renderer || !geometryType) return renderer;

    // 🧩 اعمل نسخة جديدة بالكامل (عشان تتجنب تعديل كائن ArcGIS مباشر)
    const fixedRenderer = JSON.parse(JSON.stringify(renderer));

    // عدّل الرموز في uniqueValueInfos مباشرة
    if (
        fixedRenderer.uniqueValueInfos &&
        Array.isArray(fixedRenderer.uniqueValueInfos)
    ) {
        for (let i = 0; i < fixedRenderer.uniqueValueInfos.length; i++) {
            const info = fixedRenderer.uniqueValueInfos[i];
            info.symbol = fixSymbolTypeForGeometry(info.symbol, geometryType);
        }
    }

    // عدّل الـ defaultSymbol
    if (fixedRenderer.defaultSymbol) {
        fixedRenderer.defaultSymbol = fixSymbolTypeForGeometry(
            fixedRenderer.defaultSymbol,
            geometryType
        );
    }

    return fixedRenderer;
}

// --------------------------- Aggregation ---------------------------
async function applyAggregation(aggregationData, featureLayer) {
    try {
        if (
            !aggregationData ||
            !aggregationData.aggregations ||
            aggregationData.aggregations.length === 0
        ) {
            console.warn("No aggregations found.");
            return;
        }

        const layer = featureLayer;
        const query = layer.createQuery();
        query.where = aggregationData.where || "1=1";

        const agg = aggregationData.aggregations[0];
        const supportedStats = [
            "sum",
            "avg",
            "min",
            "max",
            "count",
            "stddev",
            "var",
        ];

        // ✅ لو نوع الإحصاء غير مدعوم (mode مثلاً) نحسبه يدويًا
        if (!supportedStats.includes(agg.statisticType)) {
            console.log(`⚙️ Custom aggregation for type: ${agg.statisticType}`);

            // اجلب البيانات كلها مؤقتاً
            const result = await layer.queryFeatures(query);
            if (!result.features || result.features.length === 0) {
                return "No data found for aggregation.";
            }

            const values = result.features.map(
                (f) => f.attributes[agg.onField]
            );

            let output = "";

            if (agg.statisticType === "mode") {
                // 🧮 احسب أكتر قيمة متكررة
                const freq = {};
                for (const val of values) {
                    if (val != null) freq[val] = (freq[val] || 0) + 1;
                }
                const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
                const [modeValue, modeCount] = sorted[0] || ["N/A", 0];
                output = `Most common ${agg.onField}: ${modeValue} (appears ${modeCount} times)`;
            } else {
                output = `Unsupported aggregation type: ${agg.statisticType}`;
            }

            return output;
        }

        // ✅ الأنواع المدعومة نرسلها للسيرفر
        if (aggregationData.groupByField) {
            query.groupByFieldsForStatistics = [aggregationData.groupByField];
        }

        query.outStatistics = aggregationData.aggregations.map((agg) => ({
            onStatisticField: agg.onField,
            outStatisticFieldName: agg.outField || agg.onField,
            statisticType: agg.statisticType,
        }));

        console.log("query", query);

        const result = await layer.queryFeatures(query);
        if (result.features.length > 0) {
            const stats = result.features.map((f) => f.attributes);
            console.log("✅ Aggregation result:", stats);

            const summary = stats
                .map((s) =>
                    Object.entries(s)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")
                )
                .join(" | ");

            return `Aggregation results → ${summary}`;
        } else {
            return "No data found for aggregation.";
        }
    } catch (err) {
        console.error("❌ Error running aggregation:", err);
        return "Error performing aggregation.";
    }
}

// --------------------------- LandMark ---------------------------
async function getLandmarksData(view, params) {
    try {
        const { location, radius } = params;
        let [lat, lng] = location.split(",").map(Number);

        console.log(
            `📍 Using center: lat=${lat}, lon=${lng}, radius=${radius}m`
        );

        // 🔹 استعلام محسن يرجع أماكن مفيدة فقط (ليست مباني عادية)
        const query = `
[out:json][timeout:45];
(
  // 🏥 المرافق والخدمات (مستشفيات، بنوك، مدارس)
  node["amenity"~"hospital|clinic|pharmacy|bank|atm|police|fire_station|post_office"](around:${radius},${lat},${lng});
  way["amenity"~"hospital|clinic|pharmacy|bank|atm|police|fire_station|post_office"](around:${radius},${lat},${lng});
  
  // 🍽️ المطاعم والمقاهي
  node["amenity"~"restaurant|cafe|fast_food|bar|pub|ice_cream"](around:${radius},${lat},${lng});
  way["amenity"~"restaurant|cafe|fast_food|bar|pub|ice_cream"](around:${radius},${lat},${lng});
  
  // 🛒 المحلات التجارية
  node["shop"~"supermarket|mall|convenience|bakery|butcher|clothes|shoes|electronics"](around:${radius},${lat},${lng});
  way["shop"~"supermarket|mall|convenience|bakery|butcher|clothes|shoes|electronics"](around:${radius},${lat},${lng});
  
  // 🏨 السياحة والفنادق
  node["tourism"~"hotel|hostel|guest_house|attraction|museum|viewpoint"](around:${radius},${lat},${lng});
  way["tourism"~"hotel|hostel|guest_house|attraction|museum|viewpoint"](around:${radius},${lat},${lng});
  
  // 🏛️ أماكن العبادة والمعالم التاريخية
  node["amenity"~"place_of_worship"](around:${radius},${lat},${lng});
  way["amenity"~"place_of_worship"](around:${radius},${lat},${lng});
  node["historic"~"monument|memorial|castle|fort"](around:${radius},${lat},${lng});
  way["historic"~"monument|memorial|castle|fort"](around:${radius},${lat},${lng});
  
  // ⛽ محطات الوقود
  node["amenity"~"fuel"](around:${radius},${lat},${lng});
  way["amenity"~"fuel"](around:${radius},${lat},${lng});
  
  // 🚌 مواقف الباصات
  node["highway"~"bus_stop"](around:${radius},${lat},${lng});
  
  // 🏫 المدارس والجامعات
  node["amenity"~"school|university|college|kindergarten"](around:${radius},${lat},${lng});
  way["amenity"~"school|university|college|kindergarten"](around:${radius},${lat},${lng});
  
  // 🏢 مبانٍ مهمة (مكاتب، حكومية)
  node["office"](around:${radius},${lat},${lng});
  way["office"](around:${radius},${lat},${lng});
  node["building"~"university|school|hospital|mosque|church|train_station|office"](around:${radius},${lat},${lng});
  way["building"~"university|school|hospital|mosque|church|train_station|office"](around:${radius},${lat},${lng});
);
(._;>;);
out center;
`;

        console.log("🌐 Sending optimized Overpass query...");
        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `data=${encodeURIComponent(query)}`,
            }
        );

        const data = await response.json();
        console.log(
            "✅ Overpass response - Elements found:",
            data.elements?.length
        );

        if (!data.elements?.length) {
            console.warn("⚠️ No meaningful landmarks found in this area.");

            // عرض رسالة للمستخدم
            view.popup.open({
                title: "لا توجد معالم",
                content:
                    "لم يتم العثور على معالم مميزة في النطاق المحدد. حاول زيادة نصف القطر أو اختيار موقع مختلف.",
                location: new Point({ longitude: lng, latitude: lat }),
            });
            return [];
        }

        // 🔹 فلترة العناصر التي لديها أسماء أو أنواع محددة
        const meaningfulElements = data.elements.filter((element) => {
            const tags = element.tags || {};

            // نأخذ العناصر التي لها اسم أو نوع محدد
            return (
                tags.name ||
                tags.amenity ||
                tags.shop ||
                tags.tourism ||
                tags.historic ||
                tags.office ||
                (tags.building && tags.building !== "yes") || // مبانٍ محددة وليست مجرد 'yes'
                tags.highway === "bus_stop"
            );
        });

        console.log(
            "🎯 Meaningful elements after filtering:",
            meaningfulElements.length
        );

        if (meaningfulElements.length === 0) {
            console.warn("⚠️ No elements with meaningful information found.");
            return [];
        }

        // 🔹 إزالة الطبقة القديمة
        const oldLayer = view.map.findLayerById("landmarksLayer");
        if (oldLayer) view.map.remove(oldLayer);

        const graphicsLayer = new GraphicsLayer({
            id: "landmarksLayer",
            title: "العلامات المميزة",
            listMode: "show",
        });
        view.map.add(graphicsLayer);

        // 🔹 معالجة البيانات وعرضها
        processAndDisplayLandmarks(
            meaningfulElements,
            graphicsLayer,
            view,
            lat,
            lng
        );

        return meaningfulElements;
    } catch (err) {
        console.error("❌ Error in getLandmarksData:", err);

        // عرض رسالة خطأ للمستخدم
        view.popup.open({
            title: "خطأ في جلب البيانات",
            content: "حدث خطأ أثناء جلب المعالم. حاول مرة أخرى.",
            location: view.center,
        });

        return [];
    }
}

// 🔹 دالة محسنة لمعالجة وعرض المعالم
function processAndDisplayLandmarks(
    elements,
    graphicsLayer,
    view,
    centerLat,
    centerLng
) {
    const nodeMap = {};

    // إنشاء خريطة العقد
    elements
        .filter((el) => el.type === "node")
        .forEach((node) => {
            nodeMap[node.id] = { lon: node.lon, lat: node.lat };
        });

    let featuresAdded = 0;
    const categories = {};

    elements.forEach((place) => {
        const tags = place.tags || {};
        const name = tags.name || "غير معروف";
        const type = getPlaceType(tags);

        // تتبع الإحصائيات
        categories[type] = (categories[type] || 0) + 1;

        let geometry = null;
        let symbol = null;

        // 🔹 تحديد الشكل واللون حسب النوع
        const symbolInfo = getSymbolForType(type);

        if (place.type === "node") {
            // نقطة مباشرة
            geometry = new Point({
                longitude: place.lon,
                latitude: place.lat,
            });
            symbol = symbolInfo.point;
        } else if (place.type === "way" && place.center) {
            // way به مركز
            geometry = new Point({
                longitude: place.center.lon,
                latitude: place.center.lat,
            });
            symbol = symbolInfo.point;
        } else if (place.type === "way" && place.nodes) {
            // way بدون مركز
            const coords = place.nodes
                .map((nodeId) => nodeMap[nodeId])
                .filter(Boolean)
                .map((node) => [node.lon, node.lat]);

            if (coords.length > 0) {
                if (tags.building || tags.landuse) {
                    geometry = new Polygon({ rings: [coords] });
                    symbol = symbolInfo.polygon;
                } else {
                    geometry = new Polyline({ paths: [coords] });
                    symbol = symbolInfo.line;
                }
            }
        }

        // 🔹 إضافة الرسم إذا كان هناك geometry صالح
        if (geometry) {
            const popupContent = createPopupContent(name, type, tags, place.id);

            const graphic = new Graphic({
                geometry: geometry,
                symbol: symbol,
                attributes: {
                    name: name,
                    type: type,
                    id: place.id,
                    ...tags,
                },
                popupTemplate: {
                    title: "{name}",
                    content: popupContent,
                },
            });

            graphicsLayer.add(graphic);
            featuresAdded++;
        }
    });

    console.log(`🎯 Added ${featuresAdded} meaningful landmarks`);
    console.log("📊 Categories breakdown:", categories);

    // 🔹 التكبير على المعالم إذا كانت موجودة
    if (featuresAdded > 0 && graphicsLayer.graphics.length > 0) {
        view.goTo(graphicsLayer.graphics).catch(() => {
            // إذا فشل التكبير، نعود للمركز الأصلي
            view.goTo({
                center: [centerLng, centerLat],
                zoom: 14,
            });
        });

        // عرض إشعار بعدد المعالم
        view.popup.open({
            title: "تم العثور على المعالم",
            content: `تم العثور على ${featuresAdded} معلم في المنطقة.<br>${Object.entries(
                categories
            )
                .map(([cat, count]) => `${cat}: ${count}`)
                .join("<br>")}`,
            location: new Point({ longitude: centerLng, latitude: centerLat }),
        });
    }
}

// 🔹 دالة تحديد نوع المكان
function getPlaceType(tags) {
    if (tags.amenity) {
        const amenityTypes = {
            restaurant: "مطعم",
            cafe: "مقهى",
            bank: "بنك",
            hospital: "مستشفى",
            pharmacy: "صيدلية",
            school: "مدرسة",
            university: "جامعة",
            police: "شرطة",
            fuel: "محطة وقود",
            place_of_worship: "مكان عبادة",
        };
        return amenityTypes[tags.amenity] || tags.amenity;
    }
    if (tags.shop) return "متجر " + tags.shop;
    if (tags.tourism) return "معلم سياحي";
    if (tags.historic) return "معلم تاريخي";
    if (tags.office) return "مكتب";
    if (tags.building && tags.building !== "yes")
        return "مبنى " + tags.building;
    if (tags.highway === "bus_stop") return "موقف باص";

    return "معلم";
}

// 🔹 دالة إنشاء الرموز
function getSymbolForType(type) {
    const colorMap = {
        مطعم: "red",
        مقهى: "brown",
        بنك: "darkgreen",
        مستشفى: "green",
        صيدلية: "lightgreen",
        مدرسة: "blue",
        جامعة: "darkblue",
        متجر: "purple",
        "معلم سياحي": "orange",
        "معلم تاريخي": "darkred",
        "محطة وقود": "black",
        "مكان عبادة": "gold",
        مكتب: "gray",
    };

    const color = colorMap[type] || "orange";

    return {
        point: {
            type: "simple-marker",
            color: color,
            size: "10px",
            outline: { color: "white", width: 2 },
        },
        polygon: {
            type: "simple-fill",
            color: [
                parseInt(color.slice(1, 3), 16),
                parseInt(color.slice(3, 5), 16),
                parseInt(color.slice(5, 7), 16),
                0.3,
            ],
            outline: { color: color, width: 2 },
        },
        line: {
            type: "simple-line",
            color: color,
            width: 3,
        },
    };
}

// 🔹 دالة إنشاء محتوى الـ Popup
function createPopupContent(name, type, tags, id) {
    let content = `<b>النوع:</b> ${type}<br>`;
    content += `<b>المعرف:</b> ${id}<br>`;

    if (tags.amenity) content += `<b>الخدمة:</b> ${tags.amenity}<br>`;
    if (tags.shop) content += `<b>نوع المتجر:</b> ${tags.shop}<br>`;
    if (tags.cuisine) content += `<b>المطبخ:</b> ${tags.cuisine}<br>`;
    if (tags["addr:street"])
        content += `<b>الشارع:</b> ${tags["addr:street"]}<br>`;
    if (tags["opening_hours"])
        content += `<b>ساعات العمل:</b> ${tags["opening_hours"]}<br>`;

    return content;
}
// --------------------------- Lable ---------------------------
async function setLayerLabel(
    view,
    featureLayer,
    labelExpressionInfo,
    symbol,
    labelPlacement = "above-center"
) {
    try {
        console.log("🔹 Applying label to layer:", featureLayer.title);

        // 🧹 1️⃣ امسح أي تسميات قديمة من نفس الطبقة
        if (featureLayer.labelingInfo) {
            featureLayer.labelingInfo = []; // إزالة كل التسميات القديمة
        }
        featureLayer.labelsVisible = false;

        // 🧱 2️⃣ جهّز labelClass الجديد
        const labelClass = {
            labelExpressionInfo: labelExpressionInfo || {
                expression: "$feature.Name || 'No Name'",
            },
            symbol: symbol || {
                type: "text",
                color: "black",
                haloColor: "white",
                haloSize: 1,
                font: { size: 10, family: "Arial", weight: "bold" },
            },
            labelPlacement,
            minScale: 0,
            maxScale: 0,
        };

        // 🏷️ 3️⃣ أضف التسميات الجديدة
        featureLayer.labelingInfo = [labelClass];
        featureLayer.labelsVisible = true;

        console.log("✅ Label applied successfully:", labelClass);

        return {
            status: "success",
            message: "تم تحديث التسميات بنجاح",
            labelExpressionInfo,
            labelPlacement,
        };
    } catch (error) {
        console.error("❌ Error setting label:", error);
        return {
            status: "error",
            message: "فشل في تعيين التسميات",
            error: String(error),
        };
    }
}
// ------------------------------------------------------ Export ------------------------------------------------------
// دالة الاكسبورت الرئيسية المعدلة
async function executeExport(view, featureLayer, exportSettings) {
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

// -------------------------------------------------------- ZOOM --------------------------------------------------------
async function zoomToFeatures(view, featureLayer, queryConfig) {
    if (!queryConfig || !queryConfig.query) {
        // Zoom to full extent
        const layerExtent = await featureLayer.queryExtent();
        view.goTo(layerExtent.extent);
        return;
    }

    const { field, operator, value } = queryConfig.query;

    const query = featureLayer.createQuery();
    query.where = `${field} ${operator} '${value}'`;

    const result = await featureLayer.queryExtent(query);
    if (result.extent) {
        await view.goTo(result.extent.expand(1.5));
        console.log("✅ Zoomed to filtered features");
    } else {
        console.warn("⚠️ No features found for zoom query");
    }
}
async function setLayerBuffer(
    view,
    featureLayer,
    whereClause,
    distanceMeters = 50,
    colorHex = "#0000ff"
) {
    try {
        console.log("🔹 Applying buffer on:", featureLayer.title);

        // 🧹 0️⃣ امسح أي بافر قديم
        const existingBufferLayer = view.map.findLayerById("buffer-layer");
        if (existingBufferLayer) {
            console.log("🧽 Removing old buffer layer...");
            view.map.remove(existingBufferLayer);
        }

        // ⛏️ 1️⃣ استعلام العناصر
        const query = featureLayer.createQuery();
        query.where = whereClause || "1=1";
        query.returnGeometry = true;

        const result = await featureLayer.queryFeatures(query);
        if (!result.features?.length) {
            console.warn("⚠️ No features found for buffer query.");
            return { status: "error", message: "No features found." };
        }

        // 🎨 2️⃣ تحديد نوع الطبقة
        const geometryType = result.features[0].geometry.type;
        console.log("🧩 Geometry Type:", geometryType);

        // 🧮 3️⃣ إنشاء البافر حسب النوع
        const bufferGeometries = result.features.map((f) =>
            geometryEngine.buffer(f.geometry, distanceMeters, "meters")
        );

        // لو في أكتر من feature نعملهم union
        const unionGeometry =
            bufferGeometries.length > 1
                ? geometryEngine.union(bufferGeometries)
                : bufferGeometries[0];

        // 🖌️ 4️⃣ إعداد اللون (تحويل من hex إلى RGBA)
        const hexToRGBA = (hex, alpha) => {
            const bigint = parseInt(hex.replace("#", ""), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return [r, g, b, alpha];
        };

        const fillColor = hexToRGBA(colorHex, 0.2); // 20% fill
        const outlineColor = hexToRGBA(colorHex, 1); // solid border

        // ✨ 5️⃣ إنشاء Graphic مناسب
        const bufferLayer = new GraphicsLayer({ id: "buffer-layer" });
        const bufferGraphic = new Graphic({
            geometry: unionGeometry,
            symbol: {
                type: "simple-fill",
                color: fillColor,
                outline: { color: outlineColor, width: 2 },
            },
        });

        // ⚙️ لو Point أو Line → نستخدم رمز مختلف
        if (geometryType === "point") {
            bufferGraphic.symbol = {
                type: "simple-fill",
                color: fillColor,
                outline: { color: outlineColor, width: 1.5 },
            };
        } else if (geometryType === "polyline") {
            bufferGraphic.symbol = {
                type: "simple-fill",
                color: fillColor,
                outline: { color: outlineColor, width: 2 },
            };
        }

        // 📍 6️⃣ أضف البافر إلى الخريطة
        bufferLayer.add(bufferGraphic);
        view.map.add(bufferLayer);

        // 🔍 7️⃣ زوّم على النتيجة
        await view.goTo(unionGeometry.extent.expand(1.2));

        console.log("✅ Buffer displayed successfully.");
        return { status: "success", message: "Buffer applied successfully." };
    } catch (error) {
        console.error("❌ Error applying buffer:", error);
        return {
            status: "error",
            message: "Failed to apply buffer.",
            error: String(error),
        };
    }
}
export {
    getLayerData,
    fixRendererForGeometry,
    applyAggregation,
    getLandmarksData,
    setLayerLabel,
    executeExport,
    zoomToFeatures,
    setLayerBuffer,
};
