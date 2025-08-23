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
import LockSelectionButton from "./LockSelectionButton";
import { toast } from "sonner";
import UnlockButton from "./UnlockButton";

export default function EditorPanel() {
  const { language, theme, fontSize } = useCodeEditorStore();
  const user = useUserStore((state) => state.user);
  const ownerId = useEditorStore((state) => state.ownerId);
  const roomId = useEditorStore((state) => state.roomId);
  const projectId = useEditorStore((state) => state.projectId);
  const { socket } = useSocket();

  const [locks, setLocks] = useState<{ [key: string]: string[] }>({});
  const decorationIdsRef = useRef<string[]>([]);




  const editorRef = useRef<any>(null);
  const [code, setCode] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(false);

  const { mutate: getCode } = useMutationHook(getCodeApi, {
    onSuccess(data) {
      setCode(data.data.projectCode || "");
    },
  });

  const { mutate: checkPermission } = useMutationHook(checkIsEligibleToEditApi, {
    onSuccess(data) {
      setIsEditable(data.isAllowed || false);
    },
    onError(error) {
      if (error.response.data.message === "Room Not found!") {
        setIsEditable(true)
      } else {
        setIsEditable(false)
      }
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
      if (!projectId || user?.id !== ownerId) return;

      saveCode({ code: updatedCode, projectId });
    }, 3000),
    [projectId]
  );

  /** ✅ Socket check permission (for "refetch-permission" event) */
  const socketCheckPermission = () => {
    if (!roomId || !user) return;
    checkPermission({ roomId, userId: user?.id });
    console.log("permision checked")
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

  useEffect(() => {
    console.log("Applying decorations for locks:", locks);
  }, [locks]);


  // Locking system
  const handleLockClick = () => {
    if (!editorRef.current || !socket) return;

    const selections = editorRef.current.getSelections();
    if (!selections || selections.length === 0) return;

    let ranges: string[] = selections.map(sel => {
      const start = sel.startLineNumber;
      const end = sel.endLineNumber;
      return start === end ? `${start}` : `${start}-${end}`;
    });

    // If only one range and single line, send as string
    const finalRanges = ranges.length === 1 && !ranges[0].includes("-")
      ? ranges[0]
      : ranges;

    socket.emit("lock:request", {
      projectId,
      userId: user?.id,
      ranges: finalRanges,
      type: "manual"
    });
  };

  const handleUnlockClick = () => {
    if (!editorRef.current || !socket) return;

    const selections = editorRef.current.getSelections();
    if (!selections || selections.length === 0) return;

    const ranges: string[] = selections.map(sel => {
      const start = sel.startLineNumber;
      const end = sel.endLineNumber;
      return `${start}-${end}`;
    });

    socket.emit("lock:release", {
      projectId,
      userId: user?.id,
      ranges
    });
  };


  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit("get-locked-lines", { projectId });
  }, [socket, projectId]);


  useEffect(() => {
    if (!socket) return;

    socket.on("lock:released", ({ range, userId }) => {
      setLocks(prev => {
        const updated = { ...prev };
        if (updated[userId]) {
          updated[userId] = updated[userId].filter(r => r !== range);
          if (updated[userId].length === 0) {
            delete updated[userId];
          }
        }
        return updated;
      });
    });

    return () => {
      socket.off("lock:released");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("locked-lines", ({ locks }) => {
      const updated: { [key: string]: string[] } = {};
      locks.forEach(({ range, userId }: { range: string, userId: string }) => {
        if (!updated[userId]) updated[userId] = [];
        updated[userId].push(range);
      });
      console.log("here locked line comes: ", updated)
      setLocks(updated);
    });

    return () => {
      socket.off("locked-lines");
    };
  }, [socket]);


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

  /** ✅ Listen locking resposne */
  useEffect(() => {
    if (!socket) return;

    socket.on("lock:granted", ({ range, userId }) => {
      setLocks(prev => {
        const updated = { ...prev };
        if (!updated[userId]) updated[userId] = [];
        if (!updated[userId].includes(range)) {
          updated[userId].push(range);
        }
        return updated;
      });
    });

    socket.on("lock:denied", ({ range, lockedBy }) => {
      toast.error(`Range ${range} locked by another user (${lockedBy})`);
    });

    return () => {
      socket.off("lock:granted");
      socket.off("lock:denied");
    };
  }, [socket]);

  useEffect(() => {
    if (!editorRef.current || !window.monaco) return;

    const editor = editorRef.current;

    const decorations = Object.entries(locks).flatMap(([uid, ranges]) =>
      ranges.map(rangeStr => {
        const [start, end] = rangeStr.split("-").map(Number);
        return {
          range: new window.monaco.Range(start, 1, end, 1),
          options: {
            isWholeLine: true,
            className: uid === user?.id
              ? "locked-range-current"
              : "locked-range-other"
          }
        };
      })
    );

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, decorations);
  }, [locks, user?.id]);


  useEffect(() => {
    console.log("Locks updated:", locks);
  }, [locks]);



  /** ✅ Initial fetch */
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);



  return (
    <div className="w-full h-full">
      <div className="flex gap-x-4 my-3 mx-3">
        <LockSelectionButton onLock={handleLockClick} />
        <UnlockButton onUnlock={handleUnlockClick} />
      </div>
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
