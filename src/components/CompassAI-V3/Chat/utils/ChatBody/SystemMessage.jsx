import React from "react";

const SystemMessage = ({ item, selectField }) => {
    return (
        <div className="flex w-full flex-col items-center justify-center space-y-4">
            <div className="flex items-center shadow-md ring-2 ring-sky-300 select-none cursor-pointer justify-center rounded-full px-6 py-1 ">
                <h1 className="text-md font-sec">
                    Available Fields ({" "}
                    <span className="text-blue-800">{item.name}</span> )
                </h1>
            </div>
            <div className="flex items-center justify-center space-x-2 flex-wrap">
                {/* item */}
                {item.message.map((field) => {
                    return (
                        <div
                            onClick={() => selectField(field.name)}
                            className=" shadow-2xl flex items-center justify-center px-6 py-1 bg-gradient-to-r from-blue-200 to-blue-400
                                        outline-1 cursor-pointer
                                        outline-sky-500 rounded-xl text-sm font-sec space-x-2 space-x-reverse my-2 font-bold hover:outline-gray-950 trans
                                        hover:from-blue-100 "
                        >
                            {field.name}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SystemMessage;
