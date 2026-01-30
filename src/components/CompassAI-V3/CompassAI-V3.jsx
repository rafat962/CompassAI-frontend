import React, { useMemo } from "react";
import MangeChat from "./Chat/mangeChat";
import CompassV3Map from "./Compass-v3-map";
import { useSearchParams } from "react-router-dom";
import esriConfig from "@arcgis/core/config";

const CompassAIV3 = () => {
    const [searchParams] = useSearchParams();

    // 1. Extract params
    const tokenFromUrl = searchParams.get("token");
    const apiKeyParam = searchParams.get("ApiKey");

    // 2. Logic to determine active token (Sandbox vs Live)
    // Using useMemo to avoid re-setting config on every render
    useMemo(() => {
        const isSandbox = apiKeyParam === "sandbox";

        // If sandbox: use the restricted view-only key from .env
        // If live: use the token provided in the URL
        const activeToken = isSandbox
            ? import.meta.env.VITE_ARCGIS_SANDBOX_TOKEN
            : tokenFromUrl;

        if (activeToken) {
            esriConfig.apiKey = activeToken;
        }
    }, [tokenFromUrl, apiKeyParam]);

    return (
        <div className="w-full h-full  p-2">
            {/* main container */}
            <div className="w-full h-full grid grid-cols-12 grid-rows-7 md:grid-rows-1 gap-1 rounded-2xl overflow-hidden">
                {/* map */}
                <CompassV3Map />
                {/* chat */}
                <div className="col-span-12  md:col-span-4 row-span-4 md:row-span-1">
                    <MangeChat />
                </div>
            </div>
        </div>
    );
};

export default CompassAIV3;
