import ChatBody from "./utils/ChatBody/ChatBody";
import Header from "./utils/Header/Header";
import MessageBox from "./utils/MessageBox/MessageBox";
const MangeChat = () => {
    return (
        <div className="w-full h-full flex flex-col items-between justify-between  rounded-2xl overflow-hidden  border-2 border-blue-500">
            {/* header */}
            <div className="w-full  bg-blue-900 flex flex-col space-y-3 p-2 border-b-2 border-b-blue-900">
                <Header />
            </div>
            {/* Body */}
            <div className="w-full h-full  md:h-[78%] overflow-auto">
                <ChatBody />
            </div>
            {/* Message Box */}
            <div className="w-full flex flex-col items-center justify-start ">
                <MessageBox />
            </div>
        </div>
    );
};

export default MangeChat;
