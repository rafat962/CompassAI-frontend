// -------------------------------------------------------- ZOOM --------------------------------------------------------
export async function zoomToFeatures(view, featureLayer, queryConfig) {
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
