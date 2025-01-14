const beepPattern = "..--.....--..--.....-------.....--..--..--.....--." +
  ".--.....----..--.....--..----..--..--..--.....----" +
  "..--.....--.....--.....----..--.....--.....--..---" +
  "-.....--..--.....--.....--.....-------.....--..--." +
  ".--.....--..--..----.....--..--..--..----..--..--." +
  "....--.....----.....--.....--..-------.....--..--." +
  ".--.....--..--.....----.....--..--..--..----.....-" +
  "-..--.....--..----..--..--..--..----.....--..--..." +
  "..--.....--.....-------..--.....--.....--..----..-" +
  "-.....--..----.....--..--.....--..----..--..--..--" +
  "..-------.....--.....--.....--..--..----.....--..-" +
  "-.....--..----.....--..--.....--.....--..----....." +
  "--..--.....--.....--..----..--.....--..----..--..." +
  "..--.....--..-------..--..--.....--.....----.....-" +
  "-.....--..----.....--..--..--..----..--.....--...." +
  ".--..----..--.....--..-------.....--..--.....--..-";

// const beepPattern = "..--.....--..--.....-------.....--..--..--.....--.";
const beepDuration = 1 / 8; // 每个符号的持续时间 (秒)

const audioCtx =
  new (globalThis.AudioContext || globalThis.webkitAudioContext)();
const musicUrl = "./assets/inspiring-emotional-uplifting-piano-112623.mp3";
const musicBuffer = await audioCtx.decodeAudioData(
  await (await fetch(musicUrl)).arrayBuffer(),
);

let oscillator;
let musicSource;

function playBeepPattern(pattern) {
  if (oscillator) {
    oscillator.stop();
  }
  oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine"; // 设置为正弦波
  oscillator.frequency.value = 659.25; // E5
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  gainNode.gain.value = 0; // 初始为静音
  oscillator.start();

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    // 控制振幅，根据符号开启或关闭声音
    gainNode.gain.setValueAtTime(
      char === "." ? 1 : 0,
      audioCtx.currentTime + i * beepDuration,
    );
  }

  // 停止播放时间 = 符号数量 × 单符号时长
  const stopTime = pattern.length * beepDuration;
  oscillator.stop(audioCtx.currentTime + stopTime);
}

function playMusic() {
  if (musicSource) {
    musicSource.stop();
  }
  // 创建音乐播放器
  musicSource = audioCtx.createBufferSource();
  musicSource.buffer = musicBuffer;
  musicSource.connect(audioCtx.destination);
  musicSource.loop = true;
  musicSource.start();
}

const states = {
  inserted: false,
  broken: false,
  preparing: null,
  ready: false,
  clicked: false,
  clickedTime: 0,
};
const chip = document.getElementById("ten-second-chip");
const button = document.getElementById("ten-second-button");
function broken(possibility) {
  if (states.broken) {
    return true;
  }
  if (Math.random() > possibility) {
    return false;
  }
  states.broken = true;

  chip.style.color = "red";
  chip.innerText = "已损坏";
  chip.style.cursor = "not-allowed";
  chip.onclick = null;

  button.style.color = "red";
  button.children[0].innerText = "已损坏";
  button.style.cursor = "not-allowed";
  button.onclick = null;
  return true;
}

chip.onclick = function () {
  if (broken(0.02)) {
    return;
  }
  if (!states.inserted) {
    // 插入
    chip.style.color = "orange";
    chip.innerText = "拔出 USB 供电";
    playBeepPattern(".....--");
    states.inserted = true;
    states.preparing = setTimeout(() => {
      button.style.color = "green";
      button.style.cursor = "";
      states.ready = true;
      states.clicked = false;
      states.preparing = null;
    }, 1000);
  } else {
    // 断电
    chip.style.color = "green";
    chip.innerText = "插入 USB 供电";
    button.style.color = "gray";
    button.style.cursor = "not-allowed";
    states.inserted = false;
    states.ready = false;
    if (oscillator) {
      oscillator.stop();
      oscillator = null;
    }
    if (musicSource) {
      musicSource.stop();
      musicSource = null;
    }
    if (states.preparing) {
      clearTimeout(states.preparing);
      states.preparing = null;
    }
  }
};
button.onclick = function () {
  if (broken(0.03)) {
    return;
  }
  if (!states.ready) {
    if (broken(0.05)) {
      return;
    }
    return;
  }
  if (!states.clicked) {
    playMusic();
    states.clicked = true;
    states.clickedTime = Date.now();
  } else {
    states.ready = false;
    const time = Date.now();
    const duration = time - states.clickedTime;
    if (musicSource) {
      musicSource.stop();
      musicSource = null;
    }
    console.log("duration:", duration, "ms");
    // .100s; 1.00s; 10.0s; 100s; 100xs;
    if (
      duration === 100 || Math.round(duration / 10) === 100 ||
      Math.round(duration / 100) === 100 ||
      Math.round(duration / 1000) === 100 ||
      Math.round(duration / 10000) === 100
    ) {
      // precisely the correct time!
      playBeepPattern(".....--");
      setTimeout(() => {
        playBeepPattern(beepPattern);
      }, 2500);
    } else {
      playBeepPattern("..--..--..--");
    }
  }
};
