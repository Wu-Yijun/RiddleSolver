import { NiseCode } from "./nise-code.ts";

/**
 * returns all maximal cliques in a graph using the Bron-Kerbosch algorithm
 * @param graph adjacency list of the graph
 * @returns  list of maximal cliques
 */
function bron_kerbosch(
  graph: Map<number, Set<number>>,
  R: Set<number> = new Set(),
  P: Set<number> = new Set(graph.keys()),
  X: Set<number> = new Set(),
): Set<number>[] {
  const results: Set<number>[] = [];
  if (P.size === 0 && X.size === 0) {
    // Found a maximal clique, add it to results
    results.push(new Set(R));
    return results;
  }
  // Choose a pivot node to improve performance (this can be optimized)
  const pivot = Array.from(P).concat(Array.from(X)).reduce((maxNode, node) =>
    (graph.get(node)?.size ?? 0) > (graph.get(maxNode)?.size ?? 0)
      ? node
      : maxNode
  );
  // Explore the possible nodes in P that are not adjacent to the pivot
  for (const node of Array.from(P)) {
    if (!graph.get(pivot)?.has(node)) {
      // Recursive call with updated sets
      const newR = new Set(R);
      newR.add(node);
      const newP = new Set(
        [...P].filter((neighbor) => graph.get(node)?.has(neighbor)),
      );
      const newX = new Set(
        [...X].filter((neighbor) => graph.get(node)?.has(neighbor)),
      );
      results.push(...bron_kerbosch(graph, newR, newP, newX));
      P.delete(node);
      X.add(node);
    }
  }

  return results;
}

class EightQueen {
  public readonly size: number;
  private board: boolean[][];
  public readonly valid: boolean[][][];
  public readonly valid_pos: number[][];
  public readonly not_collision: boolean[][];
  constructor(size: number = 8) {
    this.size = size;
    this.board = Array.from({ length: size }, () => Array(size).fill(false));
    this.valid = [];
    this.valid_pos = [];
    for (let i = 0; i < size; i++) {
      this.build(0, i);
    }
    this.not_collision = [];
    for (const board of this.valid) {
      const pos: number[] = Array.from({ length: size });
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (board[i][j]) {
            pos[i] = j;
          }
        }
      }
      this.valid_pos.push(pos);
      const not_collision_line: boolean[] = Array(size).fill(false);
      for (let i = 0; i < this.valid.length; i++) {
        if (this.not_overlap(pos, this.valid[i])) {
          not_collision_line[i] = true;
        }
      }
      this.not_collision.push(not_collision_line);
    }
  }
  check(line: number, pos: number) {
    let left = pos - 1, right = pos + 1;
    for (let i = line - 1; i >= 0; i--, left--, right++) {
      if (this.board[i][pos]) {
        return false;
      }
      if (left >= 0 && this.board[i][left]) {
        return false;
      }
      if (right < this.size && this.board[i][right]) {
        return false;
      }
    }
    return true;
  }
  build(line: number, pos: number) {
    if (line === this.size - 1) {
      this.board[line][pos] = true;
      this.valid.push(this.board.map((row) => row.slice()));
      this.board[line][pos] = false;
      return;
    }
    // console.log(line, pos);
    this.board[line][pos] = true;
    for (let i = 0; i < this.size; i++) {
      if (this.check(line + 1, i)) {
        this.build(line + 1, i);
      }
    }
    this.board[line][pos] = false;
  }
  print(board: boolean[][] = this.board) {
    console.log(
      board.map((row) => row.map((v) => v ? "Q" : ".").join("")).join("\n"),
    );
  }
  clear_board() {
    this.board = Array.from(
      { length: this.size },
      () => Array(this.size).fill(false),
    );
  }
  copy_to_board(board: boolean[][]) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        board[i][j] = this.board[i][j];
      }
    }
  }

  not_overlap(new_pos: number[], board: boolean[][] = this.board): boolean {
    for (let line = 0; line < new_pos.length; line++) {
      if (board[line][new_pos[line]]) {
        return false;
      }
    }
    return true;
  }
  add_pos(new_pos: number[]) {
    for (let line = 0; line < new_pos.length; line++) {
      this.board[line][new_pos[line]] = true;
    }
  }
  remove_pos(new_pos: number[]) {
    for (let line = 0; line < new_pos.length; line++) {
      this.board[line][new_pos[line]] = false;
    }
  }

  not_collide(index: number, collection: number[]): boolean {
    for (const i of collection) {
      if (!this.not_collision[index][i]) {
        return false;
      }
    }
    return true;
  }
  find_non_overlap(
    res: number[][],
    starting: number = 0,
    required_len: number = 6,
    collection: number[] = [],
  ) {
    if (required_len <= 0) {
      res.push(collection.slice());
      // return;
      res[0][0] = Math.max(res[0][0], collection.length);
    }
    for (let i = starting; i < this.valid_pos.length; i++) {
      if (this.not_collide(i, collection)) {
        collection.push(i);
        this.find_non_overlap(res, i + 1, required_len - 1, collection);
        collection.pop();
      }
    }
  }

  find_non_overlap_bk(): number[][] {
    const graph = new Map<number, Set<number>>(
      this.not_collision.map((
        v,
        i,
      ) => [i, new Set(v.map((v, j) => v ? j : -1))]),
    );
    const boards = bron_kerbosch(graph);
    const max_len = boards.reduce((max, v) => Math.max(max, v.size), 0);
    return boards
      .filter((v) => v.size === max_len)
      .map((v) => Array.from(v).sort());
  }
}

