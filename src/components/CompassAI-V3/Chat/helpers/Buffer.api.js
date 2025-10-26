/* eslint-disable no-unused-vars */
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import * as projection from "@arcgis/core/geometry/projection.js";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";

export const graphicsLayer = new GraphicsLayer();

// -------------------------------------------------------- Buffer --------------------------------------------------------
async function setLayerBuffer(
    view,
    featureLayer,
    whereClause,
    distanceMeters = 50,
    colorHex = "#0000ff"
) {
    try {
        console.log("🔹 Applying buffer on:", featureLayer.title);

        // ✅ ابحث عن الطبقة أو أنشئها مرة واحدة
        let bufferLayer = view.map.findLayerById("buffer-layer");
        if (!bufferLayer) {
            bufferLayer = new GraphicsLayer({ id: "buffer-layer" });
            view.map.add(bufferLayer);
        }

        // 🧹 امسح الجرافيكس القديمة فقط
        bufferLayer.removeAll();

        // استعلام البيانات
        const query = featureLayer.createQuery();
        query.where = whereClause || "1=1";
        query.returnGeometry = true;

        const result = await featureLayer.queryFeatures(query);
        if (!result.features?.length) {
            console.warn("⚠️ No features found for buffer.");
            return { status: "error", message: "No features found." };
        }

        await projection.load();

        const projectedFeatures = result.features.map((f) => {
            const geom = f.geometry;
            if (geom.spatialReference.isGeographic) {
                return {
                    ...f,
                    geometry: projection.project(geom, { wkid: 3857 }),
                };
            }
            return f;
        });

        // 🧮 إنشاء البافر
        const bufferGeometries = projectedFeatures.map((f) =>
            geometryEngine.buffer(f.geometry, distanceMeters, "meters")
        );
        const unionGeometry =
            bufferGeometries.length > 1
                ? geometryEngine.union(bufferGeometries)
                : bufferGeometries[0];

        // 🎨 إعداد اللون
        const hexToRGBA = (hex, alpha) => {
            const bigint = parseInt(hex.replace("#", ""), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return [r, g, b, alpha];
        };
        const fillColor = hexToRGBA(colorHex, 0.25);
        const outlineColor = hexToRGBA(colorHex, 1);

        // 🖌️ أضف الجرافيك بدون أي تأثير على الكاميرا
        const bufferGraphic = new Graphic({
            geometry: unionGeometry,
            symbol: {
                type: "simple-fill",
                color: fillColor,
                outline: { color: outlineColor, width: 2 },
            },
        });

        // ✅ تعطيل جميع الأحداث التي ممكن تسبب Zoom
        const currentExtent = view.extent.clone();
        bufferLayer.add(bufferGraphic);

        // ⛔ بعد الإضافة رجّع الـ extent زي ما هو
        // view.goTo(currentExtent, { animate: false });

        console.log("✅ Buffer updated — No zoom or movement applied.");

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

export { setLayerBuffer };
