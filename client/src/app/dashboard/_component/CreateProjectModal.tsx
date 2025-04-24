"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LANGUAGE_CONFIG } from "@/app/editor/_constants"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCodeEditorStore } from "@/stores/useCodeEditorStore"
import { useMutationHook } from "@/hooks/useMutationHook"
import { createProjectApi, getProjectByRoomIdApi } from "@/apis/projectApi"
import { toast } from "sonner"
import useSocket from "@/hooks/useSocket"
import { useUserStore } from "@/stores/userStore"

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
  refetchProject
}: CreateProjectModalProps) {

  const [projectName, setProjectName] = useState("")
  const [roomId, setRoomId] = useState("")
  const [projectId, setProjectId] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [error, setError] = useState("")
  const { setLanguage } = useCodeEditorStore()
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const { socket, isConnected } = useSocket(user?.id);


  const { mutate, isLoading } = useMutationHook(createProjectApi, {
    onError(error) {
      console.log("error data", error)
      toast.error(error?.response?.data?.message || "Failed while creating Project")
    },
    onSuccess(data) {
      router.push(`/editor/${data.data._id}`)
      if (refetchProject) {
        refetchProject()
      }
    }
  })

  const { mutate: getProjectByRoomId } = useMutationHook(getProjectByRoomIdApi, {
    onSuccess(data) {
      setProjectId(data.projectId)
    },
    onError() {
      toast.error("Cannot get project id")
    }
  })

  const handleCreate = () => {
    if (!projectName.trim()) {
      setError("Project name is required.")
      setTimeout(() => setError(""), 3000)
      return
    }

    if (language && !selectedLanguage) {
      setError("Please select a programming language.")
      setTimeout(() => setError(""), 3000)
      return
    }

    const projectData = {
      projectName,
      projectLanguage: selectedLanguage,
      projectCode: LANGUAGE_CONFIG[selectedLanguage]?.defaultCode
    }

    mutate(projectData)
  }

  const handleJoin = async () => {
    if (!user?.id || !roomId || !socket) {
      toast.error("user or room not found")
      return
    }

    // send join request
    socket.emit("join-request", {
      roomId: roomId,
      userId: user.id,
      userName: user.name
    });

    socket.on("error", (message) => {
      toast.error(message)
      return
    })

    socket.on("request-sent", (message) => {
      toast.success(message);
      return
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className=" text-white border border-[#1bf07c] backdrop-blur-[2px] bg-white/15">
        <DialogHeader>
          <DialogTitle className="mygreen">{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        {language && <Input
          placeholder={"eg: Find Prime number"}
          className="bg-white text-black"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />}

        {!language && <Input
          placeholder={"Enter a room ID"}
          className="bg-white text-black"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />}


        {language && (
          <Select onValueChange={(val) => {
            setLanguage(val)
            setSelectedLanguage(val)
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
        )}

        {error && <p className="text-red-500">{error}</p>}

        <Button
          disabled={language ? (!projectName || !selectedLanguage) : !roomId}
          onClick={language ? handleCreate : handleJoin}
          className="mt-4 bg-green hover:bg-green-600 text-white"
        >
          {language ? "Create" : "Join"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
