/* eslint-disable no-unused-vars */
import React, { memo, useEffect } from "react";
import useView from "../../shared/hooks/useView";
import { useMap } from "../../shared/hooks/useMap";
import { layer, Strings } from "../../shared/static/StaticLayersData";
import { useDispatch } from "react-redux";
import { ToggleView } from "./Chat/redux/Compass-V2Slice";
import { center, zoom } from "../../shared/static/StaticMapData";

const CompassV2Map = () => {
    const dispatch = useDispatch();
    const { viewRef } = useMap();
    const { view } = useView(viewRef, zoom, center, "satellite", false, layer);

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

export default memo(CompassV2Map);
