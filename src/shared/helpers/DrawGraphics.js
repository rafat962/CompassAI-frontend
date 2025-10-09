import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import toast from "react-hot-toast";

function drawGraphics(outFeatures, finalview) {
    try {
        if (!outFeatures || outFeatures.length === 0) {
            return;
        }
        // مسح الجرافيكس القديمة
        finalview.graphics.removeAll();
        const allGraphics = [];
        let extent = null;
        outFeatures.forEach((row) => {
            if (
                row.geometry &&
                row.geometry.rings &&
                row.geometry.rings.length > 0
            ) {
                try {
                    const polygon = new Polygon({
                        rings: row.geometry.rings,
                        spatialReference: {
                            wkid: 32636,
                        },
                    });

                    const graphic = new Graphic({
                        geometry: polygon,
                        symbol: {
                            type: "simple-fill",
                            color: [255, 0, 0, 0.3],
                            outline: {
                                color: [255, 0, 0, 0.8],
                                width: 2,
                            },
                        },
                        attributes: row.attributes,
                        popupTemplate: {
                            title: "Feature Information",
                            content: `
                                <div>
                                    <p><strong>OBJECTID:</strong> {OBJECTID}</p>
                                    <p><strong>Canal:</strong> {canal}</p>
                                    <p><strong>Zone:</strong> {Zone}</p>
                                </div>
                            `,
                        },
                    });

                    allGraphics.push(graphic);
                    finalview.graphics.add(graphic);

                    // حساب النطاق التراكمي
                    if (graphic.geometry && graphic.geometry.extent) {
                        if (extent) {
                            extent = extent.union(graphic.geometry.extent);
                        } else {
                            extent = graphic.geometry.extent.clone();
                        }
                    }
                } catch (error) {
                    console.error(
                        "Error creating graphic for row:",
                        row,
                        error
                    );
                }
            }
        });
        // التكبير إلى النطاق المحسوب
        if (extent && !extent.isEmpty) {
            setTimeout(() => {
                finalview
                    .goTo(extent, {
                        duration: 1000,
                        padding: 50,
                    })
                    .catch((error) => {
                        toast.error(error.message);
                        if (allGraphics[0]?.geometry) {
                            finalview.goTo(allGraphics[0].geometry);
                        }
                    });
            }, 100);
        }
    } catch (error) {
        toast.error(error.message);

        console.error("Error processing features:", error);
    }
}

export { drawGraphics };
