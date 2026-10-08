import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from 'monaco-editor';
import { useCodeEditorStore } from "@/stores/useCodeEditorStore";
import debounce from "lodash.debounce";
import { useUserStore } from "@/stores/userStore";
import { useEditorStore } from "@/stores/editorStore";
import { useSocket } from "@/context/SocketContext";
import { useMutationHook } from "@/hooks/useMutationHook";
import { getCodeApi, saveCodeApi } from "@/apis/projectApi";
import { checkIsEligibleToEditApi } from "@/apis/roomApi";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { defineMonacoThemes } from "../_constants";

export default function EditorPanel({ id: projectId }: { id: string }) {
  const { language, theme, fontSize, setLanguage, reset } = useCodeEditorStore();
  const user = useUserStore((state) => state.user);
  const ownerId = useEditorStore((state) => state.ownerId);
  const roomId = useEditorStore((state) => state.roomId);
  // const projectId = useEditorStore((state) => state.projectId);
  const setContributionEnabled = useEditorStore((state) => state.setContributionEnabled)
  const setEditor = useCodeEditorStore(state => state.setEditor);

  const isContributionEnabled = useEditorStore((state) => state.isContributionEnabled)
  const { socket } = useSocket();

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const addedWidgetIdsRef = useRef<Set<string>>(new Set());
  const initialCodeRef = useRef<string | null>(null);
  const [lastValidCode, setLastValidCode] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(false);

  const [remoteCursors, setRemoteCursors] = useState<{ [userId: string]: { line: number, column: number, name: string, color: string } }>({});
  const isEditableRef = useRef(isEditable);
  const isApplyingRemoteEdit = useRef(false);
  const isInitialLoading = useRef(false);

  /** ✅ API mutations */
  const { mutate: getCode } = useMutationHook(getCodeApi, {
    onSuccess(data) {
      const projectData = data.data.data;
      console.log("project Data: ", projectData)
      const initialCode = projectData.projectCode || "";
      initialCodeRef.current = initialCode;
      setLastValidCode(initialCode);

      if (editorRef.current) {
        isInitialLoading.current = true;
        editorRef.current.setValue(initialCode);
        isInitialLoading.current = false;
      }

      if (projectData.projectLanguage) {
        setLanguage(projectData.projectLanguage);
      }

    },
  });

  const { mutate: checkPermission } = useMutationHook(checkIsEligibleToEditApi, {
    onSuccess(data) {
      setIsEditable(data.data.isAllowed || false);
      setContributionEnabled(true);
    },
    onError(error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      if (err.response?.data?.message === "Room Not found!") {
        setIsEditable(true);
        setContributionEnabled(false);
      } else {
        setIsEditable(false);
        setContributionEnabled(false);
      }
    }
  });

  const { mutate: saveCode } = useMutationHook(saveCodeApi, {
    onSuccess() {
      console.log("Code saved successfully");
    },
  });

  /** ✅ Fetch initial code and permission */
  const fetchInitialData = useCallback(() => {
    if (!projectId || !user) return;

    getCode(projectId);

    if (roomId && user?.id) {
      checkPermission({ roomId, userId: user.id });
    } else {
      setIsEditable(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, roomId, user?.id]);


  /** ✅ Save full code (debounced for DB persistence) */
  const debouncedSaveCode = useMemo(
    () =>
      debounce((updatedCode: string) => {
        if (isContributionEnabled) {
          if (!projectId || user?.id !== ownerId) return;
          saveCode({ code: updatedCode, projectId });
          setLastValidCode(updatedCode);
        } else {
          if (projectId) {
            saveCode({ code: updatedCode, projectId });
          }
          setLastValidCode(updatedCode);
        }
      }, 3000),
    [projectId, saveCode, isContributionEnabled, ownerId, user?.id])

  /** ✅ Handle error from backend */
  useEffect(() => {
    if (!socket) return;
    socket.on("error", (err: any) => {
      const msg = typeof err === "string" ? err : err?.message || "An error occurred";
      toast.error(msg, { id: "socket-error" });
      if (editorRef.current) {
        editorRef.current.setValue(lastValidCode); // revert to previous valid code
      }
    });
    return () => {
      socket.off("error");
    };
  }, [socket, lastValidCode]);

  useEffect(() => {
    isEditableRef.current = isEditable;
  }, [isEditable]);

  /** ✅ On editor mount */
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    setEditor(editor);

    if (initialCodeRef.current !== null) {
      editor.setValue(initialCodeRef.current);
    }

    /** ✅ Handle real-time content changes via code-delta */
    editor.onDidChangeModelContent((e) => {
      // Ignore programmatic remote changes or initial load to prevent loops/duplications
      if (isApplyingRemoteEdit.current || isInitialLoading.current) return;

      const changes = e.changes;
      for (const change of changes) {
        const { range, text } = change;

        // Emit real-time delta change if in a project
        if (socket && projectId && isEditableRef.current) {
          socket.emit("code-delta", {
            userId: user?.id,
            projectId,
            range: {
              startLineNumber: range.startLineNumber,
              startColumn: range.startColumn,
              endLineNumber: range.endLineNumber,
              endColumn: range.endColumn,
            },
            text,
          });
        }
      }

      // Save code to DB (debounced)
      debouncedSaveCode(editor.getValue());
    });

    const cursorListener = editor.onDidChangeCursorPosition((e) => {
      if (!socket || !user?.id) return;
      if (!isEditableRef.current) return;

      socket.emit("cursor-update", {
        projectId,
        userId: user.id,
        position: {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        },
      });
    });

    return () => {
      cursorListener.dispose();
    };
  };

  /** ✅ Remote cursor updates */
  useEffect(() => {
    if (!socket) return;

    socket.on("cursor-update", ({ userId, userName, color, position, line }) => {
      if (userId === user?.id) return;
      const lineNumber = position?.lineNumber ?? line ?? 1;
      const column = position?.column ?? 1;

      setRemoteCursors(prev => ({
        ...prev,
        [userId]: { line: lineNumber, column, name: userName, color }
      }));
    });

    socket.on("cursor-remove", ({ userId }: { userId: string }) => {
      setRemoteCursors(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    return () => {
      socket.off("cursor-update");
      socket.off("cursor-remove");
    };
  }, [socket, user?.id]);

  useEffect(() => {
    if (!editorRef.current || !monaco) return;
    const editor = editorRef.current;

    const decorations = Object.entries(remoteCursors).map(([, { line, column }]) => ({
      range: new monaco.Range(line, column, line, column + 1),
      options: {
        className: "remote-cursor",
        beforeContentClassName: "remote-cursor-label"
      }
    }));

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, decorations);
  }, [remoteCursors]);

  useEffect(() => {
    if (!editorRef.current || !monaco) return;
    const editor = editorRef.current;

    // Remove all previously rendered content widgets
    addedWidgetIdsRef.current.forEach(widgetId => {
      try {
        editor.removeContentWidget({
          getId: () => widgetId,
          getDomNode: () => document.createElement('div'),
          getPosition: () => null
        });
      } catch { }
    });
    addedWidgetIdsRef.current.clear();

    // Add widgets for each current remote cursor
    Object.entries(remoteCursors).forEach(([uid, { line, column, name, color }]) => {
      const widgetId = `cursor-label-${uid}`;
      editor.addContentWidget({
        getId: () => widgetId,
        getDomNode: () => {
          const node = document.createElement('div');
          node.style.background = color;
          node.style.color = '#fff';
          node.style.padding = '2px 6px';
          node.style.borderRadius = '4px';
          node.style.fontSize = '12px';
          node.style.position = 'absolute';
          node.style.zIndex = '10';
          node.style.pointerEvents = 'none';
          node.innerText = name;
          return node;
        },
        getPosition: () => ({
          position: { lineNumber: line, column },
          preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE]
        })
      });
      addedWidgetIdsRef.current.add(widgetId);
    });
  }, [remoteCursors]);

  /** ✅ Handle remote code delta updates (Surgical Edits) */
  useEffect(() => {
    if (!socket || !user) return;

    socket.on("code-delta", (data: { userId: string; range: monaco.IRange; text: string }) => {
      if (data.userId !== user?.id && editorRef.current && monaco) {
        isApplyingRemoteEdit.current = true;
        const editor = editorRef.current;
        const model = editor.getModel();

        if (model) {
          // Temporarily bypass readOnly option if viewer mode is active so Monaco permits executeEdits
          const wasReadOnly = editor.getOption(monaco.editor.EditorOption.readOnly);
          if (wasReadOnly) {
            editor.updateOptions({ readOnly: false });
          }

          editor.executeEdits("remote-user", [
            {
              range: new monaco.Range(
                data.range.startLineNumber,
                data.range.startColumn,
                data.range.endLineNumber,
                data.range.endColumn
              ),
              text: data.text,
              forceMoveMarkers: true // Keeps active cursor in place!
            }
          ]);

          if (wasReadOnly) {
            editor.updateOptions({ readOnly: true });
          }

          const updatedContent = editor.getValue();
          setLastValidCode(updatedContent);

          if (user?.id === ownerId) {
            debouncedSaveCode(updatedContent);
          }
        }

        isApplyingRemoteEdit.current = false;
      }
    });

    // Fallback for full code-update (e.g. initial load or legacy sync)
    socket.on("code-update", (data: { content: string; userId: string }) => {
      if (data.userId !== user?.id && editorRef.current) {
        isApplyingRemoteEdit.current = true;
        editorRef.current.setValue(data.content);
        isApplyingRemoteEdit.current = false;
        setLastValidCode(data.content);

        if (user?.id === ownerId) {
          debouncedSaveCode(data.content);
        }
      }
    });

    return () => {
      socket.off("code-delta");
      socket.off("code-update");
    };
  }, [socket, debouncedSaveCode, ownerId, user]);

  useEffect(() => {
    if (!socket) return;

    const handleRefetchPermission = () => {
      const currentRoomId = useEditorStore.getState().roomId;
      const currentUserId = useUserStore.getState().user?.id;
      if (currentRoomId && currentUserId) {
        console.log("Calling checkPermission with:", { roomId: currentRoomId, userId: currentUserId });
        checkPermission({ roomId: currentRoomId, userId: currentUserId });
      } else {
        console.warn("RoomId or UserId missing when refetch-permission received");
      }
    };

    socket.on("refetch-permission", handleRefetchPermission);

    return () => {
      socket.off("refetch-permission", handleRefetchPermission);
    };
  }, [socket, checkPermission]);

  /** ✅ Initial fetch */
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (projectId) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: !isEditable });
      if (!isEditable && socket && user?.id && projectId) {
        socket.emit("cursor-remove", { projectId, userId: user.id });
      }
    }
  }, [isEditable, socket, user?.id, projectId]);

  return (
    <div className="w-full h-full">
      <Editor
        height="100vh"
        theme={theme}
        language={language}
        beforeMount={(monaco) => defineMonacoThemes(monaco)}
        onMount={handleEditorMount}
        options={{
          readOnly: !isEditable,
          fontSize,
          glyphMargin: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}

