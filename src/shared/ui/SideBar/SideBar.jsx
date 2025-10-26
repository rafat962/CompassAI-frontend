/* eslint-disable no-unused-vars */
import {
    HiAdjustmentsVertical,
    HiBuildingOffice,
    HiMiniArrowRightStartOnRectangle,
    HiOutlineChartPie,
} from "react-icons/hi2";
import ListContainer from "./utils/ListContainer";
import Avatar from "@mui/material/Avatar";
import { useSideBar } from "./context/SideContext";
import { LuBrainCircuit, LuBrain } from "react-icons/lu";
import { HiOutlineChartSquareBar } from "react-icons/hi";
import ListItem from "./utils/ListItem";
import AlertDialog from "../AlertDialog";
import { useQuery } from "@tanstack/react-query";
import { backendImagesUrl } from "../../../environment/devolpmentApi";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
const SideBar = () => {
    // lan
    const { t } = useTranslation();
    const isRTL = i18next.language === "ar";
    // -----------
    const { data: userData } = useQuery({
        queryKey: ["userData"],
        queryFn: () => Promise.resolve(), // dummy fetcher
        enabled: false, // won't actually call the fetcher
    });
    const userName = userData?.name;
    const photo = `${backendImagesUrl}/users/${userData?.photo}`;
    // open Toggle
    const { dispatch, state } = useSideBar();
    const { NavWidth, openNav } = state;
    const handleClick = (type) => {
        dispatch({ type: type });
    };
    const handleToggleNav = () => {
        dispatch({ type: "openNav" });
        dispatch({ type: "NavWidth" });
    };
    return (
        <div
            className={`${NavWidth} dark:bg-slate-950 transition-all ease-in-out duration-400 text-nowrap h-full p-1 py-3 pb-6 flex flex-col justify-between border-l-[1px] border-l-gray-500`}
        >
            <Avatar
                onClick={handleToggleNav}
                className={`${
                    openNav
                        ? `${isRTL ? "right-50 hover:translate-x-1" : "left-50 hover:translate-x-1 rotate-180"} `
                        : `${isRTL ? "right-10 scale-90 hover:-translate-x-1 rotate-180" : "left-10 scale-90 hover:-translate-x-1 "} `
                } top-30 z-10 cursor-pointer hover:scale-105 transition-all ease-in-out duration-400 animate-spin-every-5s`}
                src="/next.png"
                sx={{
                    width: 22,
                    height: 22,
                    position: "absolute",
                    bgcolor: "white",
                }}
            />
            <ListContainer>
                {/* avatar */}
                <div className="flex flex-col items-center justify-center mb-5 space-y-2 tracking-wider w-full">
                    <Avatar
                        src={"/users/profile.png"}
                        sx={{ width: 58, height: 58 }}
                        className={` ${openNav ? "scale-100" : "scale-75"} w-[56px] h-[56px]`}
                    />
                    {openNav && (
                        <p className="text-lg">{userName || "Raafat kamel"}</p>
                    )}
                    <div className="w-full h-[1px] bg-gray-700 mt-2"></div>
                </div>
                <ListItem
                    toUrl="/CompassAI-V1"
                    openNav={openNav}
                    name={t("Compass-V1")}
                    icon={<LuBrainCircuit />}
                />
                <ListItem
                    toUrl="/CompassAI-V2"
                    openNav={openNav}
                    name={t("Compass-V2")}
                    icon={<LuBrain />}
                />
                <ListItem
                    toUrl="/CompassAI-V3"
                    openNav={openNav}
                    name={t("Compass-V3")}
                    icon={<LuBrain />}
                />
            </ListContainer>

            <ListContainer>
                <ListItem
                    toUrl="/customChat"
                    openNav={openNav}
                    name={t("الإعدادات")}
                    icon={<HiAdjustmentsVertical />}
                />

                <AlertDialog
                    content={
                        <ListItem
                            openNav={openNav}
                            name={t("تسجيل الخروج")}
                            icon={<HiMiniArrowRightStartOnRectangle />}
                        />
                    }
                />
            </ListContainer>
        </div>
    );
};

export default SideBar;
