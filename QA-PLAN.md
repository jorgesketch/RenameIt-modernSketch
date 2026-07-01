# Rename It — QA Test Plan (v4.7.0, nested frames)

Manual test plan to run in Sketch. Check each box as you go and jot anything odd in **Notes**.

**Priorities:** 🔴 P0 = must pass before release · 🟡 P1 = important · ⚪️ P2 = nice to check.

Two big areas this version touches:
1. **New:** renaming *nested* frames / graphics / stacks (Section B & C).
2. **Regression:** the rename engine was re-implemented locally (vendored), so all the existing keywords must still behave exactly as before (Section D & E).

---

## 0. Setup

- [ ] Note your Sketch version here: `__________` (needs a modern version with Frames).
- [ ] Install the plugin: double-click `Rename-It.sketchplugin` (accept "replace" if prompted).
- [ ] Restart Sketch (clean slate).
- [ ] Confirm **Plugins → Rename It** shows: *Rename Selected Layers*, *Rename Selected Frames*, *Find and Replace…*, *Settings*, *Donate*.

### Build a test document

Create one page ("QA") containing all of the following, so the later tests have something to act on:

- [ ] **T1** — a plain frame with 3 plain layers inside (rectangle, text, oval).
- [ ] **T2** — a frame that contains **3 nested frames**, and each nested frame contains 1–2 layers.
- [ ] **T3** — a frame nested **3+ levels deep** (frame → frame → frame → frame).
- [ ] **T4** — a frame containing a **Graphic** and a **Stack** (auto-layout) side by side.
- [ ] **T5** — a **Stack** that itself contains 2 nested frames.
- [ ] **T6** — a **Symbol Master** on the page, plus one **Symbol Instance**.
- [ ] **T7** — a layer with a shared **Layer Style** applied.
- [ ] **T8** — several plain **groups** (not frames) with layers, to confirm groups are NOT treated as frames.

---

## A. Smoke test 🔴

- [ ] **A1** Each of the 4 command windows opens without an error/red banner.
- [ ] **A2** The Rename window shows the Keywords panel with all buttons.
- [ ] **A3** Typing a name shows a live **Preview** that updates as you type.
- [ ] **A4** Pressing **Esc** closes the window; clicking Rename closes it and shows the "N Layers renamed" toast.

---

## B. Nested frames — the new feature 🔴

For each: select as described, run **Rename Selected Frames**, type `qa-%N` (start from 1), Rename.

