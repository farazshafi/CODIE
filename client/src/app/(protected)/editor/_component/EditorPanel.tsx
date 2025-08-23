"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useCodeEditorStore } from "@/stores/useCodeEditorStore";
import debounce from "lodash.debounce";
import { useUserStore } from "@/stores/userStore";
import { useEditorStore } from "@/stores/editorStore";
import { useSocket } from "@/context/SocketContext";
import { useMutationHook } from "@/hooks/useMutationHook";
import { getCodeApi, saveCodeApi } from "@/apis/projectApi";
import { checkIsEligibleToEditApi } from "@/apis/roomApi";

export default function CodeEditor() {
  const { language, theme, fontSize } = useCodeEditorStore();
  const user = useUserStore((state) => state.user);
  const ownerId = useEditorStore((state) => state.ownerId);
  const roomId = useEditorStore((state) => state.roomId);
  const projectId = useEditorStore((state) => state.projectId);
  const { socket } = useSocket();

  const editorRef = useRef<any>(null);
  const [code, setCode] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(false);

  /** ✅ API mutations */
  const { mutate: getCode } = useMutationHook(getCodeApi, {
    onSuccess(data) {
      setCode(data.data.projectCode || "");
    },
  });

  const { mutate: checkPermission } = useMutationHook(checkIsEligibleToEditApi, {
    onSuccess(data) {
      setIsEditable(data.isAllowed || false);
    },
  });

  const { mutate: saveCode } = useMutationHook(saveCodeApi, {
    onSuccess() {
      console.log("Code saved successfully");
    },
  });

  /** ✅ Fetch initial code and permission */
  const fetchInitialData = useCallback(() => {
    if (!projectId || !user || !roomId) return;
    getCode(projectId);
    checkPermission({ roomId, userId: user?.id });
  }, [projectId, roomId, user?.id]);

  /** ✅ Save full code (debounced) */
  const debouncedSaveCode = useCallback(
    debounce((updatedCode: string) => {
      if (!projectId) return;
      saveCode({ code: updatedCode, projectId });
    }, 3000),
    [projectId]
  );

  /** ✅ Socket check permission (for "refetch-permission" event) */
  const socketCheckPermission = () => {
    if (!roomId || !user) return;
    checkPermission({ roomId, userId: user?.id });
  };

  /** ✅ Emit whole code with line info */
  const emitCodeUpdate = useCallback(
    debounce((lineNumber: number, fullCode: string) => {
      if (!socket) return;
      socket.emit("code-update", {
        userId: user?.id,
        projectId,
        range: `${lineNumber}-${lineNumber}`, // Future use
        content: fullCode, // Send full code
      });
    }, 500),
    [socket, user?.id, projectId]
  );

  /** ✅ On editor mount */
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  /** ✅ On code change */
  const handleChange = (value?: string) => {
    if (!value) return;
    setCode(value);
    debouncedSaveCode(value);

    // Current cursor line (for range info)
    const selection = editorRef.current?.getSelection();
    if (selection) {
      const lineNumber = selection.startLineNumber;
      emitCodeUpdate(lineNumber, value);
    }
  };

  /** ✅ Listen for socket events */
  useEffect(() => {
    if (!socket) return;

    // When others send updated code, replace it
    socket.on("code-update", (data: { content: string; userId: string }) => {
      if (data.userId !== user?.id) {
        setCode(data.content);
      }
    });

    socket.on("refetch-permission", socketCheckPermission);

    return () => {
      socket.off("code-update");
      socket.off("refetch-permission", socketCheckPermission);
    };
  }, [socket, user?.id]);

  /** ✅ Initial fetch */
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <div className="w-full h-full">
      <Editor
        height="100vh"
        theme={theme}
        language={language}
        value={code}
        onMount={handleEditorMount}
        onChange={handleChange}
        options={{
          readOnly: !isEditable,
          fontSize,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
