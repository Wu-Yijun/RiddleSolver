function main() {
  const config = {
    // speed: 0,
    speed: 2.5,
    speed_fast: 10,
    speed_slow: 0.9,
    offset: 0,
    height: 100,
    shift: false,
    ctrl: false,
    exit: false,
    info_hide: null,
  };
  const scrolling = document.getElementById("scrolling");
  const info = document.getElementById("info");
  config.height = parseFloat(getComputedStyle(scrolling).height);
  globalThis.addEventListener("resize", () => {
    const height = parseFloat(getComputedStyle(scrolling).height);
    config.offset *= height / config.height;
    config.height = height;
  });

  function show_info() {
    if (config.info_hide) {
      clearTimeout(config.info_hide);
      config.info_hide = null;
    }
    info.style.opacity = 1;
    config.info_hide = setTimeout(() => {
      info.style.opacity = 0;
      config.info_hide = null;
    }, 2000);
  }

  document.addEventListener("mousedown", show_info);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Shift") {
      config.shiftKey = true;
    }
    if (event.key === "Control") {
      config.ctrlKey = true;
    }
    // console.log(event);
    if (config.info_hide !== null && event.key === "Escape") {
      globalThis.location.href = "./list.html";
    }
    show_info();
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
      config.shiftKey = false;
    }
    if (event.key === "Control") {
      config.ctrlKey = false;
    }
    // console.log(event);
  });

  function update() {
    scrolling.style.transform = `translateY(-${config.offset}px)`;
    if (config.shiftKey) {
      config.offset += config.speed_fast;
    } else if (config.ctrlKey) {
      config.offset += config.speed_slow;
    } else {
      config.offset += config.speed;
    }
    // console.log(config.offset)
    if (config.offset < config.height) {
      requestAnimationFrame(update);
    } else {
      globalThis.add_link(100, 100);
      setTimeout(() => {
        globalThis.location.href = "./list.html";
      }, 2000);
    }
    if (config.offset > config.height - 1000) {
      const alpha = (config.height - config.offset) / 1000 * 256;
      const color = `rgb(${alpha},${alpha},${alpha})`;
      // console.log(color)
      scrolling.style.backgroundColor = color;
      document.body.style.backgroundColor = color;
    }
  }

  update();
  console.log("Credits.js loaded");
}

globalThis.window.addEventListener("load", main);
