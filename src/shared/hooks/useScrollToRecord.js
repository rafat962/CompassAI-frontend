import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import Polygon from "@arcgis/core/geometry/Polygon";

function useScrollToRecord(row = null, view, type, wkid = 4326) {
    if (!view || view.destroyed) {
        console.warn("View is not available or has been destroyed");
        return;
    }

    if (!row || !row.geometry) {
        console.warn("Invalid row data or missing geometry");
        return;
    }

    if (type === "scroll") {
        try {
            // Verify view is ready
            if (!view.ready) {
                view.when(() => {
                    executeScroll(view, row, wkid);
                });
                return;
            }

            executeScroll(view, row, wkid);
        } catch (error) {
            console.error("Error in scroll operation:", error);
        }
    } else {
        // Clear graphics only if view is valid
        if (!view.destroyed) {
            view.graphics.removeAll();
        }
    }
}

function executeScroll(view, row, wkid) {
    let type = row.geometry.type;
    // Create point geometry
    if (type === "point") {
        const point = new Point({
            x: row.geometry.x,
            y: row.geometry.y,
            spatialReference: { wkid },
        });
        // Create graphic
        const graphic = new Graphic({
            geometry: point,
            symbol: {
                type: "simple-marker",
                color: [255, 0, 0],
                size: "12px",
                outline: {
                    color: [255, 255, 255],
                    width: 2,
                },
            },
        });
        view.goTo(
            {
                target: point,
                zoom: 15,
            },
            {
                duration: 1000,
                easing: "ease-in-out",
            }
        );
        // Clear and add graphic
        view.graphics.removeAll();
        view.graphics.add(graphic);
    } else if (type === "polyline") {
        const polyline = new Polyline({
            paths: row.geometry.paths,
            spatialReference: { wkid },
        });
        // Create graphic
        const graphic = new Graphic({
            geometry: polyline,
            symbol: {
                type: "simple-line",
                color: [255, 0, 0],
                width: 4,
            },
        });
        view.goTo(
            {
                target: polyline,
                zoom: 15,
            },
            {
                duration: 1000,
                easing: "ease-in-out",
            }
        );
        // Clear and add graphic
        view.graphics.removeAll();
        view.graphics.add(graphic);
    } else if (type === "polygon") {
        // Create polygon geometry
        const polygon = new Polygon({
            rings: row.geometry.rings,
            spatialReference: { wkid },
        });
        // Create graphic
        const graphic = new Graphic({
            geometry: polygon,
            symbol: {
                type: "simple-fill",
                color: [255, 0, 0, 0.5],
                outline: {
                    color: [255, 255, 255],
                    width: 2,
                },
            },
        });
        view.goTo(
            {
                target: polygon,
                zoom: 15,
            },
            {
                duration: 1000,
                easing: "ease-in-out",
            }
        );
        // Clear and add graphic
        view.graphics.removeAll();
        view.graphics.add(graphic);
    } else {
        console.warn("Unsupported geometry type:", type);
    }
}

export default useScrollToRecord;
