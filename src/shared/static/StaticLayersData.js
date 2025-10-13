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

const Parcels = new FeatureLayer({
    portalItem: {
        // id: "c86b609bd41444a5a42f1d8f96485137", // Your portal item ID
        id: "0e77a171e98c409a929e435b13269b2e", // Your portal item ID
    },
    outFields: ["*"], // Ensure all fields are available
    title: "Parcels",
    labelingInfo: [
        {
            labelExpressionInfo: { expression: "$feature.Lot_NUM" }, // غيّر NAME للفيلد بتاعك
            symbol: {
                type: "text",
                color: "black",
                haloSize: 1,
                haloColor: "white",
                font: {
                    size: 10,
                    family: "Arial",
                },
            },
            // أهم حاجة هنا 👇
            labelPlacement: "always-horizontal",
            deconflictionStrategy: "none", // ده يخليها تظهر كلها حتى لو متزاحمة
        },
    ],
    labelsVisible: true,
});
// const ParcelsUrl =
//     "https://services2.arcgis.com/CwbO1K4qp8M3IDwA/arcgis/rest/services/posters_last_without_domain/FeatureServer/0";
const ParcelsUrl =
    "https://services2.arcgis.com/CwbO1K4qp8M3IDwA/arcgis/rest/services/Parcels_new/FeatureServer/0";
// const Parcels = new FeatureLayer({
//     portalItem: {
//         id: "08e5d450059d4bc8b223e187c500991e", // Your portal item ID
//     },
//     outFields: ["*"], // Ensure all fields are available
// });
const dry_gully = new FeatureLayer({
    portalItem: {
        id: "1ad5c87bdf954de2a6fef701fb8eed6e", // Your portal item ID
    },
    outFields: ["*"], // Ensure all fields are available
});
const NWC = new FeatureLayer({
    portalItem: {
        id: "16d24dcfc5af4c12a056004a52e50e2b", // Your portal item ID
    },
    outFields: ["*"], // Ensure all fields are available
});
const detention_pond = new FeatureLayer({
    portalItem: {
        id: "43857943807e4b61a898df7f53e6c3e6", // Your portal item ID
    },
    outFields: ["*"], // Ensure all fields are available
});
const Future_Development = new FeatureLayer({
    portalItem: {
        id: "dc04b442cbd844c1aa2d6d72cfd5339d", // Your portal item ID
    },
    outFields: ["*"], // Ensure all fields are available
});
const roads = new FeatureLayer({
    portalItem: {
        id: "a4ddef94c886474392a20ed39569c796", // Your portal item ID
    },
    outFields: ["*"], // Ensure all fields are available
    labelingInfo: [
        {
            labelExpressionInfo: { expression: "$feature.name" }, // غيّر NAME للفيلد بتاعك
            symbol: {
                type: "text",
                color: "black",
                haloSize: 1,
                haloColor: "white",
                font: {
                    size: 10,
                    family: "Arial",
                },
            },
            // أهم حاجة هنا 👇
            labelPlacement: "always-horizontal",
            deconflictionStrategy: "none", // ده يخليها تظهر كلها حتى لو متزاحمة
        },
    ],
    labelsVisible: true,
});
const open_area = new FeatureLayer({
    portalItem: {
        id: "4dc5206e1dad4a9f9851b57da3cb5090", // Your portal item ID
    },
    outFields: ["*"], // Ensure all fields are available
});
const treatment_plant = new FeatureLayer({
    portalItem: {
        id: "efe48b5dca5743bea4eebd2b35e93f5a", // Your portal item ID
    },
    outFields: ["*"], // Ensure all fields are available
});

// const layerPortal = "029e1b2902284ca293aa2cb339c7ee15"; // pevouts
const layer = new FeatureLayer({
    portalItem: {
        id: layerPortal, // Replace with actual item ID
    },
    apiKey: JSON.parse(localStorage.getItem("LayerToken")),
    outFields: ["*"],
    title: "strings",
});
export {
    Strings,
    layerUrl,
    layer,
    Parcels,
    dry_gully,
    NWC,
    detention_pond,
    Future_Development,
    roads,
    open_area,
    treatment_plant,
    ParcelsUrl,
};
