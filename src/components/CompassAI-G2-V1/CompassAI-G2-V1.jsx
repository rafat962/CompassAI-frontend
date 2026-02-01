/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from "react";
import Prompt from "./utils/Prompt/Prompt";
import TableData from "./utils/TableData/TableData";
import { useCompassContext } from "./context/CompassContext";
import MapG2 from "./utils/map/MapG2";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router";
import { useEffect } from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { createVLayer } from "./helpers/creatreVLayer";
import esriId from "@arcgis/core/identity/IdentityManager";
import esriConfig from "@arcgis/core/config";

const CompassAIG2V1 = () => {
    const { state, dispatch } = useCompassContext();
    const [view, setView] = useState(null);
    let mode = state?.mode;
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const ApiKey = searchParams.get("ApiKey");
    const isSandbox = ApiKey === "sandbox";

    // 1. Configure API Key
    useMemo(() => {
        const activeToken = isSandbox
            ? JSON.parse(localStorage.getItem("LayerToken"))
            : token;
        if (activeToken) esriConfig.apiKey = activeToken;
    }, [token, ApiKey, isSandbox]);

    // 2. Load Main Feature Layer (Immediately)
    useEffect(() => {
        console.log("start");
        const loadMainLayer = async () => {
            const portalId = searchParams.get("portalId");
            const layerUrl = searchParams.get("layerUrl");
            if ((!portalId || state.FeatureLayer) && ApiKey !== "sandbox")
                return;
            console.log(2);

            const mainLayer = new FeatureLayer({
                portalItem: {
                    id: isSandbox ? import.meta.env.VITE_PORTALID : portalId,
                },
                outFields: ["*"],
                apiKey: isSandbox
                    ? JSON.parse(localStorage.getItem("LayerToken"))
                    : token,
            });

            await mainLayer.load();
            dispatch({ type: "FeatureLayer", FeatureLayer: mainLayer });
        };
        loadMainLayer();
    }, [searchParams, token, isSandbox, dispatch]);

    // 3. Create V-Layer in Background
    useEffect(() => {
        const initVLayer = async () => {
            if (!view || !state.FeatureLayer || state.VFeatureLayer) return;

            try {
                const vLayer = await createVLayer(view, state.FeatureLayer);

                dispatch({ type: "VFeatureLayer", VFeatureLayer: vLayer });
                dispatch({ type: "view", view: view });
            } catch (err) {
                console.warn("VLayer preparation pending...", err);
            }
        };
        initVLayer();
    }, [view, state.FeatureLayer, state.VFeatureLayer, dispatch]);

    return (
        <div className="w-full h-full">
            <div className="w-full h-full flex flex-col items-center justify-start ">
                <div className=" w-full h-fit">
                    <Prompt />
                </div>

                <div className="w-full h-full relative">
                    {/* Table Layer */}
                    <motion.div
                        className="absolute inset-0 w-full h-full bg-white z-10" // Added z-10 and bg-white
                        animate={{
                            opacity: mode === "table" ? 1 : 0,
                            // Move table behind map when map is active so clicks go to map
                            zIndex: mode === "table" ? 10 : -1,
                        }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        <TableData />
                    </motion.div>

                    {/* Map Layer - CSS FIX HERE */}
                    {/* We use inline styles to keep the map rendered in DOM but hidden/behind table */}
                    <div
                        className="w-full h-full absolute inset-0"
                        style={{
                            visibility: mode === "map" ? "visible" : "hidden", // Keeps layout space
                            zIndex: mode === "map" ? 10 : 0, // Map sits behind table when table is active
                        }}
                    >
                        <MapG2 setView={setView} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompassAIG2V1;
