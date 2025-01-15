function sqrt_bigint(value: bigint): bigint {
  if (value < 0n) {
    throw new Error("Cannot calculate the square root of a negative number");
  }
  if (value === 0n || value === 1n) return value;
  let low = 0n;
  let high = value;
  let mid;
  while (low < high) {
    mid = (low + high + 1n) >> 1n; // 中点
    if (mid * mid <= value) {
      low = mid;
    } else {
      high = mid - 1n;
    }
  }
  return low;
}

function solve(digits: number) {
  // 3/2 * (sqrt(13) - 3)
  const scale = 10n ** BigInt(digits);
  const sqrt13 = sqrt_bigint(13n * scale * scale);
  const res = (sqrt13 - 3n * scale) * 3n / 2n;
  return res;
}

Deno.test("solve", () => {
  // 测试代码
  const res = solve(300).toString();
  console.log(res.slice(223 - 1, 223 - 1 + 3));
});
