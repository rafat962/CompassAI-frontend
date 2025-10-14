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

    // عدّل الرموز في uniqueValueInfos مباشرة
    if (renderer.uniqueValueInfos && Array.isArray(renderer.uniqueValueInfos)) {
        for (let i = 0; i < renderer.uniqueValueInfos.length; i++) {
            const info = renderer.uniqueValueInfos[i];
            info.symbol = fixSymbolTypeForGeometry(info.symbol, geometryType);
        }
    }

    // عدّل الـ defaultSymbol
    if (renderer.defaultSymbol) {
        renderer.defaultSymbol = fixSymbolTypeForGeometry(
            renderer.defaultSymbol,
            geometryType
        );
    }

    return renderer;
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

        // ✅ استخدم الشرط الصحيح من مخرج الـ AI
        query.where = aggregationData.where || "1=1";

        // ✅ لو فيه groupByField نستخدمه
        if (aggregationData.groupByField) {
            query.groupByFieldsForStatistics = [aggregationData.groupByField];
        }

        // ✅ إعداد الإحصائيات
        query.outStatistics = aggregationData.aggregations.map((agg) => ({
            onStatisticField: agg.onField,
            outStatisticFieldName: agg.onField,
            statisticType: agg.statisticType,
        }));
        console.log("query", query);
        // تنفيذ الكويري
        const result = await layer.queryFeatures(query);

        if (result.features.length > 0) {
            const stats = result.features.map((f) => f.attributes);
            console.log("✅ Aggregation result:", stats);

            // تجهيز الملخص
            const summary = stats
                .map((s) =>
                    Object.entries(s)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")
                )
                .join(" | ");

            return `Aggregation results → ${summary}`;
        } else {
            console.log("⚠️ No features returned from aggregation.");
            return "No data found for aggregation.";
        }
    } catch (err) {
        console.error("❌ Error running aggregation:", err);
        return "Error performing aggregation.";
    }
}

export { getLayerData, fixRendererForGeometry, applyAggregation };
