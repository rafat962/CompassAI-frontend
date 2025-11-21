/* eslint-disable no-unused-vars */
import { memo, useEffect } from "react";
import { useSearchParams } from "react-router";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { useMap } from "../../../../shared/hooks/useMap";
import useView from "../../../../shared/hooks/useView";
import { useCompassContext } from "../../context/CompassContext";

const MapG2 = () => {
    // const { state, dispatch } = useCompassContext();
    const { viewRef } = useMap();
    const center = [-76.4756304, 18.1923747];
    const [searchParams] = useSearchParams();
    const { view } = useView(viewRef, 18, center, "satellite", false);
    useEffect(() => {
        const loadLayer = async () => {
            const layerUrl = searchParams.get("layerUrl");
            const portalId = searchParams.get("portalId");
            if (!portalId) return;
            const layer = `${layerUrl}/0`;
            // if (layerUrl) {
            //     dispatch({ type: "layer", layer });
            // }
            const featureLayer = new FeatureLayer({
                portalItem: {
                    id: portalId,
                },
            });
            // if (portalId) {
            //     dispatch({ type: "featureLayer", featureLayer });
            // }
            view.map.add(featureLayer);

            await featureLayer.load(); // Wait for layer to load

            if (featureLayer.fullExtent) {
                view.goTo(featureLayer.fullExtent);
            }
        };
        loadLayer();
    }, [searchParams, view]);

    // useEffect(() => {
    //     if (view) {
    //         dispatch({ type: "view", view });
    //     }
    // }, [view]);

    return (
        <div
            ref={viewRef}
            className="w-full h-full border-1 border-black rounded-2xl overflow-hidden"
        ></div>
    );
};

export default memo(MapG2);
