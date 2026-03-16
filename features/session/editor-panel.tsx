"use client";

import { useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { LANGUAGES } from "./language-selector";

type MonacoEditor = Parameters<OnMount>[0];

const DEFAULT_CODE: Record<string, string> = {
  typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }

  return [];
}`,
  javascript: `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}`,
  python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
  rust: `use std::collections::HashMap;

fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut map = HashMap::new();

    for (i, &num) in nums.iter().enumerate() {
        let complement = target - num;
        if let Some(&j) = map.get(&complement) {
            return vec![j as i32, i as i32];
        }
        map.insert(num, i);
    }

    vec![]
}`,
  go: `func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)

    for i, num := range nums {
        complement := target - num
        if j, ok := seen[complement]; ok {
            return []int{j, i}
        }
        seen[num] = i
    }

    return nil
}`,
};

export function EditorPanel({
  language,
  onEditorMount,
}: {
  language: string;
  onEditorMount?: (editor: MonacoEditor) => void;
}) {
  const editorRef = useRef<MonacoEditor | null>(null);

  const monacoLang =
    LANGUAGES.find((l) => l.id === language)?.monacoId ?? "typescript";

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
    onEditorMount?.(editor);
  };

  return (
    <div className="size-full overflow-hidden rounded-lg bg-[#1E1E1E]">
      <Editor
        height="100%"
        language={monacoLang}
        defaultValue={DEFAULT_CODE[language] ?? DEFAULT_CODE.typescript}
        theme="vs-dark"
        onMount={handleMount}
        options={{
          fontSize: 14,
          fontFamily: "var(--font-jetbrains), monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 8,
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          tabSize: 2,
          wordWrap: "off",
          automaticLayout: true,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
}
