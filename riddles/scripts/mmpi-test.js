function mmpi_behavior(state) {
  const mmpi_button = document.getElementById("mmpi-button");
  mmpi_button.addEventListener("click", function () {
    mmpi.classList.add("active");
  });

  const mmpi = document.getElementsByClassName("mmpi-test")[0];
  mmpi.addEventListener("click", function () {
    mmpi.classList.remove("active");
  });
  for (const child of mmpi.children) {
    child.addEventListener("click", function (event) {
      state.pick = false;
      // console.log("prevent");
      event.stopPropagation();
    });
  }
}

function is_click(event, state) {
  const diff = (event.pageX + event.pageY) - (state.pos[0] + state.pos[1]);
  // console.log(diff);
  return Math.abs(diff - 200) < 20;
}

function pen_behavior(state) {
  const pen_all = document.getElementById("pen_all");
  const pen = document.getElementById("pen");
  const pen_cap = document.getElementById("pen_cap");
  const pen_head = document.getElementById("pen_head");
  const pen_tail = document.getElementById("pen_tail");
  const paper_roll = document.getElementById("paper_roll");

  pen_all.style.display = "block";
  pen_all.style.left = state.pos[0] + "px";
  pen_all.style.top = state.pos[1] + "px";
  pen_all.addEventListener("click", function (event) {
    if (!is_click(event, state)) {
      return;
    }
    // pen.classList.toggle("open");
    // console.log(state);
    // console.log(pen.getBoundingClientRect());
    pen_cap.style.left = state.pos[0] + "px";
    pen_cap.style.top = state.pos[1] + "px";
    pen.style.left = state.pos[0] + "px";
    pen.style.top = state.pos[1] + "px";
    // pen_cap.style.left = "10px";
    // pen_cap.style.top = "20px";
    pen.style.display = "block";
    pen_cap.style.display = "block";
    pen_all.style.display = "none";
    state.open = true;
    state.pick = false;
    state.screw = 0;
    setTimeout(() => {
      pen_cap.style.top = "0px";
      pen_cap.style.left = "50px";
    });
  });
  pen_cap.addEventListener("click", function () {
    if (!is_click(event, { pos: [0, 50] })) {
      return;
    }
    if (state.screw >= 1) {
      return;
    }
    if (state.pick) {
      return;
    }
    pen_cap.style.display = "none";
    pen.style.display = "none";
    pen_all.style.top = state.pos[1] + "px";
    pen_all.style.left = state.pos[0] + "px";
    pen_all.style.display = "block";
    state.open = false;
    state.pick = false;
  });
  pen.addEventListener("click", function (event) {
    if (!is_click(event, state)) {
      return;
    }
    event.stopPropagation();
    if (state.pick) {
      return;
    }
    if ((event.pageX - event.pageY) > (state.pos[0] - state.pos[1]) - 18) {
      state.screw += 0.1;
      // console.log("screw", state.screw);
      if (state.screw >= 1.05) {
        state.pos[0] = event.pageX - 20;
        state.pos[1] = event.pageY - 180;
        pen.style.display = "none";
        pen_head.style.top = state.pos[1] + "px";
        pen_head.style.left = state.pos[0] + "px";
        pen_tail.style.top = state.pos[1] + "px";
        pen_tail.style.left = state.pos[0] + "px";
        pen_head.style.display = "block";
        pen_tail.style.display = "block";
        setTimeout(() => {
          pen_head.style.top = (state.pos[1] + 40) + "px";
          pen_head.style.left = (state.pos[0] - 40) + "px";
          pen_tail.style.top = (state.pos[1] - 40) + "px";
          pen_tail.style.left = (state.pos[0] + 40) + "px";
        });
      }
      return;
    }
    state.pick = true;
    state.screw = 0;
    pen.style.pointerEvents = "none";
    state.pos[0] = event.pageX - 20;
    state.pos[1] = event.pageY - 180;
    setTimeout(() => {
      pen.style.left = state.pos[0] + "px";
      pen.style.top = state.pos[1] + "px";
    });
    const mv_listener = document.addEventListener(
      "mousemove",
      function (event) {
        if (!state.pick) {
          document.removeEventListener("mousemove", mv_listener);
          pen.classList.remove("picked");
          pen.style.pointerEvents = "auto";
          return;
        }
        pen.classList.add("picked");
        state.pos[0] = event.pageX - 20;
        state.pos[1] = event.pageY - 180;
        pen.style.left = state.pos[0] + "px";
        pen.style.top = state.pos[1] + "px";
      },
    );
  });

  pen_head.addEventListener("click", function () {
    if (!is_click(event, state)) {
      return;
    }
    // console.log((event.pageX - event.pageY) - (state.pos[0] - state.pos[1]));
    if ((event.pageX - event.pageY) > (state.pos[0] - state.pos[1]) - 80) {
      return;
    }
    // console.log("unscrew");
    pen.style.top = state.pos[1] + "px";
    pen.style.left = state.pos[0] + "px";
    pen.style.display = "block";
    pen_head.style.display = "none";
    pen_tail.style.display = "none";
    state.screw = 0;
  });
  pen_tail.addEventListener("click", function () {
    if (!is_click(event, state)) {
      return;
    }
    if ((event.pageX - event.pageY) < (state.pos[0] - state.pos[1]) + 50) {
      return;
    }
    // console.log("find roll");
    // console.log(paper_roll);
    paper_roll.style.left = (state.pos[0] + 75) + "px";
    paper_roll.style.top = (state.pos[1] + 75) + "px";
    paper_roll.style.display = "block";
    setTimeout(() => {
      paper_roll.style.scale = 3.0;
    });
  });
  paper_roll.addEventListener("click", () => {
    paper_roll.style.scale = 10.0;
    setTimeout(() => {
      globalThis.location.href = `./Psychology-Test-Real.html`;
    }, 500);
  });
}

