import React, { useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { useCodeEditorStore } from "@/stores/useCodeEditorStore";
import debounce from "lodash.debounce"
import { useMutationHook } from "@/hooks/useMutationHook";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getCodeApi, saveCodeApi } from "@/apis/projectApi";

const EditorPanel = () => {
  const params = useParams()
  const id = params.id
  const { language, theme, fontSize, editor, setFontSize, setEditor } =
    useCodeEditorStore();

  const { mutate } = useMutationHook(saveCodeApi)

  const debouncedSaveCode = debounce((value: string) => {
    if (value) {
      mutate({ projectId: params.id, code: value })
    }
  }, 3000);

  const fetchCode = async () => {
    try {
      const code = await getCodeApi(id as string);
      if (editor && code.data) {
        editor.setValue(code.data.projectCode);
      }
    } catch (error) {
      toast.error(error.message || "Errro while getting code!")
    }
  };

  useEffect(() => {
    if (id && editor) {
      fetchCode();
    }
  }, [id, editor]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      debouncedSaveCode(value);
    }
  };


  return (
    <div className="relative h-screen">
      {/* Editor */}
      <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
        <Editor
          height="570px"
          language={LANGUAGE_CONFIG[language].monacoLanguage}
          onChange={handleEditorChange}
          theme={theme}
          beforeMount={defineMonacoThemes}
          onMount={(editor) => setEditor(editor)}
          options={{
            minimap: { enabled: false },
            fontSize,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            renderWhitespace: "selection",
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            fontLigatures: true,
            cursorBlinking: "smooth",
            smoothScrolling: true,
            contextmenu: true,
            renderLineHighlight: "all",
            lineHeight: 1.6,
            letterSpacing: 0.5,
            roundedSelection: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;
