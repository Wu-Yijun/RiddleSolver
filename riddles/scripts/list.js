const graph = document.getElementById("graph");
const vw = globalThis.innerWidth / 100;
const ui = globalThis.innerWidth / 11;
const uh = ui / 2;
let time_step = 200;
// Define the nodes and edges
globalThis.onclick = () => {
  time_step /= 2;
};

const info_box = document.getElementById("info-box");
const info_id = document.getElementById("info-id");
const info_name = document.getElementById("info-name");
const info_state = document.getElementById("info-state");

const nodes = [
  ["00", 2],
  ["03", 1],
  ["06", 1],
  ["20", 2],
  ["22", 2],
  ["24", 1],
  ["36", 1],
  ["40", 2],
  ["42", 1],
  ["44", 2],
  ["49", 1],
  ["64", 1],
  ["66", 2],
  ["68", 1],
  ["80", 1],
  ["88", 1],
  ["89", 1],
  ["96", 1],
  ["99", 1],
  ["100", 0],
];
const links = {
  "00": ["Invitation", "./Invitation.html"],
  "03": ["Nise Code", "./Nise-Code.html"],
  "06": ["Web of Data", "./Web-of-Data.html"],
  "20": ["Array", "./Array.html"],
  "22": ["Number", "./Number.html"],
  "24": ["Density and Destination", "./Destiny-and-Destination.html"],
  "36": ["Red Ghost", "./Red-Ghost.html"],
  "40": ["Law", "./Law.html"],
  "42": ["Math", "./Math.html"],
  "44": ["Ten Seconds", "./Ten-Seconds.html"],
  "49": ["Ultimate Justice", "./Ultimate-Justice.html"],
  "64": ["Queens of Numbers", "./Queens-of-Numbers.html"],
  "66": ["Psychology Test", "./Psychology-Test.html"],
  "68": ["Ways", "./Ways.html"],
  "80": ["WiFi Password", "./WiFi-Password.html"],
  "88": ["Life for Riddle", "./Life-for-Riddle.html"],
  "89": ["Treasure Hunter", "./Treasure-Hunter.html"],
  "96": ["Truth False & Myth", "./Truth-False-and-Myth.html"],
  "99": ["Final Letter", "./Final-Letter.html"],
  "100": ["Credits", "./Credits.html"],
};
const edges_all = [
  ["00", "20"],
  ["00", "03"],
  ["20", "22"],
  ["20", "40"],
  ["22", "24"],
  ["22", "42"],
  ["40", "42"],
  ["03", "06"],
  ["40", "80"],
  ["24", "44"],
  ["42", "44"],
  ["06", "36"],
  ["44", "64"],
  ["44", "49"],
  ["36", "66"],
  ["64", "66"],
  ["66", "68"],
  ["66", "96"],
  ["68", "88"],
  ["80", "88"],
  ["88", "89"],
  ["49", "99"],
  ["89", "99"],
  ["96", "99"],
  ["99", "100"],
];
// const edges = edges_all.slice(0);
const edges = globalThis.get_links();

function get_node(id0) {
  const id = (typeof id0 === "number")
    ? id0.toFixed(0).padStart(2, "0")
    : String(id0);
  if (id === "100") {
    return [10 * ui, 11 * uh];
  }
  if (id === "89") {
    return [8.5 * ui, 8 * uh];
  }
  const x = parseInt(id.slice(0, -1));
  const y = parseInt(id.slice(-1));
  return [x * ui, y * uh];
}

const finished = new Map(nodes);
const state = {
  info_hide: null,
};
function set_event(node, id) {
  node.addEventListener("mouseenter", (event) => {
    if (state.info_hide) {
      clearTimeout(state.info_hide);
      state.info_hide = null;
    }
    let left = event.clientX + 10;
    if (left + 280 > globalThis.innerWidth) {
      left = globalThis.innerWidth - 280;
    }
    let top = event.clientY + 10 + globalThis.scrollY;
    if (event.clientY + 160 > globalThis.innerHeight) {
      top = globalThis.innerHeight - 160 + globalThis.scrollY;
    }
    info_box.style.opacity = "0.8";
    info_box.style.left = `${left}px`;
    info_box.style.top = `${top}px`;
    info_id.innerText = `第 ${id} 题`;
    info_name.textContent = links[id][0];
    if (finished.get(id) === 0) {
      info_state.innerText = "已完成";
      info_state.classList.add("finished");
    } else {
      const all = nodes.find(([id0]) => id0 === id)[1];
      info_state.innerText = "完成进度 " + (all - finished.get(id)) + "/" + all;
      info_state.classList.remove("finished");
    }
    // info_state.textContent = state.num;
    state.info_hide = setTimeout(() => {
      info_box.style.opacity = "0";
    }, 1500);
  });
  node.addEventListener("mouseleave", () => {
    if (state.info_hide) {
      clearTimeout(state.info_hide);
      state.info_hide = null;
    }
    state.info_hide = setTimeout(() => {
      info_box.style.opacity = "0";
    }, 400);
  });
  node.addEventListener("click", () => {
    click_node(id);
  });
}

