/* eslint-disable no-unused-vars */
import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import { BiExport } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { BiSolidFileJson } from "react-icons/bi";
import { BiData } from "react-icons/bi";
import {
    getLastAiResV3,
    getLastAiMessage,
} from "../../components/CompassAI-V3/Chat/redux/Compass-V3Slice";

const actions = [
    {
        icon: <BiExport className="text-lg" />,
        name: "Export To Excel",
    },
    {
        icon: <BiSolidFileJson className="text-lg" />,
        name: "Export To GeoJson",
    },
    {
        icon: <BiData className="text-lg" />,
        name: "Export To GeoDataBase",
    },
];

export default function ControlledOpenSpeedDial() {
    const dispatch = useDispatch();

    const { messages } = useSelector((state) => state.CompassV3);

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    let lastResponse = useSelector(getLastAiResV3);

    const ExportToExcel = () => {
        setOpen(false);
        if (lastResponse.role === "user") {
            toast.error("الرسالة الأخيرة للمستخدم وليس للذكاء الاصطناعي");
            return;
        }

        if (!lastResponse.features || lastResponse.features.length === 0) {
            toast.error("لا توجد بيانات للتصدير");
            return;
        }

        try {
            // تحضير البيانات للتصدير
            const dataToExport = lastResponse.features.map(
                (item) => item.attributes
            );
            // إنشاء ورقة عمل من البيانات
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            // إنشاء مصنف وإضافة الورقة
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "البيانات");

            // توليد ملف Excel وتنزيله
            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // إنشاء رابط تنزيل
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "البيانات.xlsx";
            link.click();

            // تحرير الذاكرة
            setTimeout(() => URL.revokeObjectURL(url), 100);

            toast.success("تم تصدير البيانات إلى Excel بنجاح");
        } catch (error) {
            console.error("خطأ في التصدير:", error);
            toast.error("حدث خطأ أثناء تصدير البيانات");
        }
    };

    return (
        <SpeedDial
            ariaLabel="SpeedDial controlled open example"
            sx={{
                position: "absolute",
                bottom: -12,
                left: -15,
                padding: "0px",
                margin: "0px",
            }}
            icon={<SpeedDialIcon />}
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
            FabProps={{
                size: "small", // shrink main button
            }}
            direction="up"
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    slotProps={{
                        tooltip: {
                            title: action.name,
                        },
                    }}
                    onClick={ExportToExcel}
                />
            ))}
        </SpeedDial>
    );
}
