import { Camera, Edit, Eye, Trash2, UserPlus, X, Loader2, Check } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { ConfirmModal } from "../lib/ConfirmModal";
import toast from "react-hot-toast";

const UpdateGroup = () => {
  const { selectedGroup, updateGroupName, updateDescription, updateGroupProfile, isUpdatingProfile, removeMember, addMember, leaveGroup, deleteGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const allUsers = useChatStore((state) => state.allUsers);

  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(selectedGroup.name || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState(selectedGroup.description || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef();
  const groupNameRef = useRef();
  const descriptionRef = useRef();

  const dropdownUsers = allUsers.filter(
    (user) =>
      !selectedGroup.members.some((member) => member._id === user._id) &&
      user._id !== authUser._id
  );

  const filteredDropdownUsers = dropdownUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        await updateGroupProfile({ profilePic: base64Image });
    };
  };

  const handleEdit = (field) => {
    if (field === "group_name") {
      setIsEditingGroupName(true);
      groupNameRef.current?.focus()
    } else if (field === "description") {
      setIsEditingDescription(true);
      descriptionRef.current?.focus();
    }
  }

  const handleNameSave = (field) => {
    if (field === "group_name") {
      updateGroupName({ groupId: selectedGroup._id, name: newGroupName });
      setIsEditingGroupName(false);
    }
  }

  const handleNameCancel = (field) => {
    if (field === "group_name") {
      setNewGroupName(selectedGroup.name || "");
      setIsEditingGroupName(false);
    }
  }

  const handleDescriptionSave = (field) => {
    if (field === "description") {
      updateDescription({ groupId: selectedGroup._id, description: newDescription });
      setIsEditingDescription(false);
    }
  };

  const handleDescriptionCancel = (field) => {
    if (field === "description") {
      setNewDescription(selectedGroup.description || "");
      setIsEditingDescription(false);
    }
  }

  const handleAddUser = (user) => {
    addMember(selectedGroup._id, user._id);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleRemoveUser = (userId) => {
    if (!selectedGroup?._id || !userId) {
      toast.error("Missing group or user information");
      return;
    }
    removeMember(selectedGroup._id, userId);
  };

  const handleCloseModal = () => {
    document.getElementById("my_modal_3").close();
    setIsDropdownOpen(false);
    setSearchQuery("");
    setIsEditingDescription(false);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <button
        onClick={() => document.getElementById("my_modal_3").showModal()}
        className="size-10 flex items-center justify-center p-1 rounded bg-base-300 hover:bg-base-300/70 transition-colors duration-200"
      >
        <Eye />
      </button>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box max-w-md">
          <form method="dialog" onClick={handleCloseModal}>
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || selectedGroup.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-24 rounded-full object-cover border-4"
              />
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer transition-all duration-200">
                {isUpdatingProfile ? (
                  <Loader2 className="size-4 text-base-200 animate-spin" />
                ) : (
                  <Camera className="size-4 text-base-200" />
                )}
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
          </div>

          {/* Group Name */}
          <div className="flex justify-center items-center gap-2 mt-2">
            {!isEditingGroupName ? (
              <span className="font-bold text-2xl">{selectedGroup.name}</span>
            ) : (
              <input
                type="text"
                ref={groupNameRef}
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="input input-bordered text-lg bg-transparent px-2 h-10 max-w-52"
              />
            )}
            {!isEditingGroupName ? (
              <Edit 
                size={18} 
                className="cursor-pointer" 
                onClick={() => {
                  setNewGroupName(selectedGroup.name);
                  handleEdit("group_name");
                }} 
              />
            ) : (
              <div className="flex gap-2">
                <Check 
                  className="size-4 cursor-pointer text-green-600 hover:text-green-400" 
                  onClick={() => handleNameSave("group_name")} 
                />
                <X 
                  className="size-4 cursor-pointer text-red-600 hover:text-red-400" 
                  onClick={() => handleNameCancel("group_name")} 
                />
              </div>
            )}
          </div>

          <div className="divider my-2" />

          {/* Description */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-lg">Description</h3>
              {!isEditingDescription ? (
                <Edit size={18} className="cursor-pointer" onClick={() => handleEdit("description")} />
              ) : (
                <div className="flex gap-2">
                  <Check className="size-4 cursor-pointer text-green-600 hover:text-green-400" onClick={() => handleDescriptionSave("description")} />
                  <X className="size-4 cursor-pointer text-red-600 hover:text-red-400" onClick={() => handleDescriptionCancel("description")} />
                </div>
              )}
            </div>
            {isEditingDescription ? (
              <div>
                <textarea
                  type="text"
                  ref={descriptionRef}
                  autoFocus
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="updateInput textarea textarea-bordered textarea-sm bg-base-300 rounded-lg w-full max-h-24"
                />
              </div>
            ) : (
              <p className="textarea textarea-bordered textarea-sm flex items-center bg-base-300 rounded-lg text-base overflow-auto max-h-24">
                <span>{selectedGroup.description || "No description added..."}</span>
              </p>
            )}
          </div>

          {/* Add Members */}
          {selectedGroup.admin._id === authUser._id && (
            <div className="mt-4">
              <div className="relative" ref={dropdownRef}>
                <div className="input input-bordered bg-base-300 w-full flex items-center" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    placeholder="Add user to group..."
                    className="w-full bg-transparent outline-none"
                  />
                  <UserPlus className="size-5 ml-2 text-gray-500" />
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-base-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredDropdownUsers.length > 0 ? (
                      filteredDropdownUsers.map((user) => (
                        <div
                          key={user._id}
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-3"
                          onClick={() => handleAddUser(user)}
                        >
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className="size-6 rounded-full"
                          />
                          <span>{user.fullName}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No users found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members */}
          <div className="space-y-1 mt-2">
            <h3 className="font-medium text-lg">Members</h3>
            <div className="max-h-52 overflow-y-auto">
              {selectedGroup.members.map((member) => (
                <div key={member._id} className="flex justify-between items-center bg-base-300 px-3 py-3 rounded mb-1">
                  <div className="flex items-center gap-2">
                    <img 
                      src={member.profilePic || "/avatar.png"} 
                      alt={member.fullName} 
                      className="size-6 rounded-full" 
                    />
                    <span>{member.fullName}</span>
                    {selectedGroup.admin._id === member._id && (
                      <span className="text-sm text-indigo-500">(Admin)</span>
                    )}
                  </div>
                  {authUser._id === selectedGroup.admin._id && member._id !== selectedGroup.admin._id && (
                    <button onClick={() => handleRemoveUser(member._id)}>
                      <Trash2 className="text-red-500 size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action mt-5 flex justify-end gap-2">
            {selectedGroup.admin._id === authUser._id ? (
              <>
                <button 
                  className="btn btn-outline bg-red-600 text-white border-none"
                  onClick={() => document.getElementById('confirm-delete').showModal()}
                >
                  Delete Group
                </button>

                <ConfirmModal
                  id="confirm-delete"
                  message="Are you sure you want to delete this group?"
                  onConfirm={() => {
                    document.getElementById('confirm-delete').close();
                    deleteGroup();
                  }}
                  onCancel={() => document.getElementById('confirm-delete').close()}
                />
              </>
            ) : (
              <>
                <button 
                  className="btn btn-outline bg-red-600 text-white border-none"
                  onClick={() => document.getElementById('confirm-leave').showModal()}
                >
                  Leave Group
                </button>
                
                <ConfirmModal
                  id="confirm-leave"
                  message="Are you sure you want to leave this group?"
                  onConfirm={() => {
                    document.getElementById('confirm-leave').close();
                    leaveGroup();
                  }}
                  onCancel={() => document.getElementById('confirm-leave').close()}
                />
              </>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default UpdateGroup;
