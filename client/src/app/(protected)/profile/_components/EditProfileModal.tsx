import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";


type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data) => void;
  user: any
}

const EditProfileModal = ({ isOpen, onClose, onSave, user }: EditModalProps) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    avatar: user?.avatar || "",
    github: user?.github || "",
    portfolio: user?.portfolio || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-md bg-black/30 text-white border border-green-500 max-w-md rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="mygreen text-2xl font-bold">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

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
            <Label htmlFor="avatar" className="text-white">Profile Image URL</Label>
            <Input
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              className="bg-gray-800 border-green-500 text-white"
              placeholder="Paste your image link"
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
          <Button variant="outline" onClick={onClose} className="border-green text-black hover:bg-gray-800 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-green text-black hover:bg-green-600">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
