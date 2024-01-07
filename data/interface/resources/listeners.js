const undo = document.getElementById("undo");
const redo = document.getElementById("redo");
const hint = document.getElementById("hint");
const best = document.getElementById("best");
const auto = document.getElementById("auto");
const init = document.getElementById("init");
const speed = document.getElementById("speed");
const score = document.getElementById("score");
const toggle = document.getElementById("toggle");
const keyboard = document.querySelector(".keyboard");
const settings = document.querySelector(".settings");
const hsla = [...document.querySelectorAll("td[class='HSLA']")];

const touch = {
  "threshold": 30,
  "container": document.getElementById("main"),
  "swipe": {
    "direction": null
  },
  "dist": {
    'X': null, 
    'Y': null
  },
  "start": {
    'X': null, 
    'Y': null
  },
  "time": {
    "start": null, 
    "elapsed": null, 
    "allowed": 1000
  }
};

document.addEventListener("keydown", function (e) {
  config.app.gesture(e.which);
});

speed.addEventListener("change", function (e) {
  if (parseInt(e.target.value) + '' === e.target.value + '') {
    config.storage.write("speed", e.target.value);
  }
});

keyboard.addEventListener("click", function (e) {
  const data = e.target.getAttribute("data");
  const key = parseInt(data) || 0;
  config.app.gesture(key);
});

toggle.addEventListener("click", function () {
  let state = config.storage.read("toggle") !== undefined ? config.storage.read("toggle") : "hide";
  state = state === "show" ? "hide" : "show";
  config.storage.write("toggle", state);
  /*  */
  settings.setAttribute("toggle", state);
});

undo.addEventListener("click", function () {
  const state = config.storage.read("O_state");
  if (state !== undefined) {
    config.app.matrix.cell.e.grid = state.grid;
    config.app.matrix.make(state.p, config.app.matrix.cell.e.grid, false, "undo");
    config.app.update(config.app.matrix.cell.e);
  }
});

redo.addEventListener("click", function () {
  const state = config.storage.read("N_state");
  if (state !== undefined) {
    config.app.matrix.cell.e.grid = state.grid;
    config.app.matrix.make(state.p, config.app.matrix.cell.e.grid, false, "redo");
    config.app.update(config.app.matrix.cell.e);
  }
});

hint.addEventListener("click", function (e) {
  const i = config.app.predict(config.app.kernel.AI, false);
  e.target.textContent = ['↑', '→', '↓', '←'][i];
  /*  */
  window.setTimeout(function () {
    e.target.textContent = "?";
  }, 1000);
});

best.addEventListener("click", function () {
  const reset = window.confirm("Do you want to reset best score?");
  if (reset) {
    config.storage.write("besttile", 0);
    config.storage.write("bestscore", 0);
    /*  */
    const bestscore = config.storage.read("bestscore") + ' (' + config.storage.read("besttile") + ')';
    best.textContent = config.storage.read("bestscore") !== undefined ? bestscore : 0;
  }
});

auto.addEventListener("click", function () {
  if (!config.app.kernel.AI.running) {
    config.app.kernel.AI.running = true;
    this.textContent = "STOP";
    config.app.play.auto();
  } else {
    config.app.kernel.AI.running = false;
    this.textContent = "Auto";
  }
});

init.addEventListener("click", function () {
  config.storage.write("storage", '');
  config.app.init(config.app.kernel.AI);
  config.app.update(config.app.kernel.AI);
  /*  */
  hint.textContent = "?";
  score.textContent = "0";
  auto.textContent = "Auto";
  /*  */
  const bestscore = config.storage.read("bestscore") + ' (' + config.storage.read("besttile") + ')';
  best.textContent = config.storage.read("bestscore") !== undefined ? bestscore : 0;
});

hsla.forEach(function (elm) {
  elm.style.backgroundColor = "hsla(" + elm.getAttribute("hue") + ', ' + elm.getAttribute("saturation") + "%, " + elm.getAttribute("lightness") + "%, " + elm.getAttribute("alphavalue") + ')';
  /*  */
  elm.addEventListener("click", function (e) {
    const hue = parseInt(e.target.getAttribute("hue"));
    const lightness = parseInt(e.target.getAttribute("lightness"));
    const saturation = parseInt(e.target.getAttribute("saturation"));
    const alphavalue = parseInt(e.target.getAttribute("alphavalue"));
    /*  */
    config.app.color.HSLA = {
      "hue": hue, 
      "lightness": lightness, 
      "saturation": saturation, 
      "alphavalue": alphavalue
    };
    /*  */
    config.app.update();
  });
});

/* touch */

touch.container.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, false);

touch.container.addEventListener("touchstart", function (e) {
  e.preventDefault();
  /*  */
  const current = e.changedTouches[0];
  touch.start.X = current.pageX;
  touch.start.Y = current.pageY;
  touch.swipe.direction = "none";
  /*  */
  touch.time.start = new Date().getTime();
}, false);

touch.container.addEventListener("touchend", function (e) {
  e.preventDefault();
  /*  */
  const current = e.changedTouches[0];
  touch.dist.X = current.pageX - touch.start.X;
  touch.dist.Y = current.pageY - touch.start.Y;
  touch.time.elapsed = new Date().getTime() - touch.time.start;
  /*  */
  if (touch.time.elapsed <= touch.time.allowed) {
    if (config.LOG) console.error("> X", Math.abs(touch.dist.X), "> Y", Math.abs(touch.dist.Y));
    const vertical = Math.abs(touch.dist.X) >= touch.threshold && Math.abs(touch.dist.X) > Math.abs(touch.dist.Y);
    const horizontal = Math.abs(touch.dist.Y) >= touch.threshold && Math.abs(touch.dist.Y) > Math.abs(touch.dist.X);
    /*  */
    if (vertical) {
      touch.swipe.direction = (touch.dist.X < 0) ? 37 : 39;
    } else if (horizontal) {
      touch.swipe.direction = (touch.dist.Y < 0) ? 38 : 40;
    }
  }
  /*  */
  config.app.gesture(touch.swipe.direction);
}, false);
