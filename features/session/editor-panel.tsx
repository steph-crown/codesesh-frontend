"use client";

import { useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { debounce } from "@/lib/utils";
import { CODE_RUN_SPECS } from "@/lib/code-run-languages";
import { LANGUAGES } from "./language-selector";

type MonacoEditor = Parameters<OnMount>[0];

type SuggestControllerApi = {
  stopForceRenderingAbove: () => void;
  forceRenderingAbove: () => void;
};

export type EditorPanelHandle = {
  getCode: () => string;
};

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
}

console.log(twoSum([2, 7, 11, 15], 9));
console.log(twoSum([3, 2, 4], 6));`,

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
}

console.log(twoSum([2, 7, 11, 15], 9));
console.log(twoSum([3, 2, 4], 6));`,

  python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
print(two_sum([3, 2, 4], 6))`,

  go: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)

    for i, num := range nums {
        complement := target - num
        if j, ok := seen[complement]; ok {
            return []int{j, i}
        }
        seen[num] = i
    }

    return nil
}

func main() {
    fmt.Println(twoSum([]int{2, 7, 11, 15}, 9))
    fmt.Println(twoSum([]int{3, 2, 4}, 6))
}`,

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
}

fn main() {
    println!("{:?}", two_sum(vec![2, 7, 11, 15], 9));
    println!("{:?}", two_sum(vec![3, 2, 4], 6));
}`,

  cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;

    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }

    return {};
}

int main() {
    vector<int> nums1 = {2, 7, 11, 15};
    auto r1 = twoSum(nums1, 9);
    cout << "[" << r1[0] << ", " << r1[1] << "]" << endl;

    vector<int> nums2 = {3, 2, 4};
    auto r2 = twoSum(nums2, 6);
    cout << "[" << r2[0] << ", " << r2[1] << "]" << endl;

    return 0;
}`,

  c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* result = malloc(2 * sizeof(int));
    *returnSize = 2;

    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }

    *returnSize = 0;
    return result;
}

int main() {
    int nums1[] = {2, 7, 11, 15};
    int size;
    int* r1 = twoSum(nums1, 4, 9, &size);
    printf("[%d, %d]\\n", r1[0], r1[1]);
    free(r1);

    int nums2[] = {3, 2, 4};
    int* r2 = twoSum(nums2, 3, 6, &size);
    printf("[%d, %d]\\n", r2[0], r2[1]);
    free(r2);

    return 0;
}`,

  csharp: `using System;
using System.Collections.Generic;

int[] TwoSum(int[] nums, int target) {
    var seen = new Dictionary<int, int>();

    for (int i = 0; i < nums.Length; i++) {
        int complement = target - nums[i];
        if (seen.ContainsKey(complement)) {
            return new int[] { seen[complement], i };
        }
        seen[nums[i]] = i;
    }

    return Array.Empty<int>();
}

var r1 = TwoSum(new[] { 2, 7, 11, 15 }, 9);
Console.WriteLine($"[{r1[0]}, {r1[1]}]");

var r2 = TwoSum(new[] { 3, 2, 4 }, 6);
Console.WriteLine($"[{r2[0]}, {r2[1]}]");`,

  java: `import java.util.HashMap;
import java.util.Arrays;

class Main {
    public static int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> seen = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }
            seen.put(nums[i], i);
        }

        return new int[] {};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[] {2, 7, 11, 15}, 9)));
        System.out.println(Arrays.toString(twoSum(new int[] {3, 2, 4}, 6)));
    }
}`,

  kotlin: `fun twoSum(nums: IntArray, target: Int): IntArray {
    val seen = mutableMapOf<Int, Int>()

    for (i in nums.indices) {
        val complement = target - nums[i]
        if (complement in seen) {
            return intArrayOf(seen[complement]!!, i)
        }
        seen[nums[i]] = i
    }

    return intArrayOf()
}

fun main() {
    println(twoSum(intArrayOf(2, 7, 11, 15), 9).contentToString())
    println(twoSum(intArrayOf(3, 2, 4), 6).contentToString())
}`,

  swift: `func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
    var seen = [Int: Int]()

    for (i, num) in nums.enumerated() {
        let complement = target - num
        if let j = seen[complement] {
            return [j, i]
        }
        seen[num] = i
    }

    return []
}

