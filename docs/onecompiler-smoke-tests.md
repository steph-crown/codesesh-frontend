# OneCompiler / Run button — manual smoke tests

Use these snippets in CodeSesh with `**ONECOMPILER_API_KEY**` set. Each program computes  
**∑(1…10) = 55** in a slightly non-trivial way (loop + arithmetic).

**Expected stdout** (trim trailing whitespace when comparing):

```text
55
```

(Some runtimes omit a final newline in the UI; that’s fine if the terminal shows `55`.)

---

## TypeScript (`main.ts`)

```typescript
function sumRange(a: number, b: number): number {
  let s = 0;
  for (let i = a; i <= b; i++) s += i;
  return s;
}
console.log(sumRange(1, 10));
```

---

## JavaScript (`main.js`)

```javascript
function sumRange(a, b) {
  let s = 0;
  for (let i = a; i <= b; i++) s += i;
  return s;
}
console.log(sumRange(1, 10));
```

---

## Python (`main.py`)

```python
def sum_range(a: int, b: int) -> int:
    return sum(range(a, b + 1))

print(sum_range(1, 10))
```

---

## Go (`main.go`)

```go
package main

import "fmt"

func sumRange(a, b int) int {
	s := 0
	for i := a; i <= b; i++ {
		s += i
	}
	return s
}

func main() {
	fmt.Println(sumRange(1, 10))
}
```

---

## Rust (`main.rs`)

```rust
fn sum_range(a: i32, b: i32) -> i32 {
    (a..=b).sum()
}

fn main() {
    println!("{}", sum_range(1, 10));
}
```

---

## C++ (`main.cpp`)

```cpp
#include <iostream>

int sum_range(int a, int b) {
  int s = 0;
  for (int i = a; i <= b; i++) s += i;
  return s;
}

int main() {
  std::cout << sum_range(1, 10) << std::endl;
  return 0;
}
```

---

## C (`main.c`)

```c
#include <stdio.h>

int sum_range(int a, int b) {
  int s = 0;
  int i;
  for (i = a; i <= b; i++) s += i;
  return s;
}

int main(void) {
  printf("%d\n", sum_range(1, 10));
  return 0;
}
```

---

## C# (`Program.cs`)

```csharp
using System;

class Program {
  static int SumRange(int a, int b) {
    int s = 0;
    for (int i = a; i <= b; i++) s += i;
    return s;
  }
  static void Main() {
    Console.WriteLine(SumRange(1, 10));
  }
}
```

---

## Java (`Main.java`)

```java
public class Main {
  static int sumRange(int a, int b) {
    int s = 0;
    for (int i = a; i <= b; i++) s += i;
    return s;
  }
  public static void main(String[] args) {
    System.out.println(sumRange(1, 10));
  }
}
```

---

## Kotlin (`main.kt`)

```kotlin
fun sumRange(a: Int, b: Int): Int {
    var s = 0
    for (i in a..b) s += i
    return s
}

fun main() {
    println(sumRange(1, 10))
}
```

---

## Swift (`main.swift`)

```swift
func sumRange(_ a: Int, _ b: Int) -> Int {
    var s = 0
    for i in a...b { s += i }
    return s
}
print(sumRange(1, 10))
```

---

## Ruby (`main.rb`)

```ruby
def sum_range(a, b)
  (a..b).sum
end

puts sum_range(1, 10)
```

---

## PHP (`main.php`)

```php
<?php
function sum_range(int $a, int $b): int {
    $s = 0;
    for ($i = $a; $i <= $b; $i++) {
        $s += $i;
    }
    return $s;
}
echo sum_range(1, 10);
```

---

## Dart (`main.dart`)

```dart
int sumRange(int a, int b) {
  int s = 0;
  for (int i = a; i <= b; i++) {
    s += i;
  }
  return s;
}

void main() {
  print(sumRange(1, 10));
}
```

---

## Scala (`Main.scala`)

```scala
object Main extends App {
  def sumRange(a: Int, b: Int): Int = (a to b).sum
  println(sumRange(1, 10))
}
```

---

## Elixir (`main.exs`)

```elixir
sum_range = fn a, b -> Enum.sum(a..b) end
IO.puts(sum_range.(1, 10))
```

---

## Racket (`main.rkt`)

```racket
#lang racket

(define (sum-range a b)
  (for/sum ([i (in-range a (add1 b))]) i))

(display (sum-range 1 10))
(newline)
```

---

## Checklist


| #   | Language   | Expected stdout |
| --- | ---------- | --------------- |
| 1   | TypeScript | `55`            |
| 2   | JavaScript | `55`            |
| 3   | Python     | `55`            |
| 4   | Go         | `55`            |
| 5   | Rust       | `55`            |
| 6   | C++        | `55`            |
| 7   | C          | `55`            |
| 8   | C#         | `55`            |
| 9   | Java       | `55`            |
| 10  | Kotlin     | `55`            |
| 11  | Swift      | `55`            |
| 12  | Ruby       | `55`            |
| 13  | PHP        | `55`            |
| 14  | Dart       | `55`            |
| 15  | Scala      | `55`            |
| 16  | Elixir     | `55`            |
| 17  | Racket     | `55`            |


If any language fails, compare the **filename** and **entrypoint** rules in `lib/code-run-languages.ts` with [OneCompiler](https://onecompiler.com/apis/code-execution).