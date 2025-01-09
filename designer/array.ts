const code0: number = "A".charCodeAt(0) - 1;
const word_list_path = "./designer/assets/wordlist.txt";

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
}
class ArrayDecoder {
  // combination -> (val -> methods)
  private val: Map<string, Map<number, string[]>>;
  private word_list: Set<string>;

  constructor() {
    this.word_list = new Set();
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
  word(word: string, value: number): string[] {
    const sorted = word.toUpperCase().split("").sort().join("");
    return this.test_decode(sorted, value);
  }
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
  filter(words: string[]): string[] {
    if (this.word_list.size === 0) {
      // read from file
      const list = Deno.readTextFileSync(word_list_path).trim().split("\n").map(
        (s) => s.trim().toUpperCase(),
      );
      this.word_list = new Set(list);
    }
    return words.filter((word) => this.word_list.has(word));
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

Deno.test("Tips.3", () => {
  const decoder = new ArrayDecoder();
  // encode
  const sentence = "Tips are often given in forms of hidden hints.";
  const encrypt = ArrayEncoder.sentence_append(sentence);
  console.log("[Encode]", encrypt);
  // decode
  console.log("[Decode]", decoder.sentence(encrypt));
});

Deno.test("词库测试", () => {
  const decoder = new ArrayDecoder();
  const words = Deno.readTextFileSync(word_list_path).trim().split("\n").map(
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
      console.warn("[Error] Dismatched:", val, strs, "->", list);
    } else {
      console.log("Pass:", val, strs);
    }
  }
});

export { ArrayDecoder, ArrayEncoder };
