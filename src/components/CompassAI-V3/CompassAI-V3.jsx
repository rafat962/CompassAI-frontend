import React from "react";
import MangeChat from "./Chat/mangeChat";
import CompassV3Map from "./Compass-v3-map";
import { useSearchParams } from "react-router-dom";
import esriConfig from "@arcgis/core/config";

const CompassAIV3 = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    if (token) {
        esriConfig.apiKey = token;
    }
    return (
        <div className="w-full h-full  p-2">
            {/* main container */}
            <div className="w-full h-full grid grid-cols-12 grid-rows-7 lg:grid-rows-1 gap-1 rounded-2xl overflow-hidden">
                {/* map */}
                <CompassV3Map />
                {/* chat */}
                <div className="col-span-12  lg:col-span-4 row-span-4 lg:row-span-1">
                    <MangeChat />
                </div>
            </div>
        </div>
    );
};

export default CompassAIV3;
