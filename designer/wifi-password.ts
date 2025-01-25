import { NiseCode } from "./nise-code.ts";
import { ArrayDecoder } from "./array.ts";

Deno.test("WiFi Password", () => {
  const nise = new NiseCode();
  const decoder = new ArrayDecoder();
  decoder.read_words(1);
  const candidate: [string, boolean, string, boolean, number][] = [];
  for (let x = 0; x < 100; x++) {
    const word1 = nise.word(-14549065807383 + x);
    const word2 = nise.word(402866312956 + x);
    if (word1.includes("[]") || word2.includes("[]")) {
      continue;
    }
    const arr: [string, boolean, string, boolean, number] = [
      word1,
      decoder.is_word(word1),
      word2,
      decoder.is_word(word2),
      x,
    ];
    console.log(...arr);
    if (arr[1] || arr[3]) {
      candidate.push(arr);
    }
  }
  candidate.forEach((c) => {
    console.log(
      `x=${c[4]}: classroom associated with ${c[0]} in ${c[2]} building`,
    );
  });
});
