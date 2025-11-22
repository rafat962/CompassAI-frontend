import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

export async function createVLayer(view, mainFeatureLayer) {
    if (!view) throw new Error("View is not ready");
    const features = await mainFeatureLayer.queryFeatures();
    const vLayer = new FeatureLayer({
        source: features.features,
        fields: mainFeatureLayer.fields,
        objectIdField: mainFeatureLayer.objectIdField,
        geometryType: mainFeatureLayer.geometryType,
        spatialReference: mainFeatureLayer.spatialReference,
        title: "V-Layer",
        id: "V-Layer",
    });
    //  Symbology + Labels + popup
    vLayer.renderer = mainFeatureLayer.renderer;
    if (mainFeatureLayer.labelingInfo) {
        vLayer.labelingInfo = mainFeatureLayer.labelingInfo;
    }
    vLayer.popupTemplate = mainFeatureLayer.popupTemplate;

    view.map.add(vLayer);
    return vLayer;
}
