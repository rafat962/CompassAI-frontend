import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

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

export { getLayerData, fixRendererForGeometry, applyAggregation };
