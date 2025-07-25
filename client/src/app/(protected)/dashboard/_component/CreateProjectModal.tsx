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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCodeEditorStore } from "@/stores/useCodeEditorStore";
import { useMutationHook } from "@/hooks/useMutationHook";
import { createProjectApi } from "@/apis/projectApi";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
import { LANGUAGE_CONFIG } from "../../editor/_constants";
import { useSocket } from "@/context/SocketContext";
import { LoaderCircle } from "lucide-react";

interface CreateProjectModalProps {
  trigger: React.ReactNode;
  title?: string;
  subtitle?: string;
  language?: boolean;
  refetchProject?: () => void;
}

export default function CreateProjectModal({
  trigger,
  title = "Create New Project",
  subtitle = "",
  language = true,
  refetchProject,
}: CreateProjectModalProps) {
  const router = useRouter();
  const { setLanguage } = useCodeEditorStore();
  const { socket } = useSocket()
  const user = useUserStore((state) => state.user);

  const [projectName, setProjectName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [isJoinLoading, setIsJoinLoading] = useState(false)


  const { mutate, isLoading } = useMutationHook(createProjectApi, {
    onError(error) {
      toast.error(error?.response?.data?.message || "Failed while creating Project");
    },
    onSuccess(data) {
      router.push(`/editor/${data.data._id}`);
      refetchProject?.();
      setOpen(false)
    },
  });

  const handleCreate = () => {
    if (!projectName.trim()) {
      setError("Project name is required.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (language && !selectedLanguage) {
      setError("Please select a programming language.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    mutate({
      projectName,
      projectLanguage: selectedLanguage,
      projectCode: LANGUAGE_CONFIG[selectedLanguage]?.defaultCode,
    });
  };

  const handleJoin = () => {
    if (!user?.id || !roomId || !socket) {
      toast.error("User or room ID is missing");
      return;
    }
    setIsJoinLoading(true)
    socket.emit("join-request", {
      roomId,
      userId: user.id,
      userName: user.name,
    });
    setIsJoinLoading(false)

  };

  useEffect(() => {
    if (!socket) return

    const handleSocketJoin = () => {
      console.log("join request comes ")

      setIsJoinLoading(false)
      setOpen(false)
    }

    socket.on("request-sent", handleSocketJoin)

    return () => {
      socket.off("request-sent", handleSocketJoin)
    }

  }, [socket])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="text-white border border-[#1bf07c] backdrop-blur-[2px] bg-white/15">
        <DialogHeader>
          <DialogTitle className="mygreen">{title}</DialogTitle>
          <DialogDescription className="text-gray-400">{subtitle}</DialogDescription>
        </DialogHeader>

        {language ? (
          <>
            <Input
              placeholder="eg: Find Prime Number"
              className="bg-white text-black"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Select onValueChange={(val) => {
              setLanguage(val);
              setSelectedLanguage(val);
            }}>
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white">
                {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                  <SelectItem className="hover:bg-slate-800" key={key} value={config.id}>
                    <Avatar>
                      <AvatarImage src={config.logoPath} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <Input
            placeholder="Enter a room ID"
            className="bg-white text-black"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        )}

        {error && <p className="text-red-500">{error}</p>}

        <Button
          disabled={language ? (!projectName || !selectedLanguage) : !roomId}
          onClick={language ? handleCreate : handleJoin}
          className="mt-4 bg-green hover:bg-green-600 text-white"
        >
          {isLoading || isJoinLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : language ? "Create" : "Join"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
