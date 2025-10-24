/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { TextGenerateEffect } from "../../../../../shared/ui/aceternityUI/TextGenerateEffect";
import { Tooltip } from "@mui/material";
import { LuCopy } from "react-icons/lu";
import {
    applyAggregation,
    executeExport,
    fixRendererForGeometry,
    getLandmarksData,
    getLayerData,
    setLayerBuffer,
    setLayerLabel,
    zoomToFeatures,
} from "../../helpers/Layer.api";
import { useSelector } from "react-redux";
import AiResponseSql from "./utils/AiResponseSql";
import ChartDisplay from "./utils/ChartDisplay";
import ReportResponse from "./utils/ReportResponse";

const AIResponse = ({ data, CopyResponse }) => {
    const [type, setType] = useState();
    const [message, setMessage] = useState();
    const { view, FeatureLayer } = useSelector((state) => state.CompassV3);

    useEffect(() => {
        if (!data) return;
        console.log("data?.message?.type", data?.message?.type);
        console.log("data?.message", data?.message);
        setType(data?.message?.type);
        let FinalData = data?.message?.result;
        switch (type) {
            case "other":
                setMessage(FinalData.message);
                break;
            case "aggregation":
                console.log("aggregation");
                const aggregationData = FinalData?.data;
                applyAggregation(aggregationData, FeatureLayer).then((res) => {
                    console.log("finalRes", res);
                    setMessage(res);
                });
                break;
            case "visualize":
                if (!FinalData.renderer) return setMessage("Invalid Field");
                const geometryType = FeatureLayer.geometryType;
                const aiRenderer = FinalData?.renderer;
                console.log("aiRenderer", aiRenderer);
                console.log("FeatureLayer", FeatureLayer);
                const fixedRenderer = fixRendererForGeometry(
                    aiRenderer,
                    geometryType
                );
                FeatureLayer.renderer = fixedRenderer;
                setMessage(FinalData.message);
                break;
            case "chart":
                console.log("chart", FinalData?.data);
                setMessage(<ChartDisplay chartData={FinalData?.data} />);
                break;
            case "report":
                console.log("report", FinalData.data);
                setMessage(<ReportResponse data={FinalData.data} />);
                break;
            case "metadata":
                if (FinalData?.data?.fields?.length) {
                    const formattedFields = FinalData.data.fields
                        .map(
                            (f) =>
                                `• ${f.name} (${f.alias}) — Type: ${f.type}, Sample: ${f.sampleValue}`
                        )
                        .join("\n");
                    setMessage(`${FinalData?.message}:\n${formattedFields}`);
                } else {
                    setMessage(`${FinalData?.message}`);
                }
                break;
            case "sql-query":
                console.log(FinalData);
                console.log(FinalData?.whereClause);
                getLayerData(
                    view.view,
                    FinalData?.whereClause,
                    FeatureLayer
                ).then((data) => {
                    setMessage(<AiResponseSql data={data} />);
                });
                break;
            case "label":
                console.log("label");
                let labelExpressionInfo = FinalData.data?.labelExpressionInfo;
                let symbol = FinalData.data?.symbol;
                let labelPlacement = FinalData.data?.labelPlacement;
                let message = FinalData.data?.message;
                setMessage(message);
                setLayerLabel(
                    view.view,
                    FeatureLayer,
                    labelExpressionInfo,
                    symbol,
                    labelPlacement
                );
                break;
            case "export":
                console.log("export");
                let exportSettings = FinalData.data; // الإعدادات من الباك
                let exportMessage = FinalData.data?.message;
                setMessage(exportMessage || "Preparing export...");
                executeExport(
                    view.view,
                    FeatureLayer,
                    exportSettings // نمرر الإعدادات من الباك
                );
                break;
            case "zoom":
                console.log("zoom");
                let zoomSettings = FinalData.data; // الإعدادات من الباك
                console.log(FinalData);
                let zoomMessage = FinalData.data?.message;
                setMessage(zoomMessage || "Preparing Zoom...");
                zoomToFeatures(
                    view.view,
                    FeatureLayer,
                    zoomSettings // نمرر الإعدادات من الباك
                );
                break;
            case "buffer":
                console.log("buffer");
                let whereClause = FinalData?.data?.whereClause; // الإعدادات من الباك
                let distanceMeters = FinalData?.data?.distanceMeters; // الإعدادات من الباك
                let color = FinalData?.data?.color; // الإعدادات من الباك
                console.log(FinalData);
                let BufferMessage = FinalData.data?.message;
                setMessage(BufferMessage || "Preparing Buffer...");
                setLayerBuffer(
                    view.view,
                    FeatureLayer,
                    whereClause,
                    distanceMeters
                );
                break;
            case "landmark-query":
                console.log("landmark-query");
                getLandmarksData(view.view, FinalData.data.params).then(
                    (landmarks) => {
                        console.log(landmarks);
                        setMessage(
                            <div>
                                <h4>📍 المعالم المميزة القريبة:</h4>
                                {landmarks.length === 0 ? (
                                    <p>
                                        🚫 لم يتم العثور على معالم مميزة في
                                        النطاق المحدد
                                    </p>
                                ) : (
                                    <ul
                                        style={{
                                            maxHeight: "300px",
                                            overflowY: "auto",
                                            paddingRight: "10px",
                                        }}
                                    >
                                        {landmarks.map((lm, i) => (
                                            <li
                                                key={i}
                                                style={{
                                                    marginBottom: "10px",
                                                    padding: "8px",
                                                    border: "1px solid #ddd",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                <div>
                                                    <b
                                                        style={{
                                                            color: "#2E86AB",
                                                        }}
                                                    >
                                                        {lm.name}
                                                    </b>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.9em",
                                                        color: "#666",
                                                    }}
                                                >
                                                    <strong>النوع:</strong>{" "}
                                                    {lm.type}
                                                </div>
                                                {lm.address && (
                                                    <div
                                                        style={{
                                                            fontSize: "0.85em",
                                                            color: "#888",
                                                        }}
                                                    >
                                                        <strong>
                                                            العنوان:
                                                        </strong>{" "}
                                                        {lm.address}
                                                    </div>
                                                )}
                                                {lm.tags?.amenity && (
                                                    <div
                                                        style={{
                                                            fontSize: "0.8em",
                                                            color: "#28a745",
                                                        }}
                                                    >
                                                        <strong>الخدمة:</strong>{" "}
                                                        {lm.tags.amenity}
                                                    </div>
                                                )}
                                                {lm.tags?.shop && (
                                                    <div
                                                        style={{
                                                            fontSize: "0.8em",
                                                            color: "#ff6b35",
                                                        }}
                                                    >
                                                        <strong>المتجر:</strong>{" "}
                                                        {lm.tags.shop}
                                                    </div>
                                                )}
                                                {lm.distance && (
                                                    <div
                                                        style={{
                                                            fontSize: "0.8em",
                                                            color: "#6c757d",
                                                        }}
                                                    >
                                                        <strong>
                                                            المسافة:
                                                        </strong>{" "}
                                                        {lm.distance.toFixed(0)}{" "}
                                                        متر
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div
                                    style={{
                                        marginTop: "10px",
                                        fontSize: "0.8em",
                                        color: "#6c757d",
                                    }}
                                >
                                    <strong>إجمالي المعالم:</strong>{" "}
                                    {landmarks.length}
                                </div>
                            </div>
                        );
                    }
                );
                break;
            default:
                break;
        }
    }, [data, type]);
    if (!message) return;

    return (
        <div
            key={message}
            className="w-full h-fit flex flex-col items-start justify-start"
        >
            <div className="  h-fit w-fit max-w-95 max-h-130 overflow-auto bg-blue-200 outline-1 outline-blue-500 p-1 py-0 rounded-2xl rounded-tl-xs items-center space-y-2">
                {type === "sql-query" && (
                    <>
                        <p className=" text-wrap w-full">{message}</p>
                    </>
                )}
                {type === "aggregation" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "metadata" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "visualize" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "chart" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        {message}
                    </p>
                )}
                {type === "other" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "report" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <>
                            <p className=" text-wrap w-full">{message}</p>
                        </>
                    </p>
                )}
                {type === "landmark-query" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <>
                            <p className=" text-wrap w-full">{message}</p>
                        </>
                    </p>
                )}
                {type === "label" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "export" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "zoom" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "buffer" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {/* copy */}
                {type !== "sql-query" &&
                    type !== "chart" &&
                    type !== "report" && (
                        <div
                            onClick={() => CopyResponse(message)}
                            className="w-full flex items-center justify-end p-1"
                        >
                            <Tooltip title="Copy">
                                <LuCopy className="text-end cursor-pointer" />
                            </Tooltip>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default AIResponse;
