// --------------------------- Lable ---------------------------
export async function setLayerLabel(
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