function create_test(elements) {
  let box = document.getElementById("mmpi-test-content");
  let list = box.getElementsByClassName("mmpi-test-questions")[0];
  const height = parseFloat(getComputedStyle(box).height);
  const paddingBottom = parseFloat(getComputedStyle(box).paddingBottom);
  let pos = box.offsetTop;
  console.log(height, paddingBottom, pos);
  let new_start = true;

  for (let i = 0; i < elements.length; i++) {
    const list_item = document.createElement("li");
    if (new_start) {
      list_item.setAttribute("value", i + 1);
      new_start = false;
    }
    list_item.innerHTML = `<p>
                  <span>${elements[i]}</span>
                  <span class="True">是</span>
                  <span class="False">否</span>
                </p>`;
    list.appendChild(list_item);

    // 检查当前容器的高度
    if (height + pos <= list_item.offsetTop + paddingBottom) {
      const page = document.createElement("div");
      page.classList.add("page");
      box.after(page);
      pos = page.offsetTop;
      const ordered_list = document.createElement("ol");
      ordered_list.classList.add("mmpi-test-questions");
      page.appendChild(ordered_list);
      new_start = true;

      list = ordered_list;
      box = page;
    }
  }

  const mmpi = document.getElementsByClassName("mmpi-test")[0];
  mmpi.classList.remove("loading");
}

async function load_file() {
  const response = await fetch("./assets/mmpi-test.txt");
  const text = await response.text();
  return text.trim().split("\n").map((s) => s.trim());
}

function main() {
  load_file().then((content) => {
    create_test(content);

    const state = {
      pos: [100, 100],
      open: false,
      pick: false,
      screw: 0,
    };
    mmpi_behavior(state);
    pen_behavior(state);

    const true_boxes = document.getElementsByClassName("True");
    const false_boxes = document.getElementsByClassName("False");
    for (const box of true_boxes) {
      box.addEventListener("click", function () {
        if (state.pick) {
          event.stopPropagation();
          box.classList.toggle("selected");
        }
      });
    }
    for (const box of false_boxes) {
      box.addEventListener("click", function () {
        if (state.pick) {
          event.stopPropagation();
          box.classList.toggle("selected");
        }
      });
    }

    console.log("mmpi-test generated");
  });

  console.log("mmpi-test.js loaded");
}

globalThis.addEventListener("DOMContentLoaded", main);
