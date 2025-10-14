import React from "react";
import { LuRefreshCcw } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { ClearMessage } from "../../redux/Compass-V3Slice";
import { Parcels } from "../../../../../shared/static/StaticLayersData";
import { graphicsLayer } from "../../helpers/Layer.api";
const Header = () => {
    const dispatch = useDispatch();
    const { view, FeatureLayer } = useSelector((state) => state.CompassV3);

    const ClearChat = () => {
        dispatch(ClearMessage());
        view.view.graphics.removeAll();
        graphicsLayer.removeAll();
        // view.view.goTo(
        //     {
        //         zoom: zoom,
        //         center: center,
        //     },
        //     {
        //         duration: 1000,
        //         easing: "ease-in-out",
        //     }
        // );
        FeatureLayer.definitionExpression = "1=1";
    };
    return (
        <>
            <div className="flex items-center justify-between h-5 md:h-7 px-4 ">
                {/* logo */}
                <div className="fr w-fit space-x-2">
                    <div className=" w-6 h-6 md:w-7 md:h-7 object-cover">
                        <img
                            className="w-full h-full object-cover"
                            src="/compass.png"
                            alt=""
                        />
                    </div>
                    <p className="font-sec text-blue-50 font-semibold select-none text-sm md:text-lg">
                        CompassAI V3
                    </p>
                </div>
                {/* items */}
                <div className="fr" onClick={ClearChat}>
                    <LuRefreshCcw className="text-lg md:text-xl text-blue-50 cursor-pointer hover:rotate-45 trans" />
                </div>
            </div>
            {/* <div className="bg-gradient-to-r from-transparent via-blue-800 to-transparent h-[1.5px] w-full" /> */}
        </>
    );
};

export default Header;
