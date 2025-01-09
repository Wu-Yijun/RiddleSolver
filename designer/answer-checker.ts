function edit_distance(source: string, target: string): number {
  const m = source.length;
  const n = target.length;
  // 初始化一维数组 dp，长度为 n + 1
  const dp = Array(n + 1).fill(0);
  // 初始化第一行（空字符串到 str2 的距离）
  for (let j = 0; j <= n; j++) {
    dp[j] = j;
  }
  // 遍历 str1 的每个字符
  for (let i = 1; i <= m; i++) {
    // prev 保存 dp[j - 1] 的值，用于替代二维数组的左上角值
    let prev = dp[0];
    dp[0] = i; // 当前行的第一个值（空字符串到 str1 前 i 个字符的距离）
    for (let j = 1; j <= n; j++) {
      const temp = dp[j]; // 暂存 dp[j] 的值，用于下一次迭代时的 prev
      if (source[i - 1] === target[j - 1]) {
        // 如果字符相等，继承左上角值
        dp[j] = prev;
      } else {
        // 如果字符不相等，取删除、插入、替换的最小值，加 1
        dp[j] = Math.min(dp[j - 1], dp[j], prev) + 1;
      }
      // 更新 prev 为当前的 dp[j]
      prev = temp;
    }
  }
  // dp[n] 存储最终结果
  return dp[n];
}

Deno.test("test edit distance", () => {
  // same string
  console.log(edit_distance("abcdefg", "abcdefg"));
  // replace
  console.log(edit_distance("abcfefg", "abcdefg"));
  // delete
  console.log(edit_distance("abcefg", "abcdefg"));
  // insert
  console.log(edit_distance("abcedefg", "abcdefg"));
  // insert 2
  console.log(edit_distance("abcdedefg", "abcdefg"));
  // insert 14
  console.log(edit_distance("abcdedededededededefg", "abcdefg"));
  // nothing related
  console.log(edit_distance("123456", "abcdefg"));
  console.log(edit_distance("123", "abcdefg"));
  console.log(edit_distance("12345678910", "abcdefg"));
});
