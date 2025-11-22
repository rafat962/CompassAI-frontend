/* eslint-disable no-unused-vars */
import { memo, useEffect } from "react";
import { useSearchParams } from "react-router";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { useMap } from "../../../../shared/hooks/useMap";
import useView from "../../../../shared/hooks/useView";
import { useCompassContext } from "../../context/CompassContext";
import Editor from "@arcgis/core/widgets/Editor.js";
import Expand from "@arcgis/core/widgets/Expand";
const MapG2 = ({ setView }) => {
    // const { dispatch } = useCompassContext();
    const { viewRef } = useMap();
    const center = [-76.4756304, 18.1923747];
    const [searchParams] = useSearchParams();
    const { view } = useView(viewRef, 18, center, "satellite", false);
    useEffect(() => {
        const loadLayer = async () => {
            const layerUrl = searchParams.get("layerUrl");
            const portalId = searchParams.get("portalId");
            if (!portalId) return;
            const featureLayer = new FeatureLayer({
                portalItem: {
                    id: portalId,
                },
            });
            view.map.add(featureLayer);
            await featureLayer.load(); // Wait for layer to load
            if (featureLayer.fullExtent) {
                view.goTo(featureLayer.fullExtent);
            }
            const editWidget = new Editor({
                view: view,
            });
            const EditExpand = new Expand({
                view: view,
                content: editWidget,
            });
            view.ui.add(EditExpand, "top-right");
            setView(view);
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
