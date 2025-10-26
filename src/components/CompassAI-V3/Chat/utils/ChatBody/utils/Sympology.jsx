import React, { useState } from "react";

const Sympology = ({ data, FeatureLayer }) => {
    const [colors, setColors] = useState(
        data?.renderer?.uniqueValueInfos ||
            data?.renderer?.classBreakInfos ||
            []
    );

    const handleColorChange = async (newColor, index) => {
        const updatedColors = [...colors];
        const updatedSymbol = { ...updatedColors[index].symbol };
        updatedSymbol.color = newColor;
        updatedColors[index] = {
            ...updatedColors[index],
            symbol: updatedSymbol,
        };
        setColors(updatedColors);

        try {
            const view = FeatureLayer.view; // مرجع الخريطة
            const layerView = view
                ? await view.whenLayerView(FeatureLayer)
                : null;

            if (layerView) {
                // 🌟 بداية التأثير التدريجي
                layerView.effect = {
                    filter: { where: "1=1" },
                    includedEffect: "opacity(50%) brightness(80%)",
                };

                // ⏳ بعد نصف ثانية نحدّث اللون فعليًا
                setTimeout(() => {
                    const renderer = FeatureLayer.renderer.clone();

                    if (renderer.uniqueValueInfos) {
                        renderer.uniqueValueInfos[index].symbol.color =
                            newColor;
                    } else if (renderer.classBreakInfos) {
                        renderer.classBreakInfos[index].symbol.color = newColor;
                    }

                    FeatureLayer.renderer = renderer;

                    // 🌈 نرجع التأثير تدريجي خلال ثانية
                    setTimeout(() => {
                        layerView.effect = {
                            filter: { where: "1=1" },
                            includedEffect: "opacity(100%) brightness(120%)",
                        };

                        // وبعد ثانية تانية نرجع للوضع الطبيعي
                        setTimeout(() => {
                            layerView.effect = null;
                        }, 600);
                    }, 200);
                }, 400);
            } else {
                // fallback بدون animation
                const renderer = FeatureLayer.renderer.clone();
                if (renderer.uniqueValueInfos) {
                    renderer.uniqueValueInfos[index].symbol.color = newColor;
                } else if (renderer.classBreakInfos) {
                    renderer.classBreakInfos[index].symbol.color = newColor;
                }
                FeatureLayer.renderer = renderer;
            }
        } catch (err) {
            console.warn("⚠️ Error applying smooth update:", err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full space-y-2">
            <p className="font-semibold text-gray-800">{data.message}</p>

            <div className="flex flex-col w-full bg-white shadow-md p-3 rounded-2xl space-y-2">
                {colors.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all duration-300"
                    >
                        <div className="flex items-center space-x-3 transition-all duration-300">
                            <div
                                className="w-8 h-5 rounded-md border border-gray-300 shadow-sm transition-all duration-500"
                                style={{
                                    backgroundColor:
                                        typeof item.symbol.color === "string"
                                            ? item.symbol.color
                                            : `rgba(${item.symbol.color.join(",")})`,
                                }}
                            ></div>
                            <span className="font-sans text-sm text-gray-800">
                                {item.label}
                            </span>
                        </div>

                        <input
                            type="color"
                            defaultValue={
                                typeof item.symbol.color === "string"
                                    ? item.symbol.color
                                    : "#000000"
                            }
                            className="cursor-pointer w-6 h-6 rounded-md border-none"
                            onChange={(e) =>
                                handleColorChange(e.target.value, index)
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sympology;
