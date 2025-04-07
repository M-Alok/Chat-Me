import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { ChevronDown, Loader2, PlusIcon, X } from "lucide-react";

const CreateGroup = () => {
    const allUsers = useChatStore((state) => state.allUsers);

    const [groupName, setGroupName] = useState("");
    const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [description, setDescription] = useState("");
    const [selectedImg, setSelectedImg] = useState(null);
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);
    const isCreatingGroup = useGroupStore((state) => state.isCreatingGroup);

    const setActiveTab = useAuthStore((state) => state.setActiveTab);

    const closeDialog = () => {
        modalRef.current.close();
        setGroupName("");
        setSelectedGroupUsers([]);
        setDescription("");
        setSelectedImg(null);
        fileInputRef.current.value = "";
        setActiveTab("groups");
    };

    const currentUserId = useAuthStore.getState().authUser?._id;
    const dropdownUsers = allUsers.filter(
        user =>
            !selectedGroupUsers.some(u => u._id === user._id) &&
            user._id !== currentUserId
    );

    const filteredDropdownUsers = dropdownUsers.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
    };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreateGroup = () => {
        useGroupStore.getState().createGroup({
            name: groupName.trim(),
            members: selectedGroupUsers.map(user => user._id),
            admin: useAuthStore.getState().authUser?._id,
            description,
            profilePic: selectedImg,
        }, closeDialog);
    };

    const addUser = (user) => {
        if (!selectedGroupUsers.some(u => u._id === user._id)) {
            setSelectedGroupUsers([...selectedGroupUsers, user]);
        }
        setSearchQuery("");
        setIsDropdownOpen(false);
    };

    const removeUser = (userId) => {
        setSelectedGroupUsers(selectedGroupUsers.filter(u => u._id !== userId));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
        };
    }

    const handleRemoveImage = () => {
        setSelectedImg(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div>
            <button
                onClick={() => document.getElementById("show_modal").showModal()}
                className="btn btn-sm btn-outline text-base-100 font-medium bg-primary rounded-sm border-none gap-1"
            >
                <span>New Group</span>
                <PlusIcon className="size-5" />
            </button>
            <dialog ref={modalRef} id="show_modal" className="modal min-h-max">
                <div className="modal-box w-11/12 max-w-md">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            <X className="size-5" />
                        </button>
                    </form>
                    <h3 className="font-bold text-lg mb-4">Create New Group</h3>

                    {/* Group Name Input */}
                    <div className="form-control w-full mb-4">
                        <label htmlFor="group_name" className="label">
                            <span className="label-text">Group Name *</span>
                        </label>
                        <input
                            id="group_name"
                            type="text"
                            autoComplete="off"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name..."
                            className="input input-bordered w-full"
                        />
                    </div>

                    {/* Add Users Input */}
                    <div className="form-control w-full mb-4">
                        <label htmlFor="add_user" className="label">
                            <span className="label-text">Add Users *</span>
                        </label>

                        {/* Selected Users Chips */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedGroupUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="badge badge-lg bg-purple-800 text-white py-4 gap-2"
                                >
                                {user.fullName}
                                <button
                                    type="button"
                                    onClick={() => removeUser(user._id)}
                                    className="text-xs"
                                >
                                    <X className="size-3" />
                                </button>
                                </div>
                            ))}
                        </div>

                        {/* User Search Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className="input input-bordered w-full flex items-center cursor-text"
                                onClick={() => setIsDropdownOpen(true)}
                            >
                                <input
                                    id="add_user"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="Add user for group..."
                                    className="w-full outline-none bg-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen((prev) => !prev);
                                    }}
                                    className="focus:outline-none"
                                >
                                    <ChevronDown
                                        className={`size-5 transition-transform ${
                                        isDropdownOpen ? "rotate-180" : "rotate-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredDropdownUsers.length > 0 ? (
                                        filteredDropdownUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-3"
                                            onClick={() => addUser(user)}
                                        >
                                            <img
                                            src={user.profilePic || "/avatar.png"}
                                            alt={user.fullName}
                                            className="size-8 rounded-full"
                                            />
                                            <span>{user.fullName}</span>
                                        </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500">
                                            No users found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Group description input */}
                    <div className="form-control w-full mb-4">
                        <label htmlFor="description" className="label">
                            <span className="label-text">Description</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description for group..."
                            className="textarea textarea-bordered w-full"
                        />
                    </div>

                    {/* Add profile pic input */}
                    <div className="form-control w-full mb-4">
                        <label htmlFor="profile_pic" className="label">
                            <span className="label-text">Profile</span>
                        </label>
                        <div className="file-input border-opacity-[0.2] w-full flex justify-between">
                            <input
                                type="file"
                                id="profile_pic"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="file-input focus:outline-none"
                            />
                            {selectedImg && (
                                <div className="relative max-w-10">
                                <img
                                    src={selectedImg}
                                    alt="Selected Profile"
                                    className="m-2 rounded-full size-9 object-cover"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    type="button"
                                    className="absolute top-0 -right-3.5 w-4 h-4 rounded-full bg-base-300 flex items-center justify-center"
                                >
                                    <X className="size-3 p-[1px]" />
                                </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Create Button */}
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn btn-outline bg-indigo-500 text-zinc-200 border-none rounded font-semibold text-lg tracking-wide w-full"
                            onClick={handleCreateGroup}
                        >
                            <span className="flex items-center gap-2">
                                Create Group
                                {isCreatingGroup && <Loader2 className="size-5 animate-spin" />}
                            </span>
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default CreateGroup;
