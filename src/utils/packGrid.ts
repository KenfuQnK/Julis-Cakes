/*
Adapted from react-native-drax src/math.ts at 93fad366a0e2030d7bc6339d23c8ecb443c28d15.
https://github.com/nuclearpasta/react-native-drax/blob/93fad366a0e2030d7bc6339d23c8ecb443c28d15/src/math.ts

MIT License

Copyright (c) 2019-2026 Nuclear Pasta, SRL

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

interface GridItemSpan {
  colSpan: number;
  rowSpan: number;
}

export interface GridPackResult {
  /** Grid position (row, col) for each item, in input order */
  positions: { row: number; col: number }[];
  /** Total number of rows in the packed grid */
  totalRows: number;
}

/**
 * Pack items into a grid with the given number of columns.
 * Items are placed left-to-right, top-to-bottom, filling the first
 * available position where the item's span fits.
 *
 * This is the same algorithm used by mobile home screens: scan cells
 * in reading order and place each item at the first slot that can
 * accommodate its colSpan × rowSpan.
 *
 * @param count Number of items to pack
 * @param numColumns Number of columns in the grid
 * @param getSpan Returns the span for the item at the given index
 */
export function packGrid(
  count: number,
  numColumns: number,
  getSpan: (index: number) => GridItemSpan,
): GridPackResult {
  // Dynamic 2D occupancy grid — rows are added as needed
  const occupied: boolean[][] = [];
  const positions: { row: number; col: number }[] = [];
  let maxRow = 0;
  // An occupied cell never becomes free, so each span can resume its scan.
  const firstCandidateBySpan = new Map<string, number>();

  function ensureRow(row: number) {
    while (occupied.length <= row) {
      occupied.push(new Array<boolean>(numColumns).fill(false));
    }
  }

  function isAvailable(
    row: number,
    col: number,
    cs: number,
    rs: number,
  ): boolean {
    if (col + cs > numColumns) return false;
    for (let r = row; r < row + rs; r++) {
      ensureRow(r);
      for (let c = col; c < col + cs; c++) {
        if (occupied[r]![c]) return false;
      }
    }
    return true;
  }

  function markOccupied(row: number, col: number, cs: number, rs: number) {
    for (let r = row; r < row + rs; r++) {
      ensureRow(r);
      for (let c = col; c < col + cs; c++) {
        occupied[r]![c] = true;
      }
    }
    maxRow = Math.max(maxRow, row + rs - 1);
  }

  for (let i = 0; i < count; i++) {
    const span = getSpan(i);
    const cs = Math.max(1, Math.min(span.colSpan, numColumns));
    const rs = Math.max(1, span.rowSpan);
    const spanKey = cs + ":" + rs;
    const firstCandidate = firstCandidateBySpan.get(spanKey) ?? 0;
    let placed = false;
    for (let r = firstCandidate; !placed; r++) {
      ensureRow(r);
      for (let c = 0; c <= numColumns - cs; c++) {
        if (isAvailable(r, c, cs, rs)) {
          markOccupied(r, c, cs, rs);
          positions.push({ row: r, col: c });
          firstCandidateBySpan.set(spanKey, r);
          placed = true;
          break;
        }
      }
    }
  }

  return { positions, totalRows: count > 0 ? maxRow + 1 : 0 };
}
