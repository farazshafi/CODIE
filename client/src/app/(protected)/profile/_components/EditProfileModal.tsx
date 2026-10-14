import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { uploadAvatarApi } from "@/apis/userApi";
import { toast } from "sonner";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    avatar: string;
    github: string;
    portfolio: string;
  }) => void;
  user: {
    name?: string;
    avatar?: string;
    github?: string;
    portfolio?: string;
  };
};

const EditProfileModal = ({ isOpen, onClose, onSave, user }: EditModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    avatar: user?.avatar || "",
    github: user?.github || "",
    portfolio: user?.portfolio || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const data = await uploadAvatarApi(file);
      const newAvatarUrl: string = data?.data?.avatar;
      setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
      toast.success("Avatar uploaded! Click Save Changes to apply.");
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input so user can re-select same file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const initials = (formData.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-md bg-black/30 text-white border border-green-500 max-w-md rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="mygreen text-2xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Clickable avatar */}
        <div className="flex justify-center">
          <div
            className="relative group cursor-pointer"
            onClick={!uploading ? handleAvatarClick : undefined}
            title="Click to change profile picture"
          >
            <Avatar className="h-24 w-24 ring-2 ring-green-500">
              <AvatarImage src={formData.avatar} alt={formData.name} />
              <AvatarFallback className="bg-green-700 text-black font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <Loader2 className="text-white animate-spin" size={22} />
              ) : (
                <Camera className="text-white" size={22} />
              )}
            </div>

            {/* Loading ring */}
            {uploading && (
              <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
            )}
          </div>
        </div>

        {uploading && (
          <p className="text-center text-sm text-green-400 -mt-2">Uploading image…</p>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-800 border-green-500 text-white"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <Label htmlFor="github" className="text-white">GitHub Link</Label>
            <Input
              id="github"
              name="github"
              value={formData.github}
              onChange={handleChange}
              className="bg-gray-800 border-green-500 text-white"
              placeholder="https://github.com/username"
            />
          </div>

          <div>
            <Label htmlFor="portfolio" className="text-white">Portfolio Link</Label>
            <Input
              id="portfolio"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              className="bg-gray-800 border-green-500 text-white"
              placeholder="https://your-portfolio.com"
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-green text-black hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading}
            className="bg-green text-black hover:bg-green-600 disabled:opacity-50"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