print(twoSum([2, 7, 11, 15], 9))
print(twoSum([3, 2, 4], 6))`,

  ruby: `def two_sum(nums, target)
  seen = {}

  nums.each_with_index do |num, i|
    complement = target - num
    if seen.key?(complement)
      return [seen[complement], i]
    end
    seen[num] = i
  end

  []
end

puts two_sum([2, 7, 11, 15], 9).inspect
puts two_sum([3, 2, 4], 6).inspect`,

  php: `<?php

function twoSum(array $nums, int $target): array {
    $seen = [];

    foreach ($nums as $i => $num) {
        $complement = $target - $num;
        if (isset($seen[$complement])) {
            return [$seen[$complement], $i];
        }
        $seen[$num] = $i;
    }

    return [];
}

print_r(twoSum([2, 7, 11, 15], 9));
print_r(twoSum([3, 2, 4], 6));`,

  dart: `List<int> twoSum(List<int> nums, int target) {
  final seen = <int, int>{};

  for (var i = 0; i < nums.length; i++) {
    final complement = target - nums[i];
    if (seen.containsKey(complement)) {
      return [seen[complement]!, i];
    }
    seen[nums[i]] = i;
  }

  return [];
}

void main() {
  print(twoSum([2, 7, 11, 15], 9));
  print(twoSum([3, 2, 4], 6));
}`,

  scala: `object Main {
  def twoSum(nums: Array[Int], target: Int): Array[Int] = {
    val seen = scala.collection.mutable.Map[Int, Int]()

    for (i <- nums.indices) {
      val complement = target - nums(i)
      if (seen.contains(complement)) {
        return Array(seen(complement), i)
      }
      seen(nums(i)) = i
    }

    Array.empty
  }

  def main(args: Array[String]): Unit = {
    println(twoSum(Array(2, 7, 11, 15), 9).mkString("[", ", ", "]"))
    println(twoSum(Array(3, 2, 4), 6).mkString("[", ", ", "]"))
  }
}`,

  elixir: `defmodule TwoSum do
  def solve(nums, target) do
    nums
    |> Enum.with_index()
    |> Enum.reduce_while(%{}, fn {num, i}, seen ->
      complement = target - num
      case Map.get(seen, complement) do
        nil -> {:cont, Map.put(seen, num, i)}
        j -> {:halt, [j, i]}
      end
    end)
  end
end

IO.inspect(TwoSum.solve([2, 7, 11, 15], 9))
IO.inspect(TwoSum.solve([3, 2, 4], 6))`,

  racket: `#lang racket

