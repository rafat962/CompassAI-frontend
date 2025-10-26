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
export function fixRendererForGeometry(renderer, geometryType) {
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
