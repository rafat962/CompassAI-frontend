import Sketch from "@arcgis/core/widgets/Sketch";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

let SketchWidget = null;
let GraphicLayer = null; // Persistent layer reference

const addSketch = (view, sketch, mapRef) => {
    if (sketch) {
        if (!SketchWidget) {
            if (!GraphicLayer) {
                GraphicLayer = new GraphicsLayer(); // Create only if it doesn't exist
                mapRef?.add(GraphicLayer);
            }
            SketchWidget = new Sketch({
                layer: GraphicLayer,
                view: view,
                id: "Sketch",
                availableCreateTools: ["point"], // Add this line
            });
            view.ui.add(SketchWidget, "top-right"); // Add widget to UI
        }
    } else {
        if (SketchWidget) {
            view.ui.remove(SketchWidget); // Remove widget from UI
            SketchWidget.destroy(); // Destroy widget to free memory
            SketchWidget = null; // Reset reference
        }
    }
    return { SketchWidget, GraphicLayer };
};

export default addSketch;
