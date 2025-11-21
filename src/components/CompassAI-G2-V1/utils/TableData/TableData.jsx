/* eslint-disable no-unused-vars */
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCompassContext } from "../../context/CompassContext";
import { ImSpinner2 } from "react-icons/im";

const paginationModel = { page: 0, pageSize: 15 };

// مفتاح الاستعلام لبيانات الـ FeatureLayer
const FEATURE_LAYER_QUERY_KEY = "featureLayerData";
// مفتاح الاستعلام لبيانات الـ VLayer
const VLAYER_QUERY_KEY = "vLayerData";

// دالة لجلب بيانات الـ layer
const fetchLayerData = async (layer) => {
    if (!layer) return { columns: [], rows: [] };

    try {
        const data = await layer.queryFeatures();
        const features = data.features;

        if (!features || features.length === 0) {
            return { columns: [], rows: [] };
        }

        const columns = Object.keys(features[0].attributes).map((field) => ({
            field,
            headerName: field,
            width: 150,
        }));

        const rows = features.map((item) => ({
            id: item.attributes.OBJECTID,
            ...item.attributes,
        }));

        return { columns, rows };
    } catch (err) {
        console.error("Error loading features:", err);
        throw new Error(`Failed to load layer data: ${err.message}`);
    }
};

export default function TableData() {
    const { state } = useCompassContext();
    const { FeatureLayer, VFeatureLayer, VLayerMode } = state;

    // تحديد الـ layer المستخدم بناءً على VLayerMode
    const currentLayer = VLayerMode ? VFeatureLayer : FeatureLayer;
    const queryKey = VLayerMode ? VLAYER_QUERY_KEY : FEATURE_LAYER_QUERY_KEY;
    console.log(VLayerMode);
    // استخدام React Query لجلب البيانات مع refetch تلقائي
    const {
        data: layerData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [queryKey, currentLayer?.url],
        queryFn: () => fetchLayerData(currentLayer),
        enabled: !!currentLayer,
        refetchInterval: 3000,
        staleTime: 0,
    });
    if (isLoading) {
        return (
            <Paper sx={{ height: "100%", width: "100%", padding: "7px 15px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <ImSpinner2 className="animate-spin w-6 text-4xl" />
                </div>
            </Paper>
        );
    }

    if (isError) {
        return (
            <Paper sx={{ height: "100%", width: "100%", padding: "7px 15px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <ImSpinner2 className=" animate-spin w-6" />
                </div>
            </Paper>
        );
    }

    const { columns = [], rows = [] } = layerData || {};

    return (
        <Paper sx={{ height: "100%", width: "100%", padding: "7px 15px" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[10, 20]}
                sx={{ border: 0 }}
                loading={isLoading}
            />
        </Paper>
    );
}
