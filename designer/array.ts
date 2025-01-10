const code0: number = "A".charCodeAt(0) - 1;
const word_list_path = [
  "./designer/assets/word_list.txt",
  "./designer/assets/CollinsScrabbleWords.txt",
];

class ArrayEncoder {
  static encode(word: string): string {
    return word.split("").sort((a, b) =>
      a.toUpperCase().charCodeAt(0) - b.toUpperCase().charCodeAt(0)
    ).join("");
  }
  static word(word: string): number {
    let code = 0;
    for (let i = 0; i < word.length; i++) {
      // console.log(word.charCodeAt(i) - ArrayCode.code0, i + 1);
      code += (word.charCodeAt(i) - code0) * (i + 1);
    }
    return code;
  }
  static sentence(sentence: string): number[] {
    const arrays = sentence.split(/[^a-zA-Z]/g).filter((s) => s.length > 0);
    // console.log(arrays);
    return arrays.map((s) => ArrayEncoder.word(s.toUpperCase()));
  }
  static sentence_append(sentence: string): string {
    const regex = /([a-zA-Z]+)/g;
    let match;
    let res = "";
    let pos = 0;
    while ((match = regex.exec(sentence)) !== null) {
      res += sentence.slice(pos, match.index);
      pos = match.index + match[0].length;
      const word = match[1];
      res += ArrayEncoder.encode(word) + "(" +
        ArrayEncoder.word(word.toUpperCase()) + ")";
    }
    res += sentence.slice(pos);
    return res;
  }

  static to_code(word: string): number[] {
    return word.split("").map((s) => s.charCodeAt(0) - code0);
  }
  static from_code(code: number[]): string {
    return code.map((i) => String.fromCodePoint(i + code0)).join("");
  }
}
class ArrayDecoder {
  // combination -> (val -> methods)
  private val: Map<string, Map<number, string[]>>;
  private word_list: Set<string>;
  private word_trait_list: Map<string, string[]>;

  constructor() {
    this.word_list = new Set();
    this.word_trait_list = new Map();
    const val: [string, Map<number, string[]>][] = [];
    for (let i0 = 1; i0 <= 26; i0++) {
      for (let i1 = i0; i1 <= 26; i1++) {
        const str2 = String.fromCodePoint(i0 + code0, i1 + code0);
        const map2 = new Map<number, string[]>();
        map2.set(i0 + 2 * i1, [str2]);
        map2.set(i1 + 2 * i0, [String.fromCodePoint(i1 + code0, i0 + code0)]);
        val.push([str2, map2]);
      }
    }
    this.val = new Map(val);
    for (let i = 1; i <= 26; i++) {
      const str = String.fromCodePoint(i + code0);
      const map = new Map<number, string[]>();
      map.set(i, [str]);
      this.val.set(str, map);
    }
    for (const [str, maps] of val) {
      const i0 = str.charCodeAt(0) - code0;
      const i1 = str.charCodeAt(1) - code0; // i0 <= i1
      const key_code = [0 + code0, i0 + code0, i1 + code0];
      for (let i = 1; i <= 26; i++) {
        if (i <= i0) {
          key_code[0] = i + code0;
        } else if (i <= i1) {
          key_code[1] = i + code0;
        } else {
          key_code[2] = i + code0;
        }
        const key = String.fromCodePoint(...key_code);
        if (!this.val.has(key)) {
          this.val.set(key, new Map());
        }
        const map = this.val.get(key)!;
        for (const [val, strs] of maps) {
          const num = val + i * 3;
          if (!map.has(num)) {
            map.set(num, []);
          }
          map.get(num)!.push(
            ...strs.map((s) => s + String.fromCodePoint(i + code0)),
          );
        }
      }
    }
  }
  /**
   * Decode all possible word.
   * @param word a single **UPPERCASE** word to decode
   * @param value the value of the encode
   * @returns the possible word list with the same alphabetic combination and code.
   */
  word(word: string, value: number): string[] {
    const sorted = word.toUpperCase().split("").sort().join("");
    return this.test_decode(sorted, value);
  }
  /**
   * decode all codes in a sentence with words in dictionary.
   * @param sentence An encoded sentence with forms of `word(code)` to decode.
   * @returns The decoded sentence.
   */
  sentence(sentence: string): string {
    const line = sentence.toUpperCase();
    const regex = /([A-Z]+)\(([0-9]+)\)/g;
    let match;
    let res = "";
    let pos = 0;
    while ((match = regex.exec(line)) !== null) {
      // console.log(match);
      res += sentence.slice(pos, match.index);
      pos = match.index + match[0].length;
      const word = match[1];
      const val = parseInt(match[2]);
      const decode = this.filter(this.word(word, val)).map((s) =>
        s.toLowerCase()
      );
      if (decode.length == 1) {
        res += decode[0];
      } else {
        res += "[" + decode.toString() + "]";
      }
    }
    res += line.slice(pos);
    return res;
  }
  // value is the sum of the word to match
  // word is a array of increasing char code
  private test_decode(word: string, value: number): string[] {
    if (word.length <= 3) {
      // console.log("+", word, value);
      return this.val.get(word)!.get(value) || [];
    }
    if (!this.val.has(word)) {
      this.val.set(word, new Map());
    } else if (this.val.get(word)!.has(value)) {
      // console.log(".", word, value);
      return this.val.get(word)!.get(value)!;
    }
    // calculate the value
    const result: string[] = [];
    for (let i = 0; i < word.length; i++) {
      if (word[i] === word[i + 1]) continue;
      const val = value - (word.charCodeAt(i) - code0) * word.length;
      if (val < 0) break;
      const remain = word.slice(0, i) + word.slice(i + 1);
      const strs = this.test_decode(remain, val).map((s) => s + word[i]);
      result.push(...strs);
    }
    this.val.get(word)!.set(value, result);
    // console.log(word, value, result.length);
    return result;
  }
  public read_words(index: number = 0) {
    // read from file
    const list = Deno.readTextFileSync(word_list_path[index]).trim().split("\n")
      .map(
        (s) => s.trim().toUpperCase(),
      );
    this.word_list = new Set(list);
  }