// Function to create a node
function createNode(id) {
  const [x, y] = get_node(id);
  const node = document.createElement("div");
  node.className = "node";
  node.style.left = `${x + 2 * vw}px`;
  node.style.top = `${y + 2 * vw}px`;
  node.id = "node" + id;
  node.textContent = id;
  node.style.opacity = "0";
  set_event(node, id);
  graph.appendChild(node);
  setTimeout(() => {
    node.style.opacity = "";
  });
}

function finishNode(id) {
  const node = document.getElementById("node" + id);
  node.classList.add("finished");
}

// Function to create an edge
function createEdge(from, to) {
  const [x1, y1] = get_node(from);
  const [x2, y2] = get_node(to);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  const edge = document.createElement("div");
  edge.className = "edge";
  edge.style.height = `1px`;
  edge.style.transform = `translate(${x1 + 4 * vw}px, ${
    y1 + 4 * vw
  }px) rotate(${angle}deg)`;
  edge.id = "edge" + from + "-" + to;
  graph.appendChild(edge);
  setTimeout(() => {
    edge.style.width = `${length}px`;
  });
}

// Animation sequence
async function animateGraph() {
  // for (const id of nodes) {
  //   createNode(id);
  //   await new Promise((resolve) => setTimeout(resolve, 300));
  // }

  createNode("00");
  const visited = new Set();
  for (const [from, to] of edges) {
    if(from==="100"){
      finishNode("100");
      continue;
    }
    const finished_num = finished.get(from) - 1;
    finished.set(from, finished_num);
    if (finished_num === 0) {
      finishNode(from);
      await new Promise((resolve) => setTimeout(resolve, time_step));
    }
    createEdge(from, to);
    await new Promise((resolve) => setTimeout(resolve, time_step));
    if (!visited.has(to)) {
      createNode(to);
      visited.add(to);
      await new Promise((resolve) => setTimeout(resolve, time_step));
    }
  }
  // finishNode("100");
}

// Placeholder click handler
function click_node(id) {
  globalThis.location.href = links[id][1];
}

function add_row(row, from, not_started = false) {
  try {
    const id = row.insertCell();
    const name = row.insertCell();
    const state = row.insertCell();
    id.innerText = from;
    name.innerText = links[from][0];
    name.onclick = () => click_node(from);
    const num_next = nodes.find(([id0]) => id0 === from)[1];
    const n = edges_all.filter((v) => v[0] === from).map((v) => v[1]).sort();
    const f = edges.filter((v) => v[0] === from).map((v) => v[1]).sort();
    // console.log(num_next, n, f);
    if (not_started) {
      state.innerText = "未开始";
      row.classList.add("not-started");
    } else {
      state.innerText = f.length >= num_next
        ? "已完成"
        : `进度 ${num_next - f.length} / ${num_next}`;
      row.classList.add(f.length >= num_next ? "finished" : "unfinished");
    }
    if (num_next === 2) {
      const next1 = row.insertCell();
      next1.innerText = n[0];
      next1.classList.add(f.includes(n[0]) ? "finished" : "unfinished");
      const next2 = row.insertCell();
      next2.innerText = n[1];
      next2.classList.add(f.includes(n[1]) ? "finished" : "unfinished");
    } else if (num_next === 1) {
      const next = row.insertCell();
      next.setAttribute("colspan", "2");
      next.innerText = n[0];
      next.classList.add(f.includes(n[0]) ? "finished" : "unfinished");
    } else {
      const next = row.insertCell();
      next.setAttribute("colspan", "2");
    }
  } catch (e) {
    console.warn(e);
  }
}

// Add the table
function add_table() {
  const table = document.getElementById("list-table");
  if (edges.length === 0) {
    return add_row(table.insertRow(), "00", true);
  }
  const visited = new Set();
  const unfinished = new Set();
  for (let i = 0; i < edges.length; i++) {
    const [from, to] = edges[i];
    unfinished.add(to);
    if (visited.has(from)) {
      continue;
    }
    visited.add(from);
    const row = table.insertRow();
    add_row(row, from);
  }
  for (const from of unfinished) {
    if (visited.has(from)) {
      continue;
    }
    const row = table.insertRow();
    add_row(row, from, true);
  }
}
add_table();

// Start the animation
animateGraph();
