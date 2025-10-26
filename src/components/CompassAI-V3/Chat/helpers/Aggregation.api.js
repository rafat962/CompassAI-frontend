// --------------------------- Aggregation ---------------------------
export async function applyAggregation(aggregationData, featureLayer) {
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
