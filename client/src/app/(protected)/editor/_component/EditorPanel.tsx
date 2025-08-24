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
import UnlockButton from "./UnlockButton";
import { toast } from "sonner";

export default function EditorPanel() {
  const { language, theme, fontSize } = useCodeEditorStore();
  const user = useUserStore((state) => state.user);
  const ownerId = useEditorStore((state) => state.ownerId);
  const roomId = useEditorStore((state) => state.roomId);
  const projectId = useEditorStore((state) => state.projectId);
  const { socket } = useSocket();

  const editorRef = useRef<any>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const [code, setCode] = useState<string>("");
  const [lastValidCode, setLastValidCode] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [locks, setLocks] = useState<{ [key: string]: string[] }>({});

  /** ✅ API mutations */
  const { mutate: getCode } = useMutationHook(getCodeApi, {
    onSuccess(data) {
      setCode(data.data.projectCode || "");
      setLastValidCode(data.data.projectCode || "");
    },
  });

  const { mutate: checkPermission } = useMutationHook(checkIsEligibleToEditApi, {
    onSuccess(data) {
      setIsEditable(data.isAllowed || false);
    },
    onError(error) {
      if (error.response.data.message === "Room Not found!") {
        setIsEditable(true);
      } else {
        setIsEditable(false);
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
      setLastValidCode(updatedCode);
    }, 3000),
    [projectId]
  );

  /** ✅ Emit whole code with line info */
  const emitCodeUpdate = useCallback(
    debounce((fullCode: string) => {
      if (!socket || !editorRef.current) return;
      const selections = editorRef.current.getSelections();
      if (!selections || selections.length === 0) return;

      const ranges: string[] = selections.map(sel => {
        const start = sel.startLineNumber;
        const end = sel.endLineNumber;
        return start === end ? `${start}` : `${start}-${end}`;
      });

      socket.emit("code-update", {
        userId: user?.id,
        projectId,
        ranges,
        content: fullCode
      });
    }, 500),
    [socket, user?.id, projectId]
  );

  /** ✅ Handle error from backend (rollback + re-request locks) */
  useEffect(() => {
    if (!socket) return;
    socket.on("error", ({ message }) => {
      toast.error(message);
      if (editorRef.current) {
        editorRef.current.setValue(lastValidCode); // revert to previous valid code
      }
      // Re-fetch locked lines to restore highlights
      socket.emit("get-locked-lines", { projectId });
    });
    return () => {
      socket.off("error");
    };
  }, [socket, lastValidCode, projectId]);

  /** ✅ On editor mount */
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;

    /** ✅ Prevent editing locked lines in real-time */
    editor.onDidChangeModelContent((e) => {
      const changes = e.changes;
      for (const change of changes) {
        const { range } = change;
        const startLine = range.startLineNumber;
        const endLine = range.endLineNumber;

        if (isLineLocked(startLine, endLine)) {
          toast.error(`You cannot edit locked lines`);
          // Undo user edit immediately
          editor.executeEdits(null, [
            { range, text: "", forceMoveMarkers: true }
          ]);
        }
      }
    });
  };

  /** ✅ Check if line is locked by someone else */
  const isLineLocked = (start: number, end: number): boolean => {
    for (const [uid, ranges] of Object.entries(locks)) {
      if (uid === user?.id) continue; // allow self-lock editing
      for (const range of ranges) {
        const [rStart, rEnd] = range.split("-").map(Number);
        if (!(end < rStart || start > rEnd)) {
          return true; // overlap
        }
      }
    }
    return false;
  };

  /** ✅ On code change */
  const handleChange = (value?: string) => {
    if (!value) return;
    setCode(value);
    debouncedSaveCode(value);
    emitCodeUpdate(value);
  };

  /** ✅ Lock click */
  const handleLockClick = () => {
    if (!editorRef.current || !socket) return;
    const selections = editorRef.current.getSelections();
    if (!selections || selections.length === 0) return;

    const ranges: string[] = selections.map(sel => {
      const start = sel.startLineNumber;
      const end = sel.endLineNumber;
      return `${start}-${end}`;
    });

    socket.emit("lock:request", {
      projectId,
      userId: user?.id,
      ranges,
      type: "manual"
    });
  };

  /** ✅ Unlock click */
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

  /** ✅ Request initial locked lines */
  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit("get-locked-lines", { projectId });
  }, [socket, projectId]);

  /** ✅ Handle lock events */
  useEffect(() => {
    if (!socket) return;

    socket.on("locked-lines", ({ locks }) => {
      const updated: { [key: string]: string[] } = {};
      locks.forEach(({ range, userId }: { range: string; userId: string }) => {
        if (!updated[userId]) updated[userId] = [];
        updated[userId].push(range);
      });
      setLocks(updated);
    });

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

    socket.on("lock:released", ({ range, userId }) => {
      setLocks(prev => {
        const updated = { ...prev };
        if (updated[userId]) {
          updated[userId] = updated[userId].filter(r => r !== range);
          if (updated[userId].length === 0) delete updated[userId];
        }
        return updated;
      });
    });

    socket.on("lock:denied", ({ range, lockedBy }) => {
      toast.error(`Range ${range} locked by another user (${lockedBy})`);
    });

    return () => {
      socket.off("locked-lines");
      socket.off("lock:granted");
      socket.off("lock:released");
      socket.off("lock:denied");
    };
  }, [socket]);

  /** ✅ Handle remote code updates */
  useEffect(() => {
    if (!socket || !roomId || !user) return;
    socket.on("code-update", (data: { content: string; userId: string }) => {
      if (data.userId !== user?.id) {
        setCode(data.content);
        setLastValidCode(data.content);
      }
    });
    socket.on("refetch-permission", () => checkPermission({ roomId, userId: user?.id }));
    return () => {
      socket.off("code-update");
      socket.off("refetch-permission");
    };
  }, [socket, user?.id]);

  /** ✅ Highlight locked ranges */
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
            className: uid === user?.id ? "locked-range-current" : "locked-range-other"
          }
        };
      })
    );

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, decorations);
  }, [locks, user?.id]);

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