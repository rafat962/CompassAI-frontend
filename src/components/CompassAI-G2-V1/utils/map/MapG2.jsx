/* eslint-disable no-unused-vars */
import { memo, useEffect } from "react";
import { useSearchParams } from "react-router";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { useMap } from "../../../../shared/hooks/useMap";
import useView from "../../../../shared/hooks/useView";
import Editor from "@arcgis/core/widgets/Editor.js";
import Expand from "@arcgis/core/widgets/Expand";

const MapG2 = ({ setView }) => {
    const { viewRef } = useMap();
    const center = [-76.4756304, 18.1923747];
    const [searchParams] = useSearchParams();

    // Ensure the view is created
    const { view } = useView(viewRef, 18, center, "satellite", false);

    useEffect(() => {
        // Essential Guard: Don't run if view or its map aren't initialized
        if (!view || !view.map) return;

        const loadLayer = async () => {
            const portalId = searchParams.get("portalId");
            const token = searchParams.get("token");
            const ApiKey = searchParams.get("ApiKey");
            const isSandbox = ApiKey === "sandbox";

            if (!portalId && !isSandbox) return;

            const featureLayer = new FeatureLayer({
                portalItem: {
                    id: isSandbox ? import.meta.env.VITE_PORTALID : portalId,
                },
                apiKey: isSandbox
                    ? JSON.parse(localStorage.getItem("LayerToken"))
                    : token,
            });

            try {
                // Wait for the view to be fully ready (UI and Map properties)
                await view.when();

                view.map.add(featureLayer);

                // Wait for the layer to load its metadata
                await featureLayer.load();

                // Zoom logic with a safe check
                if (featureLayer.fullExtent) {
                    // Using catch to prevent animation errors from crashing the app
                    await view.goTo(featureLayer.fullExtent).catch((err) => {
                        if (err.name !== "AbortError")
                            console.error("GoTo failed:", err);
                    });
                }

                // Initialize Widgets
                const editWidget = new Editor({ view: view });
                const editExpand = new Expand({
                    view: view,
                    content: editWidget,
                });

                view.ui.add(editExpand, "top-right");

                // Lift the view state up
                setView(view);
            } catch (err) {
                console.error("Layer loading failed:", err);
            }
        };

        loadLayer();

        // Cleanup function (optional but recommended)
        return () => {
            if (view) {
                // Clear UI if needed when component unmounts
            }
        };
    }, [searchParams, view, setView]);

    return (
        <div
            ref={viewRef}
            className="w-full h-full border-1 border-black rounded-2xl overflow-hidden"
        ></div>
    );
};

export default memo(MapG2);