function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

class EightQueenCode {
  public readonly size: number;
  public readonly eight_queen: EightQueen;
  private board: number[][];
  private used_len: number;
  private random: () => number;
  // to_index[pattern_index][num/pos] = line
  to_index: number[][];
  // // index_of[line] = [...pattern_index]
  // index_of: number[][];
  constructor(size: number = 8) {
    this.size = size;
    this.eight_queen = new EightQueen(size);
    this.board = Array.from({ length: size }, () => Array(size).fill(0));
    this.to_index = [];
    this.used_len = 0;
    this.uses(1, 41, 50, 90, 13, 78);
    this.random = this.srand(Math.random());
  }
  srand(seed: number | string | []): () => number {
    const [a, b, c, d] = cyrb128(seed.toString());
    return this.random = sfc32(a, b, c, d);
  }
  clear() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.board[i][j] = 0;
      }
      // this.index_of[i] = [];
    }
    this.to_index = Array.from(
      { length: this.used_len + 1 },
      () => Array(this.size).fill(0),
    );
  }
  public uses(...pattern_index: number[]) {
    this.used_len = pattern_index.length;
    this.clear();
    for (let i = 0; i < pattern_index.length; i++) {
      const pos = this.eight_queen.valid_pos[pattern_index[i]];
      for (let line = 0; line < this.size; line++) {
        this.board[line][pos[line]] = i + 1;
        this.to_index[i + 1][pos[line]] = line;
      }
    }
  }

  public print() {
    console.log(
      this.board.map((row) =>
        row.map((v) => v ? String.fromCharCode(v + 64) : ".").join("")
      ).join("\n"),
    );
  }

  to_html_table(): string {
    let res = "<table>\n";
    for (let i = 0; i < this.size; i++) {
      res += "<tr>\n";
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 0) {
          res += `<td></td>\n`;
        } else {
          res += `<td class="b${this.board[i][j]} d${
            this.board[i][j]
          }">${j}</td>\n`;
        }
      }
      res += "</tr>\n";
    }
    res += "</table>";
    return res;
  }

  /**
   * Encode a number to a pattern and position
   * @param line number to encode
   * @returns [pattern_index, pos]
   */
  encode_num(line: number): [number, number] {
    let max_step = 50;
    while (max_step--) {
      const pos = Math.floor(Math.random() * this.size);
      if (this.board[line][pos] != 0) {
        return [this.board[line][pos], pos];
      }
    }
    return [0, line];
  }
  encode_to_html(sentence: string) {
    return "<span>" +
      sentence
        .split(/\s+/g)
        .map((s) =>
          s.replaceAll(/[0-7]/g, (c) => {
            const num = parseInt(c);
            const [pattern, pos] = this.encode_num(num);
            return `<span d${pattern}>${pos}</span>`;
          })
        )
        .join("</span>\n<span>") +
      "</span>";
  }
  decode_from_html(html: string): string {
    return html
      .replaceAll(/<span d(\d)>(\d)<\/span>/g, (_, pattern_index, code) => {
        if (parseInt(pattern_index) === 0) {
          return code;
        }
        const line = this.to_index[parseInt(pattern_index)][parseInt(code)];
        return line.toString();
      })
      .replaceAll(/<span>|<\/span>/g, "")
      .replaceAll(/\s+/g, " ");
  }
}

Deno.test("eight queen number of queens", () => {
  for (let i = 1; i <= 12; i++) {
    const eq = new EightQueen(i);
    console.log("Number of cases of", i, "Queens problem:", eq.valid.length);
  }
});