  private build_word_traits() {
    if (this.word_list.size === 0) {
      this.read_words();
    }
    for (const word of this.word_list) {
      const code = ArrayEncoder.word(word);
      const key = "(" + code + "," + word.length + ")";
      if (this.word_trait_list.has(key)) {
        this.word_trait_list.get(key)!.push(word);
      } else {
        this.word_trait_list.set(key, [word]);
      }
    }
  }
  filter(words: string[]): string[] {
    if (this.word_list.size === 0) {
      this.read_words();
    }
    // console.log(words);
    return words.filter((word) => this.word_list.has(word));
  }
  secondary(primary: string): string {
    // {Taaghiilnorrssy: (139,4) (47,2) (112,4) (220,5)}.
    const regex1 = /\{([A-Z]+)\:((\s?\([0-9]+,\s?[0-9]+\))+)\}/g;
    const regex2 = /\(([0-9]+),\s?([0-9]+)\)/g;
    let match1, match2;
    const line = primary.toUpperCase();

    let res = "";
    let pos = 0;
    while ((match1 = regex1.exec(line)) !== null) {
      console.log(match1);
      res += primary.slice(pos, match1.index);
      const words = match1[1];
      pos += match1[0].length;

      let offset = 0;
      const decoded: string[] = [];
      while ((match2 = regex2.exec(match1[2])) !== null) {
        const val = parseInt(match2[1]);
        const len = parseInt(match2[2]);
        const word = words.slice(offset, offset + len);
        console.log(val, len, word);
        offset += len;
        const w = this.filter(this.word(word, val));
        if (w.length == 1) {
          decoded.push(w[0]);
        } else {
          decoded.push("[" + w.toString() + "]");
        }
      }
      res += decoded.join(" ");
    }
    res += primary.slice(pos);
    return res;
  }
  search_dict(primary: string): string {
    // {Taaghiilnorrssy: (139,4) (47,2) (112,4) (220,5)}.
    if (this.word_trait_list.size === 0) {
      this.build_word_traits();
    }

    const regex1 = /\{([A-Z]+)\:((\s?\([0-9]+,\s?[0-9]+\))+)\}/g;
    const regex2 = /\(([0-9]+),\s?([0-9]+)\)/g;
    let match1, match2;
    const line = primary.toUpperCase();

    let res = "";
    let pos = 0;
    while ((match1 = regex1.exec(line)) !== null) {
      // console.log(match1);
      res += primary.slice(pos, match1.index);
      const words = match1[1];
      pos = match1.index + match1[0].length;

      // let offset = 0;
      const candidate: number[][][] = [];
      while ((match2 = regex2.exec(match1[2])) !== null) {
        const val = parseInt(match2[1]);
        const len = parseInt(match2[2]);
        // const word = words.slice(offset, offset + len);
        // offset += len;

        const key = "(" + val + "," + len + ")";
        const possible = this.word_trait_list.get(key);
        // console.log(val, len, possible);
        if (possible !== undefined) {
          candidate.push(possible.map((s) => ArrayEncoder.to_code(s)));
        } else {
          candidate.push([]);
        }
      }
      const target = Array.from({ length: 26 }, (_v, _k) => 0);
      for (let i = 0; i < words.length; i++) {
        target[words.charCodeAt(i) - code0 - 1]++;
      }
      const sentences = this.search_dict_combination(candidate, target);
      // console.log(candidate, target);
      // console.log(sentences);
      if (sentences.length === 1) {
        res += sentences[0].map((a) => ArrayEncoder.from_code(a).toLowerCase())
          .join(" ");
      } else {
        res += "[" + sentences.map((s) =>
          s.map((a) =>
            ArrayEncoder.from_code(a).toLowerCase()
          ).join(" ")
        ).join(",") + "]";
      }
    }
    res += primary.slice(pos);
    return res;
  }

