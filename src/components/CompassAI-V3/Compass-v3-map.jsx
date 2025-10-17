/* eslint-disable no-unused-vars */
import React, { memo, useEffect } from "react";
import useView from "../../shared/hooks/useView";
import { useMap } from "../../shared/hooks/useMap";
import { layer, Strings } from "../../shared/static/StaticLayersData";
import { useDispatch } from "react-redux";
import {
    ToggleFeatureLayer,
    ToggleLayerUrl,
    ToggleView,
} from "./Chat/redux/Compass-V3Slice";
import {
    Parcels,
    dry_gully,
    NWC,
    detention_pond,
    Future_Development,
    roads,
    open_area,
    treatment_plant,
} from "../../shared/static/StaticLayersData";
import { useSearchParams } from "react-router";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
const CompassV3Map = () => {
    const dispatch = useDispatch();
    const { viewRef } = useMap();
    const center = [-76.4756304, 18.1923747];
    const [searchParams] = useSearchParams();
    const { view } = useView(
        viewRef,
        18,
        center,
        "satellite",
        false
        // Parcels,
        // dry_gully,
        // NWC,
        // detention_pond,
        // Future_Development,
        // roads,
        // open_area,
        // treatment_plant
    );
    useEffect(() => {
        const loadLayer = async () => {
            const layerUrl = searchParams.get("layerUrl");
            const portalId = searchParams.get("portalId");
            const layer = `${layerUrl}/0`;
            if (layerUrl) {
                dispatch(ToggleLayerUrl(layer));
            }
            const featureLayer = new FeatureLayer({
                portalItem: {
                    id: portalId,
                },
            });
            if (portalId) {
                dispatch(ToggleFeatureLayer(featureLayer));
            }
            view.map.add(featureLayer);

            await featureLayer.load(); // Wait for layer to load

            if (featureLayer.fullExtent) {
                view.goTo(featureLayer.fullExtent);
            }
        };
        loadLayer();
    }, [searchParams, view, dispatch]);

    useEffect(() => {
        if (view) {
            dispatch(ToggleView({ view: view }));
        }
    }, [view]);

    return (
        <div
            ref={viewRef}
            className="col-span-12 lg:col-span-8 row-span-1 lg:row-span-1 border-1 border-black rounded-2xl overflow-hidden"
        ></div>
    );
};

export default memo(CompassV3Map);
