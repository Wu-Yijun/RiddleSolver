const word_frequency_path = "./designer/assets/character_frequency.txt";
const nise_code_path = "./designer/assets/nise_code.txt";
const code0: number = "A".charCodeAt(0) - 1;

interface HuffmanNode {
  // the frequency of the node
  freq: number;
  // the characters that the node represents
  chars: number[];
  // left child's frequency is less equal than right child's frequency
  left?: HuffmanNode;
  right?: HuffmanNode;
}

class NiseCode {
  private readonly freq: number[];
  private tree: HuffmanNode;
  private codes: string[];
  constructor(path: string = nise_code_path, type: "freq" | "code" = "code") {
    if (type === "freq") {
      const data = Deno.readTextFileSync(path);
      this.freq = data.trim().split("\n").map((line) =>
        parseFloat(line.trim().split(" ")[1].trim())
      );
      this.tree = this.build();

      const dest: [string, string][] = [];
      this.get_tree(dest);

      this.codes = dest.sort((a, b) => a[0].localeCompare(b[0])).map(
        ([_, code]) => code,
      );
    } else {
      const data = Deno.readTextFileSync(path);
      this.codes = data.trim().split("\n").map((s) => s.trim().split(" ")[1]);
      this.freq = [];
      this.tree = this.build_tree();
    }
  }
  build(): HuffmanNode {
    const nodes: HuffmanNode[] = this.freq.map((freq, index): HuffmanNode => {
      return { freq, chars: [index] };
    });
    function find_least_two(): [number, number] {
      let least = Infinity;
      let second = Infinity;
      let least_index = -1;
      let second_index = -1;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].freq < least) {
          second = least;
          second_index = least_index;
          least = nodes[i].freq;
          least_index = i;
        } else if (nodes[i].freq < second) {
          second = nodes[i].freq;
          second_index = i;
        }
      }
      return [least_index, second_index];
    }
    while (nodes.length > 1) {
      const [left, right] = find_least_two();
      // console.log(left, right);
      const new_node = {
        freq: nodes[left].freq + nodes[right].freq,
        chars: nodes[left].chars.concat(nodes[right].chars),
        left: nodes[left],
        right: nodes[right],
      };
      nodes.splice(Math.max(left, right), 1);
      nodes.splice(Math.min(left, right), 1);
      nodes.push(new_node);
    }
    return nodes[0];
  }
  build_tree(): HuffmanNode {
    const tree: HuffmanNode = { freq: 109, chars: [] };
    function reach_node(code: string, from: HuffmanNode = tree): HuffmanNode {
      if (code.length === 0) {
        return from;
      }
      if (code[0] === "0") {
        if (from.left === undefined) {
          from.left = { freq: from.freq / 2, chars: [] };
        }
        return reach_node(code.slice(1), from.left!);
      } else {
        if (from.right === undefined) {
          from.right = { freq: from.freq / 2, chars: [] };
        }
        return reach_node(code.slice(1), from.right!);
      }
    }
    for (let i = 0; i < 26; i++) {
      reach_node(this.codes[i]).chars.push(i);
    }
    return tree;
  }

  get_tree(
    dest: [string, string][],
    node: HuffmanNode = this.tree,
    pre: string = "",
  ) {
    if (node.left) {
      this.get_tree(dest, node.left, pre + "0");
    }
    if (node.chars.length === 1) {
      dest.push([String.fromCharCode(node.chars[0] + code0 + 1), pre]);
    }
    if (node.right) {
      this.get_tree(dest, node.right, pre + "1");
    }
  }
  print_tree() {
    const dest: [string, string][] = [];
    this.get_tree(dest);
    dest.sort((a, b) => a[0].localeCompare(b[0]));
    console.log(dest);
  }

  binary(code: string): string {
    let res = "";
    let node = this.tree;
    for (let i = 0; i < code.length; i++) {
      if (code[i] !== "0" && code[i] !== "1") {
        return "Invalid(" + code + ")";
      }
      if (code[i] === "0") {
        node = node.left!;
      } else {
        node = node.right!;
      }
      if (node.chars.length === 1) {
        res += String.fromCharCode(node.chars[0] + code0 + 1);
        node = this.tree;
      }
    }
    if (node !== this.tree) {
      res += "[" + String.fromCharCode(...node.chars.map((s) =>
        s + code0 + 1
      )) + "]";
    }
    return res;
  }
  to_binary(num: number | bigint): string {
    if (num > 0) {
      return num.toString(2);
    } else {
      return (-num).toString(2).split("").map((s) => s === "0" ? "1" : "0")
        .join("");
    }
  }
  word(code: number): string {
    return this.binary(this.to_binary(code)).toLowerCase();
  }
  sentence(line: string): string {
    return line.replaceAll(/(?<![0-9+])-?\d+/g, (s) => this.word(parseInt(s)));
  }
  long(long_code: string): string {
    const digit = BigInt(long_code);
    return this.binary(this.to_binary(digit)).toLowerCase();
  }

  encode_char(s: string): string {
    const c = s.charCodeAt(0) - code0 - 1;
    return this.codes[c];
  }
  encode_binary(word: string): string {
    let res = "";
    for (let i = 0; i < word.length; i++) {
      const c = word.charCodeAt(i) - code0 - 1;
      res += this.codes[c];
    }
    return res;
  }

  encode_sentence(line: string): string {
    return line.replaceAll(
      /[a-zA-Z]+/g,
      (s) => this.encode_binary(s.toUpperCase()),
    );
  }
  encode_sentence_dec(line: string): string {
    return line.replaceAll(
      /[a-zA-Z]+/g,
      (s) => {
        const binary = this.encode_binary(s.toUpperCase());
        const is_neg = binary[0] === '0';
        const binary_code = is_neg
          ? binary.split("").map((s) => s === "0" ? "1" : "0").join("")
          : binary;
        const digit = BigInt("0b" + binary_code);
        return is_neg ? "-" + digit.toString() : digit.toString();
      },
    );
  }
  encode_sentence_long(line: string): string {
    const binary = line.toUpperCase().matchAll(/[A-Z]+/g)
      .reduce((acc, match) => acc + this.encode_binary(match[0]), "");
    const is_neg = binary[0] === "0";
    const binary_code = is_neg
      ? binary.split("").map((s) => s === "0" ? "1" : "0").join("")
      : binary;
    const digit = BigInt("0b" + binary_code);
    return is_neg ? "-" + digit.toString() : digit.toString();
  }
}

Deno.test("nise code freq", () => {
  const nise = new NiseCode(word_frequency_path, "freq");
  nise.print_tree();
});

Deno.test("nise code", () => {
  const nise = new NiseCode(nise_code_path, "code");
  nise.print_tree();
  console.log(nise.binary("11110100000000011010"));
  console.log(nise.word(-108357));
  console.log(
    nise.sentence(
      "体育馆一楼: 233175 58242 265251616 -53989 -19807 377683543 96384.",
    ),
  );
  console.log(
    nise.sentence("教学楼: 233175 58242 265251616 -53989 -19807 +401."),
  );
});

export { nise_code_path, NiseCode, word_frequency_path };
