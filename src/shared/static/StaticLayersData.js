import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const Strings = new FeatureLayer({
    portalItem: {
        id: "958bbeb057c44886bde9f1517c3f12ea", // Replace with actual item ID
    },
    apiKey: JSON.parse(localStorage.getItem("LayerToken")),
    outFields: ["*"],
    title: "strings",
});
// const Pevouits = new FeatureLayer({
//     portalItem: {
//         id: "b3eeb6ca3e75468cbef0b60e242f0553", // Replace with actual item ID
//     },
//     apiKey: JSON.parse(localStorage.getItem("LayerToken")),
//     outFields: ["*"],
//     title: "strings",
// });
const layerUrl =
    "https://services2.arcgis.com/CwbO1K4qp8M3IDwA/arcgis/rest/services/EQUIPMENTS/FeatureServer/0";
// const layerUrl =
//     "https://services2.arcgis.com/CwbO1K4qp8M3IDwA/arcgis/rest/services/pivots_new_SpatialJoin/FeatureServer/0";
const layerPortal = "958bbeb057c44886bde9f1517c3f12ea";
// const layerPortal = "029e1b2902284ca293aa2cb339c7ee15"; // pevouts
const layer = new FeatureLayer({
    portalItem: {
        id: layerPortal, // Replace with actual item ID
    },
    apiKey: JSON.parse(localStorage.getItem("LayerToken")),
    outFields: ["*"],
    title: "strings",
});
export { Strings, layerUrl, layer };
