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
import { createProjectApi } from "@/apis/projectApi"
import { toast } from "sonner"

interface CreateProjectModalProps {
  trigger: React.ReactNode;
  title?: string;
  subtitle?: string;
  language?: boolean;
}

export default function CreateProjectModal({
  trigger,
  title = "Create New Project",
  subtitle = "Enter project details below.",
  language = true,
}: CreateProjectModalProps) {

  const [projectName, setProjectName] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [error, setError] = useState("")
  const { setLanguage } = useCodeEditorStore()
  const router = useRouter()

  const { mutate, isLoading } = useMutationHook(createProjectApi, {
    onError(error) {
      console.log("error data", error)
      toast.error(error?.response?.data?.message || "Failed while creating Project")
    },
    onSuccess(data) {
      console.log("succes data", data)
      router.push("/editor")
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
          placeholder="eg: Find Prime number"
          className="bg-white text-black"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

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
          disabled={language ? (!projectName || !selectedLanguage) : !projectName}
          onClick={handleCreate}
          className="mt-4 bg-green hover:bg-green-600 text-white"
        >
          {language ? "Create" : "Join"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
