/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { TextGenerateEffect } from "../../../../../shared/ui/aceternityUI/TextGenerateEffect";
import { Tooltip } from "@mui/material";
import { LuCopy } from "react-icons/lu";
import {
    applyAggregation,
    fixRendererForGeometry,
    getLayerData,
} from "../../helpers/Layer.api";
import { useSelector } from "react-redux";
import AiResponseSql from "./utils/AiResponseSql";
import ChartDisplay from "./utils/ChartDisplay";
import { Parcels } from "../../../../../shared/static/StaticLayersData";

const AIResponse = ({ data, CopyResponse }) => {
    const [type, setType] = useState();
    const [message, setMessage] = useState();
    const { view } = useSelector((state) => state.CompassV3);

    useEffect(() => {
        if (!data) return;
        setType(data?.message?.type);
        let FinalData = data?.message?.result;
        switch (type) {
            case "other":
                setMessage(FinalData.message);
                break;
            case "aggregation":
                console.log("aggregation");
                const aggregationData = FinalData?.data;
                console.log(aggregationData);
                applyAggregation(aggregationData).then((res) => {
                    console.log("finalRes", res);
                    setMessage(res);
                });
                break;
            case "visualize":
                if (!FinalData.renderer) return setMessage("Invalid Field");
                const geometryType = Parcels.geometryType;
                const aiRenderer = JSON.parse(
                    JSON.stringify(FinalData?.renderer)
                );
                console.log("aiRenderer", aiRenderer);
                const fixedRenderer = fixRendererForGeometry(
                    aiRenderer,
                    geometryType
                );
                Parcels.renderer = fixedRenderer;
                setMessage(FinalData.message);
                break;
            case "chart":
                console.log("chart", FinalData?.data);
                setMessage(<ChartDisplay chartData={FinalData?.data} />);
                break;
            case "metadata":
                setMessage(FinalData?.message);
                break;
            case "sql-query":
                getLayerData(view.view, FinalData?.whereClause).then((data) => {
                    setMessage(<AiResponseSql data={data} />);
                });
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
                {/* copy */}
                {type !== "sql-query" && type !== "chart" && (
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