- [ ] **B1** Select **T2** (the parent frame only). → The parent **and all 3 nested frames** are renamed `qa-1`, `qa-2`, `qa-3`, `qa-4` (4 total). Plain layers inside are **not** renamed.
- [ ] **B2** Select **T3** (deep nest, outer frame only). → Every frame down the chain is renamed (count them: should equal the nesting depth).
- [ ] **B3** Select **T4**'s parent. → The Graphic **and** the Stack are both renamed (graphics & stacks count as frames).
- [ ] **B4** Select **T5** (a stack containing frames). → The stack and its 2 nested frames are all renamed.
- [ ] **B5** Select **two** top-level frames at once (T1 + T2). → Both, plus T2's nested frames, are renamed; numbering is continuous with no gaps/duplicates.
- [ ] **B6** Select a **plain layer inside** T2 (not the frame). → Its enclosing frame (and that frame's nested frames) are renamed. *(Confirms the "select an inner layer" path still resolves to the frame.)*
- [ ] **B7** **Dedup check:** select T2's parent **and** one of its nested frames at the same time, then rename. → Each frame is renamed **exactly once** (no frame renamed twice, no skipped numbers).
- [ ] **B8** Select a plain **group** from T8 (no frame anywhere in its ancestry). → It is **not** renamed (or you get the "select a frame" message) — groups are not frames.

---

## C. Stacks keep their name 🔴

This verifies the `nameIsFixed` fix (a stack normally auto-renames itself when it re-lays out).

- [ ] **C1** Select the Stack in **T4**, rename it to `MyStack`. → Name becomes `MyStack`.
- [ ] **C2** Now change the stack so it re-lays out — e.g. **add a new layer into it**, or nudge its direction/spacing in the inspector.
- [ ] **C3** → The stack is **still named `MyStack`** (it did **not** revert to an auto name like "Stack" / "Group"). 🔴
- [ ] **C4** Repeat C1–C3 for a **nested** stack (inside T5).

---

## D. Rename keywords — regression 🔴

Because the rename engine was re-implemented, verify each keyword produces the expected name. Use **Rename Selected Layers** on plain layers (T1) unless noted. Set "start from" = 1 where relevant.

Select 3 layers for the sequence tests.

- [ ] **D1** `%*` → each layer keeps its **current name** unchanged.
- [ ] **D2** `%*u%` → current name in **UPPERCASE**.
- [ ] **D3** `%*l%` → **lowercase**.
- [ ] **D4** `%*t%` → **Title Case**.
- [ ] **D5** `%*uf%` → **Upper first** (first letter capitalized, rest unchanged).
- [ ] **D6** `%*c%` → **camelCase** (spaces removed).
- [ ] **D7** `item-%N` → `item-1`, `item-2`, `item-3` (ascending).
- [ ] **D8** `item-%n` → `item-3`, `item-2`, `item-1` (descending).
- [ ] **D9** `item-%NN` → `item-01`, `item-02`, `item-03` (zero-padded).
- [ ] **D10** `item-%A` → `item-A`, `item-B`, `item-C` (alphabet).
- [ ] **D11** `%w × %h` → each layer's **width × height** in px.
- [ ] **D12** `%p` → the **page name** ("QA").
- [ ] **D13** `%o` → the **parent** frame/group name.
- [ ] **D14** `%s` on the **Symbol Instance** (T6) → the **symbol's name**. *(Button is disabled if selection has no symbol — that's expected.)*
- [ ] **D15** `%ls%` on the **styled layer** (T7) → the **layer style name**. *(Disabled if no styled layer selected.)*
- [ ] **D16** `%ch%` on a frame/group that has children → a **child layer's name**. *(Disabled if no child.)*
- [ ] **D17** Combined: `%N — %* (%w×%h)` → e.g. `1 — Rectangle (120×40)`.
- [ ] **D18** Change **start from** to 10 with `%N` → numbering starts at 10.
- [ ] **D19** In **Settings**, switch sequence type to **Position (X)** then **Position (Y)**; re-run `%N` → numbering follows layer position order accordingly.

---

## E. Find & Replace — regression 🟡

Use **Find and Replace…** on layers named things like `btn-primary`, `btn-secondary`.

- [ ] **E1** Find `btn` → Replace `button` → both become `button-…`.
- [ ] **E2** **Case sensitive OFF**: find `BTN` still matches `btn`.
- [ ] **E3** **Case sensitive ON**: find `BTN` does **not** match `btn` (no change).
- [ ] **E4** Special chars: name a layer `a.b.c`, find `.` → replace `-`. → `a-b-c` (the `.` is matched literally, not as "any char").
- [ ] **E5** Scope **Selection** vs **Page** (if offered) behaves as labeled.

---

## F. Existing behavior — non-regression 🟡

- [ ] **F1** **Rename Selected Layers** on ordinary layers works exactly as before.
- [ ] **F2** Renaming a **top-level frame** (select the frame, Rename Selected Frames) still works (this was the old behavior).
- [ ] **F3** **Undo (⌘Z)** after a rename reverts the names. Note whether it's one undo step or several: `__________`.
- [ ] **F4** **Rename history** dropdown remembers recent rename strings.

---

## G. Edge cases ⚪️

- [ ] **G1** Run **Rename Selected Frames** with **nothing selected** → friendly message, no crash.
- [ ] **G2** Very **large** selection (e.g. 100+ nested frames) → completes in reasonable time, no hang.
- [ ] **G3** Frame names containing spaces / emoji / non-Latin characters rename correctly.
- [ ] **G4** Run a rename, then run it again immediately → no leftover/duplicate windows (window teardown).
- [ ] **G5** Rename **across two pages** in one session (switch page, rename again) → page name `%p` reflects the current page.

---

## H. Sign-off

- [ ] All 🔴 P0 items pass.
- [ ] Any failures logged below with steps to reproduce.

| # | Test | Result (Pass/Fail) | Notes |
|---|------|--------------------|-------|
|   |      |                    |       |

**Tester:** ______________  **Date:** ____________  **Sketch version:** ____________