Deno.test("eight queen match pattern", () => {
  const eq = new EightQueen();
  // we use combination of [1, 41, 50, 90, 13, 78]
  const patterns = [
    [[0, 0], [2, 7], [4, 6], [6, 1]],
    [[0, 3], [2, 4], [4, 5], [6, 2]],
    [[1, 1], [3, 6], [5, 7], [7, 0]],
    [[1, 2], [3, 5], [5, 4], [7, 3]],
    [[2, 1], [3, 7], [6, 3], [7, 5]],
    [[2, 6], [3, 0], [6, 4], [7, 2]],
  ];
  for (const pattern of patterns) {
    console.log("Pattern:", pattern);
    for (let i = 0; i < eq.valid_pos.length; i++) {
      let match = true;
      for (const [line, pos] of pattern) {
        if (eq.valid_pos[i][line] !== pos) {
          match = false;
          break;
        }
      }
      if (match) {
        console.log("pattern index", i);
        // eq.print(eq.valid[i]);
      }
    }
  }
});

Deno.test("eight queen max non overlap", () => {
  const size = 9;
  const eq = new EightQueen(size);
  console.log("Number of cases of", size, "Queens problem:", eq.valid.length);
  const used_board: number[][] = [];
  eq.find_non_overlap(used_board, 0, 7);
  // const used_board = eq.find_non_overlap_bk();
  console.log("Max overlap:", used_board);

  return;
  const codeA = "A".charCodeAt(0);
  for (const used of used_board) {
    const board = Array.from(
      { length: eq.size },
      (_) => Array.from({ length: eq.size }, (_) => "."),
    );
    for (let i = 0; i < used.length; i++) {
      for (let line = 0; line < eq.size; line++) {
        board[line][eq.valid_pos[used[i]][line]] = String.fromCharCode(
          codeA + i,
        );
      }
    }
    console.log(board.map((s) => s.join("")).join("\n"));
    console.log();
  }
});

Deno.test("eight queen code", () => {
  // we use combination of [1, 41, 50, 90, 13, 78]
  const eq = new EightQueenCode(8);
  eq.srand("Queens of Numbers");
  const nise = new NiseCode();

  const code1 =
    "616 / 104 / 2493114 / 8 / -3446220 / 3 / -137 / 8919 / 319030680998.";
  const code2 = "70182 / 778 / 24161952 / 284 / 778 / 381438.";
  const html1 = eq.encode_to_html(code1);
  const html2 = eq.encode_to_html(code2);
  console.log(html1, "\n");
  console.log(html2, "\n");
  const line1 = eq.decode_from_html(html1);
  const line2 = eq.decode_from_html(html2);
  console.log(line1);
  console.log(line2);
  const sentence1 = nise.sentence(line1);
  const sentence2 = nise.sentence(line2);
  console.log();
  console.log(sentence1);
  console.log(sentence2);

  /** HTML1:
<span><span d6>4</span><span d6>3</span><span d2>2</span></span>
<span>/</span>
<span><span d5>4</span><span d2>3</span><span d1>6</span></span>
<span>/</span>
<span><span d6>6</span><span d2>5</span>9<span d2>1</span><span d1>5</span><span d4>2</span><span d1>6</span></span>
<span>/</span>
<span>8</span>
<span>/</span>
<span>-<span d1>2</span><span d4>1</span><span d1>6</span><span d2>2</span><span d3>3</span><span d3>3</span><span d2>3</span></span>
<span>/</span>
<span><span d5>7</span></span>
<span>/</span>
<span>-<span d6>3</span><span d3>6</span><span d5>5</span></span>
<span>/</span>
<span>89<span d2>6</span>9</span>
<span>/</span>
<span><span d4>5</span><span d1>5</span>9<span d6>5</span><span d3>6</span><span d6>5</span><span d4>6</span>8<span d3>4</span>998.</span>
  */
  /** HTML2:
<span><span d3>0</span><span d6>5</span><span d3>1</span>8<span d3>3</span></span>
<span>/</span>
<span><span d6>2</span><span d5>5</span>8</span>
<span>/</span>
<span><span d5>1</span><span d3>2</span><span d6>3</span><span d2>2</span><span d6>3</span>9<span d3>7</span><span d3>3</span></span>
<span>/</span>
<span><span d2>4</span>8<span d1>6</span></span>
<span>/</span>
<span><span d3>0</span><span d6>2</span>8</span>
<span>/</span>
<span><span d2>1</span>8<span d2>6</span><span d6>7</span><span d1>2</span>8.</span>
   */
});

const size = 4;
const eq = new EightQueen(size);
console.log("Number of cases of", size, "Queens problem:", eq.valid.length);
const used_board: number[][] = [[0]];
eq.find_non_overlap(used_board, 0, 2);
console.log("Max overlap group:", used_board[0][0]);
console.log("Overlap layout cases:", used_board.length - 1);
