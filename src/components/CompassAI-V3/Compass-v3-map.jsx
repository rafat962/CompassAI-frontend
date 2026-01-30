/* eslint-disable no-unused-vars */
import { memo, useEffect } from "react";
import useView from "../../shared/hooks/useView";
import { useMap } from "../../shared/hooks/useMap";
import { useDispatch } from "react-redux";
import {
    ToggleFeatureLayer,
    ToggleLayerUrl,
    ToggleView,
} from "./Chat/redux/Compass-V3Slice";
import { useSearchParams } from "react-router";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const CompassV3Map = () => {
    const dispatch = useDispatch();
    const { viewRef } = useMap();
    const center = [0, 0];
    const [searchParams] = useSearchParams();
    const { view } = useView(viewRef, 2, center, "satellite", false);

    useEffect(() => {
        const loadLayer = async () => {
            if (!view) return; // Ensure view is ready

            // 1. Check if we are in Sandbox Mode
            const apiKeyParam = searchParams.get("ApiKey");
            const isSandbox = apiKeyParam === "sandbox";

            // 2. Define Data (Use default if sandbox, otherwise use URL params)
            const portalId = isSandbox
                ? "810c4f24fa0947e58ad8a0986b5fb63d" // Fixed ID for sandbox
                : searchParams.get("portalId");

            const layerUrl = isSandbox
                ? "https://services3.arcgis.com/UDCw00RKDRKPqASe/arcgis/rest/services/Land/FeatureServer"
                : searchParams.get("layerUrl");

            if (!portalId || !layerUrl) return;

            // 3. Dispatch Layer URL for the Chat logic
            const layerPath = `${layerUrl}/0`;
            dispatch(ToggleLayerUrl(layerPath));

            try {
                // 4. Create and Add Feature Layer
                const featureLayer = new FeatureLayer({
                    portalItem: {
                        id: portalId,
                    },
                });

                dispatch(ToggleFeatureLayer(featureLayer));
                view.map.add(featureLayer);

                await featureLayer.load();

                // 5. Zoom to layer extent
                if (featureLayer.fullExtent) {
                    view.goTo(featureLayer.fullExtent);
                }
            } catch (error) {
                console.error("Error loading ArcGIS layer:", error);
            }
        };

        loadLayer();
    }, [searchParams, view, dispatch]);

    useEffect(() => {
        if (view) {
            dispatch(ToggleView({ view: view }));
        }
    }, [view, dispatch]);

    return (
        <div
            ref={viewRef}
            className="col-span-12 md:col-span-8 row-span-3 md:row-span-1 border-1 border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-black/20"
        ></div>
    );
};

export default memo(CompassV3Map);
