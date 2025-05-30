import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useEffect, useState } from "react";

const HomePage = () => {
    const { selectedUser } = useChatStore();
    const { selectedGroup } = useGroupStore();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const selectedChat = selectedUser || selectedGroup;
    const isChatSelected = !!selectedChat;

    return (
        <div className="h-screen bg-base-200">
            <div className="flex items-center justify-center pt-20 px-4">
                <div className="bg-base-100 rounded-lg shadow-xl w-full h-[calc(100vh-6rem)]">
                    <div className="flex h-full rounded-lg overflow-hidden">
                        {/* Sidebar should take full width on mobile */}
                        {isMobile ? (
                            !selectedChat ? <Sidebar /> : <ChatContainer />
                        ) : (
                            <>
                                <Sidebar />
                                {!isChatSelected ? <NoChatSelected /> : <ChatContainer />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;