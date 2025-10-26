/* eslint-disable no-unused-vars */
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
export const graphicsLayer = new GraphicsLayer();
// --------------------------- Sql ---------------------------
export async function getLayerData(view, whereClause, featureLayer) {
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
