function main() {
  const hv1s = document.getElementsByClassName("hv1");
  const hv2s = document.getElementsByClassName("hv2");
  const infoBox = document.getElementById("info-box");
  for (const dom of hv1s) {
    // console.log(dom);
    const hv1 = dom.getAttribute("hv1");
    dom.addEventListener("click", function (event) {
      // 获取鼠标点击位置
      const mouseX = event.pageX;
      const mouseY = event.pageY;

      // 设置文本框位置
      infoBox.style.left = `${mouseX + 10}px`; // 鼠标右侧 10px
      infoBox.style.top = `${mouseY + 10}px`; // 鼠标下方 10px
      infoBox.style.display = "block"; // 显示文本框
      infoBox.innerText = hv1; // 显示信息
    });

    // 监听鼠标移出 pop 元素
    dom.addEventListener("mouseleave", function () {
      setTimeout(() => {
        // 等待用户完成鼠标移出动作后移除信息框
        if (!infoBox.matches(":hover")) {
          infoBox.style.display = "none"; // 隐藏信息框
        }
      }, 100);
    });

    // 监听鼠标移出信息框本身
    infoBox.addEventListener("mouseleave", function () {
      infoBox.style.display = "none"; // 隐藏信息框
    });

    if (dom.getAttribute("title") === null) {
      dom.setAttribute("title", "(点击以查看吐槽)");
    }
  }
  for (const dom of hv2s) {
    // console.log(dom);
    const hv2 = dom.getAttribute("hv2");
    dom.addEventListener("dblclick", function (event) {
      // 获取鼠标点击位置
      const mouseX = event.pageX;
      const mouseY = event.pageY;

      // 设置文本框位置
      infoBox.style.left = `${mouseX + 10}px`; // 鼠标右侧 10px
      infoBox.style.top = `${mouseY + 10}px`; // 鼠标下方 10px
      infoBox.style.display = "block"; // 显示文本框
      infoBox.innerText = hv2; // 显示信息
    });

    // 监听鼠标移出 pop 元素
    dom.addEventListener("mouseleave", function () {
      setTimeout(() => {
        // 等待用户完成鼠标移出动作后移除信息框
        if (!infoBox.matches(":hover")) {
          infoBox.style.display = "none"; // 隐藏信息框
        }
      }, 100);
    });

    // 监听鼠标移出信息框本身
    infoBox.addEventListener("mouseleave", function () {
      infoBox.style.display = "none"; // 隐藏信息框
    });

    if (dom.getAttribute("title") === null) {
      dom.setAttribute("title", "(双击以查看提示)");
    } else if (dom.getAttribute("title") === "(点击以查看吐槽)") {
      dom.setAttribute("title", "(点击以查看吐槽)(双击以查看提示)");
    }
  }

  console.log("notes.js loaded");
}

globalThis.addEventListener("DOMContentLoaded", main);
