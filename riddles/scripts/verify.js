const Id = String(document.getElementsByTagName("id")[0].innerText);
console.log("Riddle ID:", Id);

function main() {
  const checkers = document.getElementsByClassName("checker-box");
  const next_riddles = document.getElementsByClassName("next-riddle");
  const control_both =
    document.getElementById("checkers").getAttribute("both") === "true";
  let left = checkers.length;
  let i = 1;
  for (const checker_box of checkers) {
    const key = "Riddolver-" + Id + ":" + i;
    const riddle_button = next_riddles[i - 1];
    i += 1;
    const checker = checker_box.getElementsByClassName("checker")[0];
    const info = checker.getElementsByClassName("answer-info")[0];
    const answer = checker.getElementsByClassName("answer")[0];
    const check = checker.getElementsByClassName("button")[0];
    const notes = checker_box.getElementsByClassName("answer-notes")[0];
    const result = checker.getAttribute("answer");
    const const_accuracy = checker.getAttribute("accuracy");
    const check_answer = function () {
      localStorage.setItem(key, answer.innerText.trim());
      if (const_accuracy) {
        info.innerText = `匹配度 ${const_accuracy}%`;
        info.style.color = "orange";
        return;
      }
      const accuracy = get_accuracy(answer.innerText, result);
      if (accuracy != 100) {
        info.innerText = `匹配度 ${accuracy.toFixed(0)}%`;
        info.style.color = "orange";
      } else {
        info.innerText = "正确!";
        info.style.color = "green";
        notes.style.display = "block";
        checker.style.color = "gray";
        // checker.style.opacity = "50%";
        checker.style.pointerEvents = "none";
        checker.style.userSelect = "none";
        answer.setAttribute("contenteditable", "false");
        answer.style.userSelect = "text";
        left -= 1;
        if (left === 0) {
          const notes = document.getElementById("checkers-notes");
          if (notes !== null) notes.style.display = "block";
        }
        if (control_both) {
          if (left === 0) {
            for (const riddle_button of next_riddles) {
              unlock_riddle(riddle_button);
            }
          }
        } else {
          unlock_riddle(riddle_button);
        }
      }
    };
    // add listener to check button
    check.addEventListener("click", check_answer);

    const cached_answer = localStorage.getItem(key);
    if (cached_answer !== null && cached_answer.length > 0) {
      console.log(JSON.stringify(cached_answer), cached_answer.length);
      answer.innerText = cached_answer;
      check_answer();
    }
  }

  console.log("verify.js loaded");
}

// function edit_distance(source: string, target: string): number {
function edit_distance(source, target) {
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

/**
 * This function returns the accuracy of the source string compared to the target answer.
 * @param {string} source
 * @param {string} target
 * @returns number in percentage
 */
function get_accuracy(source, target) {
  source = source.trim().toUpperCase();
  target = target.trim().toUpperCase();
  if (source === target) {
    return 100;
  } else if (source === "" || target === "") {
    return 0;
  }
  const distance = edit_distance(source, target);
  return (1.0 - distance / Math.max(source.length, target.length)) * 100;
}

function unlock_riddle(riddle_button) {
  const next_id = parseInt(riddle_button.getAttribute("riddle")) ||
    parseInt(riddle_button.innerText);
  if (next_id) {
    console.log("Unlock riddle:", Id, next_id);
    globalThis.add_link(Id, next_id);
  }

  riddle_button.classList.add("clickable");
  const next_riddle = riddle_button.getAttribute("riddle");
  riddle_button.onclick = () => {
    globalThis.location.href = `./${next_riddle}.html`;
  };
}

globalThis.addEventListener("DOMContentLoaded", main);