(define (two-sum nums target)
  (let loop ([lst nums] [i 0] [seen (hash)])
    (cond
      [(null? lst) '()]
      [else
       (let* ([num (car lst)]
              [complement (- target num)])
         (if (hash-has-key? seen complement)
             (list (hash-ref seen complement) i)
             (loop (cdr lst) (+ i 1) (hash-set seen num i))))])))

(displayln (two-sum '(2 7 11 15) 9))
(displayln (two-sum '(3 2 4) 6))`,
};

export type EditorCollaboration = {
  sendContentSet: (content: string) => void;
  setLocalContent: (content: string) => void;
  sendCursorMove?: (line: number, column: number) => void;
  isApplyingRemoteEdit: React.MutableRefObject<boolean>;
};

export const EditorPanel = forwardRef<
  EditorPanelHandle,
  {
    language: string;
    readOnly?: boolean;
    initialContent?: string;
    /** Live sync — controlled document */
    content?: string;
    collaboration?: EditorCollaboration;
  }
>(function EditorPanel(
  { language, readOnly = false, initialContent, content, collaboration },
  ref,
) {
  const editorRef = useRef<MonacoEditor | null>(null);
  const suggestPrefSubRef = useRef<{ dispose: () => void } | null>(null);

  useImperativeHandle(ref, () => ({
    getCode: () => editorRef.current?.getValue() ?? "",
  }));

  const monacoLang =
    LANGUAGES.find((l) => l.id === language)?.monacoId ?? "typescript";

  /** Stable virtual file path so TS/JS language service treats the buffer as one module (avoids ghost TS2393 after remote `setValue`). */
  const modelPath =
    language in CODE_RUN_SPECS
      ? CODE_RUN_SPECS[language as keyof typeof CODE_RUN_SPECS].filename
      : "main.ts";

  const beforeMount = (monaco: Monaco) => {
    const ts = monaco.languages.typescript;
    const commonTs = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      noEmit: true,
      allowNonTsExtensions: true,
      isolatedModules: true,
    };
    ts.typescriptDefaults.setCompilerOptions({
      ...commonTs,
      allowJs: true,
    });
    ts.javascriptDefaults.setCompilerOptions({
      ...commonTs,
      allowJs: true,
    });
  };

  // Live `content` must win over `initialContent`: `session.content` from the first REST load never updates
  // when collaborators edit. Remounting the editor (e.g. language switch) with only `initialContent`
  // would load stale text and could emit `text_change` that overwrites the real session buffer on the server.
  // Empty string from API must show an empty editor — use `??` / explicit undefined checks, not `||`.
  const defaultValue =
    content !== undefined
      ? content
      : initialContent !== undefined
        ? initialContent
        : (DEFAULT_CODE[language] ?? DEFAULT_CODE.typescript);

  const cursorSendRef = useRef(collaboration?.sendCursorMove);
  useEffect(() => {
    cursorSendRef.current = collaboration?.sendCursorMove;
  }, [collaboration?.sendCursorMove]);

  const sendCursorDebounced = useRef(
    debounce((line: number, column: number) => {
      cursorSendRef.current?.(line, column);
    }, 50),
  );

  const sendContentRef = useRef(collaboration?.sendContentSet);
  useEffect(() => {
    sendContentRef.current = collaboration?.sendContentSet;
  }, [collaboration?.sendContentSet]);

  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      suggestPrefSubRef.current?.dispose();
      suggestPrefSubRef.current = null;
      if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
    };
  }, []);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    if (collaboration) {
      const { setLocalContent, isApplyingRemoteEdit } = collaboration;
      editor.onDidChangeModelContent(() => {
        if (isApplyingRemoteEdit.current) return;
        const fullContent = editor.getValue();
        setLocalContent(fullContent);
        if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
        sendTimerRef.current = setTimeout(() => {
          sendTimerRef.current = null;
          sendContentRef.current?.(fullContent);
        }, 50);
      });
      editor.onDidChangeCursorPosition((ev) => {
        sendCursorDebounced.current(ev.position.lineNumber, ev.position.column);
      });
    }

    const applySuggestWidgetPreference = () => {
      const pos = editor.getPosition();
      const ctrl = editor.getContribution(
        "editor.contrib.suggestController",
      ) as SuggestControllerApi | null;
      if (!ctrl || !pos) return;
      // Lines 1–2: prefer below (avoid clipping under session toolbar). Line 3+: prefer above.
      if (pos.lineNumber <= 2) {
        ctrl.stopForceRenderingAbove();
      } else {
        ctrl.forceRenderingAbove();
      }
    };

    suggestPrefSubRef.current?.dispose();
    suggestPrefSubRef.current = editor.onDidChangeCursorPosition(
      applySuggestWidgetPreference,
    );
    applySuggestWidgetPreference();
  };

  useEffect(() => {
    if (content === undefined || !editorRef.current || !collaboration) return;
    const ed = editorRef.current;

    if (ed.getValue() === content) return;

    const { isApplyingRemoteEdit } = collaboration;
    isApplyingRemoteEdit.current = true;

    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current);
      sendTimerRef.current = null;
    }

    try {
      const model = ed.getModel();
      if (model) {
        const fullRange = model.getFullModelRange();
        ed.executeEdits("remote-sync", [
          { range: fullRange, text: content, forceMoveMarkers: true },
        ]);
      } else {
        ed.setValue(content);
      }
    } finally {
      queueMicrotask(() => {
        isApplyingRemoteEdit.current = false;
      });
    }
  }, [content, collaboration]);

  return (
    <div className="size-full overflow-hidden rounded-lg bg-[#1E1E1E]">
      <Editor
        path={modelPath}
        height="100%"
        language={monacoLang}
        defaultValue={defaultValue}
        theme="vs-dark"
        beforeMount={beforeMount}
        onMount={handleMount}
        options={{
          readOnly,
          fixedOverflowWidgets: true,
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
});
