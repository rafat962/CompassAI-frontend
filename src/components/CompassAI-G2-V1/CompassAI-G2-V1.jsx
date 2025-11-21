/* eslint-disable no-unused-vars */
import React from "react";
import Prompt from "./utils/Prompt/Prompt";
import TableData from "./utils/TableData/TableData";
import { useCompassContext } from "./context/CompassContext";
import MapG2 from "./utils/map/MapG2";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router";
import { useEffect } from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const CompassAIG2V1 = () => {
    const { state, dispatch } = useCompassContext();
    let mode = state?.mode;
    // init Edit and V Layer

    const [searchParams] = useSearchParams();
    useEffect(() => {
        const loadLayers = async () => {
            const portalId = searchParams.get("portalId");
            if (!portalId) return;
            // الطبقة الأصلية
            const mainFeatureLayer = new FeatureLayer({
                portalItem: { id: portalId },
                outFields: ["*"],
            });
            // انتظار تحميل الطقة
            await mainFeatureLayer.load();
            // جلب جميع الـ features من الطبقة الأصلية
            const features = await mainFeatureLayer.queryFeatures();
            // إنشاء نسخة VLayer محلية قابلة للتعديل
            const vLayer = new FeatureLayer({
                source: features.features,
                fields: mainFeatureLayer.fields,
                objectIdField: mainFeatureLayer.objectIdField,
                geometryType: mainFeatureLayer.geometryType,
                spatialReference: mainFeatureLayer.spatialReference,
                title: "V-Layer Copy",
                opacity: 0.5,
            });
            dispatch({ type: "FeatureLayer", FeatureLayer: mainFeatureLayer });
            dispatch({ type: "VFeatureLayer", VFeatureLayer: vLayer });
        };

        loadLayers();
    }, [searchParams]);

    return (
        <div className="w-full h-full">
            <div className="w-full h-full flex flex-col items-center justify-start ">
                <div className=" w-full h-fit">
                    <Prompt />
                </div>

                {/* Table */}
                <div className="w-full h-full relative">
                    {/* Table Layer */}
                    <motion.div
                        className="absolute inset-0 w-full h-full"
                        animate={{
                            opacity: mode === "table" ? 1 : 0,
                        }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        style={{
                            pointerEvents: mode === "table" ? "auto" : "none",
                        }}
                    >
                        <TableData />
                    </motion.div>
                    {/* Map Layer */}
                    <div className={mode === "map" ? "block h-full" : "hidden"}>
                        <MapG2 />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompassAIG2V1;
