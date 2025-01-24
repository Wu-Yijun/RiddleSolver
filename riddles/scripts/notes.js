function init_lists() {
  function get_links() {
    try {
      return Array.from(JSON.parse(localStorage.getItem("Riddolver-links")));
    } catch (e) {
      console.warn(e);
      console.warn("Use empty list instead.");
    }
    return [];
  }
  function add_link(from, to) {
    const links = get_links();
    if (links.some(([f, t]) => f === from && t === to)) {
      return;
    }
    links.push([from, to]);
    localStorage.setItem("Riddolver-links", JSON.stringify(links));
    console.log(`Added link from ${from} to ${to}.`);
  }
  // const links = [];
  globalThis.add_link = function (from, ...to) {
    for (const t of to) {
      add_link(String(from).padStart(2, "0"), String(t).padStart(2, "0"));
    }
  };
  globalThis.get_links = get_links;
  console.log("list functions loaded");
}
init_lists();

function main() {
  const hv1s = document.getElementsByClassName("hv1");
  const hv2s = document.getElementsByClassName("hv2");
  const infoBox = document.getElementById("info-box");
  function showNotes(event, notes) {
    infoBox.innerText = notes; // 显示信息
    infoBox.style.display = "block"; // 显示文本框
    // 获取鼠标点击位置
    const mouseX = event.pageX;
    const mouseY = event.pageY;
    // 确保文本框底边在窗口显示之内
    const infoBoxHeight = infoBox.offsetHeight;
    const windowHeight = globalThis.innerHeight + globalThis.scrollY;
    if (mouseY + 10 + infoBoxHeight > windowHeight) {
      infoBox.style.top = `${windowHeight - infoBoxHeight - 10}px`; // 向上移动
    } else {
      infoBox.style.top = `${mouseY + 10}px`; // 鼠标下方 10px
    }
    // 设置文本框位置
    infoBox.style.left = `${mouseX + 10}px`; // 鼠标右侧 10px
  }
  for (const dom of hv1s) {
    // console.log(dom);
    const hv1 = dom.getAttribute("hv1");
    dom.addEventListener("click", function (event) {
      showNotes(event, hv1);
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
      showNotes(event, hv2);
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
