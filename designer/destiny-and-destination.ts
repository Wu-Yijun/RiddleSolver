import { NiziCode } from "./nizi-code.ts";

const hexagram_path = "./designer/assets/hexagram.txt";
const hexagram_post_path = "./designer/assets/hexagram-post.txt";

class Hexagram {
  public readonly hexagrams: string[];
  private readonly to_binary: Map<string, string>;
  private readonly to_hexagram: Map<string, string>;
  constructor(path: string = hexagram_path) {
    this.hexagrams = Deno.readTextFileSync(path).trim().split("\n").map((x) =>
      x.trim().split(" ")[2]
    );
    this.to_binary = new Map();
    this.to_hexagram = new Map();
    for (let i = 0; i < this.hexagrams.length; i++) {
      // let binary = ((i + 1) % 64).toString(2).padStart(6, "0");
      let binary = i.toString(2).padStart(6, "0");
      binary = binary.split("").map((x) => x === "0" ? "1" : "0").join("");
      // binary = binary.split("").reverse().join("");
      console.log(this.hexagrams[i], binary);
      this.to_binary.set(this.hexagrams[i], binary);
      this.to_hexagram.set(binary, this.hexagrams[i]);
    }
  }

  public encode(binary: string): string {
    let i = 0;
    let res = "";
    while (i < binary.length) {
      const h = binary.slice(i, i + 6);
      if (this.to_hexagram.has(h)) {
        res += this.to_hexagram.get(h);
        i += 6;
      } else {
        res += binary[i];
        i += 1;
      }
    }
    return res;
  }
  public decode(hexagram: string): string {
    let i = 0;
    let res = "";
    while (i < hexagram.length) {
      if (this.to_binary.has(hexagram[i])) {
        // single character
        res += this.to_binary.get(hexagram[i]);
        // res = this.to_binary.get(hexagram[i]) + res;
        i += 1;
      } else {
        const h2 = hexagram.slice(i, i + 2);
        if (this.to_binary.has(h2)) {
          // double character
          res += this.to_binary.get(h2);
          // res = this.to_binary.get(h2) + res;
          i += 2;
        } else {
          // unknown character
          res += hexagram[i];
          i += 1;
        }
      }
    }
    return res;
  }
}

Deno.test("hexagram test", () => {
  const hexagram = new Hexagram();
  // console.log(hexagram.hexagrams);

  const str = "否履需贲损困涣革晋离夬贲明夷渐复恒涣晋丰临巽井";
  // const str = "否履小畜鼎损丰豫损观谦归妹蒙坤噬嗑随同人临巽井";

  const binary = hexagram.decode(str);
  console.log(binary);
  const nizi = new NiziCode();
  console.log(nizi.binary(binary));

  const binary2 = nizi.encode_binary(
    "smallbottleinabandonedfactorynearwindow".toUpperCase(),
  );
  console.log(binary2);
  // const str = "否履需贲损困涣革晋离夬贲明夷渐复恒涣晋丰临巽井";
  // for (let i = 0; i < str.length; i++) {
  //   const word = str.slice(i) + str.slice(0, i);
  //   console.log(i, nizi.binary(hexagram.decode(word)));
  // }
});
