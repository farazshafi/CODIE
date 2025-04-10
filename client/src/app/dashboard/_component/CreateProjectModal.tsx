"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useRouter} from "next/navigation"
import { useState, ReactNode } from "react";

interface CreateProjectModalProps {
  trigger: ReactNode;
  title?: string;
  subtitle?: string;
  language?: boolean;
  onSubmit?: (data: { name: string; language?: string }) => void;
}

export default function CreateProjectModal({
  trigger,
  title = "Create New Project",
  subtitle = "Enter project details below.",
  language = true,
  onSubmit,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const router = useRouter()

  const handleCreate = () => {
    if (onSubmit) {
      onSubmit({
        name: projectName,
        language: language ? selectedLanguage : undefined,
      });
      router.push("/editor")
    } else {
      console.log("Creating:", projectName, selectedLanguage);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-primary text-white border border-[#1bf07c] backdrop-blur-[2px] bg-white/15">
        <DialogHeader>
          <DialogTitle className="mygreen">{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Name"
          className="bg-white text-black"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        {language && (
          <Select onValueChange={(val) => setSelectedLanguage(val)}>
            <SelectTrigger className="bg-white text-black">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white">
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="rest">REST</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectContent>
          </Select>
        )}
      
        <Button
          onClick={handleCreate}
          className="mt-4 bg-green hover:bg-green-600 text-white"
        >
          Create
        </Button>
      </DialogContent>
    </Dialog>
  );
}