  private search_dict_combination(
    candidate: number[][][],
    target: number[],
  ): number[][][] {
    if (candidate.length < 1) {
      return [[]];
    }
    // console.log(candidate.length, target.join(""));

    const res: number[][][] = [];
    for (const c of candidate[0]) {
      const target_copy = target.slice();
      let valid = true;
      for (const i of c) {
        if (--target_copy[i - 1] < 0) {
          valid = false;
          break;
        }
      }
      if (!valid) {
        continue;
      }
      const next = this.search_dict_combination(
        candidate.slice(1),
        target_copy,
      );
      for (const n of next) {
        res.push([c, ...n]);
      }
    }
    return res;
  }

  word_len(): number {
    return this.word_list.size;
  }

  public is_word(word: string): boolean {
    return this.word_list.has(word.toUpperCase());
  }
}

Deno.test("1. 找规律", () => {
  const words = ["APPLE", "BOY", "CAT", "DOG"];
  const decoder = new ArrayDecoder();
  for (const word of words) {
    // encode
    const code = ArrayEncoder.word(word);
    console.log("[Encode]", ArrayEncoder.encode(word), code);
    // decode
    console.log("[Decode]", code, decoder.word(word, code));
    console.log("[Decode]", code, decoder.filter(decoder.word(word, code)));
  }
});

Deno.test("2. 实际运用", () => {
  const decoder = new ArrayDecoder();
  // encode
  const sentence = "Check the fire tap container nearby.";
  const encrypt = ArrayEncoder.sentence_append(sentence);
  console.log("[Encode]", encrypt);
  // decode
  console.log("[Decode]", decoder.sentence(encrypt));
});

Deno.test("3. 灵活运用", () => {
  const decoder = new ArrayDecoder();
  // encode
  const sentence = "Inside locked stairs and on top floor.";
  const encrypt = ArrayEncoder.sentence_append(sentence);
  console.log("[Encode]", encrypt);
  // decode
  console.log("[Decode]", decoder.sentence(encrypt));
});

Deno.test("01:Tips.3", () => {
  const decoder = new ArrayDecoder();
  // encode
  const sentence = "Tips are often given in forms of hidden hints.";
  const encrypt = ArrayEncoder.sentence_append(sentence);
  console.log("[Encode]", encrypt);
  // decode
  console.log("[Decode]", decoder.sentence(encrypt));
});

Deno.test("02:Tips.3", () => {
  const decoder = new ArrayDecoder();
  decoder.read_words(1);
  console.log(`All ${decoder.word_len()} words loaded.`);
  const encrypt =
    "{Taaghiilnorrssy: (139,4) (47,2) (112,4) (220,5)}.\n{Ycdddeehiioopsttu: (118,3) (161,7) (139,4) (86,3)}.";
  // decode
  console.log("[Decode]", decoder.search_dict(encrypt).replaceAll("\n", "\\n"));
});

Deno.test("词库测试", () => {
  const decoder = new ArrayDecoder();
  const words = Deno.readTextFileSync(word_list_path[0]).trim().split("\n").map(
    (s) => s.trim().toUpperCase(),
  );
  const map = new Map<string, [number, string[]]>();
  for (const word of words) {
    const val = ArrayEncoder.word(word);
    const key = val + word.split("").sort().join("");
    if (!map.has(key)) {
      map.set(key, [val, [word]]);
    } else {
      map.get(key)![1].push(word);
    }
  }
  for (const [_key, [val, strs]] of map) {
    if (strs.length === 1) continue;
    const list = decoder.filter(decoder.word(strs[0], val));
    if (
      list.length !== strs.length ||
      list.filter((s) => !strs.includes(s)).length > 0
    ) {
      // not equal
      console.warn("[Error] Unmatched:", val, strs, "->", list);
    } else {
      console.log("Pass:", val, strs);
    }
  }
});

export { ArrayDecoder, ArrayEncoder };
