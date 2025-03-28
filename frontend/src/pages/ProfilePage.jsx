import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Edit, Check, X, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, updateUserInfo } = useAuthStore();
  const [selectedImg, setSetselectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState({ fullName: false, email: false });
  const [editedData, setEditedData] = useState({ fullName: authUser?.fullName, email: authUser?.email });

  const fullNameInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
        const base64Image = reader.result;
        setSetselectedImg(base64Image);
        await updateProfile({ profilePic: base64Image });
    };
  };

  const handleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      if (field === "fullName") {
        fullNameInputRef.current?.focus();
      } else if (field === "email") {
        emailInputRef.current?.focus();
      }
    }, 0);
  };

  const handleCancel = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    setEditedData((prev) => ({ ...prev, [field]: authUser[field] }));
  };

  const handleSave = async (field) => {
    await updateUserInfo({ [field]: editedData[field] });
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-2">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
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
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? (<span className="flex items-center gap-1"><Loader2 className="size-4 animate-spin" />Uploading ...</span>)
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex justify-between px-3 gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </div>
                <div>
                  {!isEditing.fullName ? (
                    <Edit className="size-4 cursor-pointer hover:text-white" onClick={() => handleEdit("fullName")} />
                  ) : (
                    <div className="flex gap-2">
                      <Check className="size-4 cursor-pointer text-green-600 hover:text-green-400" onClick={() => handleSave("fullName")} />
                      <X className="size-4 cursor-pointer text-red-600 hover:text-red-400" onClick={() => handleCancel("fullName")} />
                    </div>
                  )}
                </div>
              </div>
              {!isEditing.fullName ? (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
              ) : (
                <input
                  type="text"
                  ref={fullNameInputRef}
                  autoFocus={isEditing.fullName}
                  value={editedData.fullName}
                  onChange={(e) => setEditedData({ ...editedData, fullName: e.target.value })}
                  className="profileInput px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                />
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex justify-between px-3 gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </div>
                <div>
                  {!isEditing.email ? (
                    <Edit className="size-4 cursor-pointer hover:text-white" onClick={() => handleEdit("email")} />
                  ) : (
                    <div className="flex gap-2">
                      <Check className="size-4 cursor-pointer text-green-600 hover:text-green-400" onClick={() => handleSave("email")} />
                      <X className="size-4 cursor-pointer text-red-600 hover:text-red-400" onClick={() => handleCancel("email")} />
                    </div>
                  )}
                </div>
              </div>
              {!isEditing.email ? (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
              ) : (
                <input
                  type="email"
                  ref={emailInputRef}
                  autoFocus={isEditing.email}
                  value={editedData.email}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                  className="profileInput px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                />
              )}
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
