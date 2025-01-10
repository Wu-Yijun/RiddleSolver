const code_A = "A".charCodeAt(0);
const code_a = "a".charCodeAt(0);

function get_math_ab_c(): number {
  const x = BigInt(2) ** BigInt(2021);
  const str = x.toString();
  // console.log(x)
  const a = str.slice(-4);
  const b = str.slice(0, 2);
  console.log("A:", a);
  console.log("B:", b);
  const c = (BigInt(b) ** BigInt(a)) % BigInt(23);
  console.log("C:", c.toString());
  return Number(c);
}

function caesar_cipher(sentence: string, offset: number) {
  return sentence.replaceAll(
    /[a-z]/g,
    (s) =>
      String.fromCharCode((s.charCodeAt(0) - code_a + offset) % 26 + code_a),
  ).replaceAll(
    /[A-Z]/g,
    (s) =>
      String.fromCharCode((s.charCodeAt(0) - code_A + offset) % 26 + code_A),
  );
}

Deno.test("math solve ABC", () => {
  const c = get_math_ab_c();
  const encrypted = "tnbmm cpuumf jo beboepofe gbdupsz ofbs xjoepx";
  console.log(caesar_cipher(encrypted, 26 - c));
});
