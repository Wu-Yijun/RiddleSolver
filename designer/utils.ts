enum EnSource {
  Mathematica = "./designer/assets/mathematica-wordlist.txt",
  Shakespeare = "Unsupported",
}
enum ZhSource {
  CivilCode = "./designer/assets/民法典.txt",
  ZhuZiqing = "./designer/assets/朱自清.txt",
  ThreeKingdoms = "Unsupported",
}

class RandomGenerator {
  word_list_en: string[];
  word_list_zh: string[];
  constructor(
    ensource: EnSource = EnSource.Mathematica,
    zhsource: ZhSource = ZhSource.CivilCode,
  ) {
    this.word_list_en = Deno.readTextFileSync(ensource).trim().split("\n").map((
      x,
    ) => x.trim());
    this.word_list_zh = Deno.readTextFileSync(zhsource).trim().split(/(\n\s)+/g)
      .map((x) => x.trim()).filter((x) => x);
  }
  random_word_en(): string {
    return this
      .word_list_en[Math.floor(Math.random() * this.word_list_en.length)];
  }
  random_word_zh(len: number = 2): string {
    const line =
      this.word_list_zh[Math.floor(Math.random() * this.word_list_zh.length)];
    const pos = Math.floor(Math.random() * line.length - len);
    return line.substring(pos, pos + len);
  }
  random_sentence_en(): string {
    const len = Math.floor(Math.random() * 10) + 5;
    return Array.from({ length: len }, () => this.random_word_en()).join(" ");
  }
  random_sentence_zh(): string {
    const len = Math.floor(Math.random() * 20) + 8;
    return Array.from({ length: len }, () => this.random_word_zh()).join("");
  }
  random_sentence_mix(): string {
    const len = Math.floor(Math.random() * 14) + 5;
    let res = "";
    for (let i = 0; i < len;) {
      let continous = Math.floor(Math.random() ** 2 * 3) + 1;
      i += continous;
      if (Math.random() > 0.5) {
        while (continous--) {
          res += this.random_word_en() + " ";
        }
      } else {
        while (continous--) {
          res += this.random_word_zh();
        }
      }
    }
    return res;
  }
  random_paragraph_en(): string {
    const len = Math.floor(Math.random() * 10) + 5;
    return Array.from({ length: len }, () => this.random_sentence_en()).join(
      ". ",
    );
  }
  random_paragraph_zh(): string {
    const len = Math.floor(Math.random() * 10) + 5;
    return Array.from({ length: len }, () => this.random_sentence_zh()).join(
      "。",
    );
  }
  random_paragraph_mix(): string {
    const len = Math.floor(Math.random() * 10) + 5;
    return Array.from({ length: len }, () => this.random_sentence_mix()).join(
      ".",
    );
  }
}

export { RandomGenerator, EnSource, ZhSource };

Deno.test("random word", () => {
  const rg = new RandomGenerator(EnSource.Mathematica, ZhSource.ZhuZiqing);
  // console.log(rg.word_list_zh.slice(0, 10));
  console.log(rg.random_word_en());
  console.log(rg.random_word_zh());
  console.log(rg.random_sentence_en());
  console.log(rg.random_sentence_zh());
  console.log(rg.random_sentence_mix());
  console.log(rg.random_paragraph_en());
  console.log(rg.random_paragraph_zh());
  console.log(rg.random_paragraph_mix());
});
