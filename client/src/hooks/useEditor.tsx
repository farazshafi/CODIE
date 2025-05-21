import { useSocket } from "@/context/SocketContext"
import { useCodeEditorStore } from "@/stores/useCodeEditorStore"
import { useUserStore } from "@/stores/userStore"
import { useEffect, useRef } from "react"

export const useEditor = (projectId: string) => {
  const { socket, isConnected } = useSocket()
  const { editor } = useCodeEditorStore()
  const { user } = useUserStore()

  const isProgrammaticChange = useRef(false)

  useEffect(() => {
    if (!socket || !isConnected || !editor) return

    const handleIncomingCodeUpdate = (data: { code: string, userId: string }) => {
      if (data.userId === user?.id) return

      const currentCode = editor.getValue()
      if (data.code !== currentCode) {
        isProgrammaticChange.current = true
        editor.setValue(data.code)
        isProgrammaticChange.current = false
      }
    }

    socket.on("code-update", handleIncomingCodeUpdate)

    return () => {
      socket.off("code-update", handleIncomingCodeUpdate)
    }
  }, [socket, isConnected, editor, projectId, user?.id])

  return {
    isProgrammaticChange
  }
}
