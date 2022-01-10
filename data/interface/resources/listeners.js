var undo = document.getElementById("undo");
var redo = document.getElementById("redo");
var hint = document.getElementById("hint");
var best = document.getElementById("best");
var auto = document.getElementById("auto");
var init = document.getElementById("init");
var speed = document.getElementById("speed");
var score = document.getElementById("score");
var toggle = document.getElementById("toggle");
var keyboard = document.querySelector(".keyboard");
var settings = document.querySelector(".settings");
var hsla = [...document.querySelectorAll("td[class='HSLA']")];

var touch = {
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
  var data = e.target.getAttribute("data");
  var key = parseInt(data) || 0;
  config.app.gesture(key);
});

toggle.addEventListener("click", function () {
  var state = config.storage.read("toggle") !== undefined ? config.storage.read("toggle") : "hide";
  state = state === "show" ? "hide" : "show";
  config.storage.write("toggle", state);
  /*  */
  settings.setAttribute("toggle", state);
});

undo.addEventListener("click", function () {
  var state = config.storage.read("O_state");
  if (state !== undefined) {
    config.app.matrix.cell.e.grid = state.grid;
    config.app.matrix.make(state.p, config.app.matrix.cell.e.grid, false, "undo");
    config.app.update(config.app.matrix.cell.e);
  }
});

redo.addEventListener("click", function () {
  var state = config.storage.read("N_state");
  if (state !== undefined) {
    config.app.matrix.cell.e.grid = state.grid;
    config.app.matrix.make(state.p, config.app.matrix.cell.e.grid, false, "redo");
    config.app.update(config.app.matrix.cell.e);
  }
});

hint.addEventListener("click", function (e) {
  var i = config.app.predict(config.app.kernel.AI, false);
  e.target.textContent = ['↑', '→', '↓', '←'][i];
  /*  */
  window.setTimeout(function () {
    e.target.textContent = "?";
  }, 1000);
});

best.addEventListener("click", function () {
  var reset = window.confirm("Do you want to reset best score?");
  if (reset) {
    config.storage.write("besttile", 0);
    config.storage.write("bestscore", 0);
    /*  */
    var bestscore = config.storage.read("bestscore") + ' (' + config.storage.read("besttile") + ')';
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
  var bestscore = config.storage.read("bestscore") + ' (' + config.storage.read("besttile") + ')';
  best.textContent = config.storage.read("bestscore") !== undefined ? bestscore : 0;
});

hsla.forEach(function (elm) {
  elm.style.backgroundColor = "hsla(" + elm.getAttribute("hue") + ', ' + elm.getAttribute("saturation") + "%, " + elm.getAttribute("lightness") + "%, " + elm.getAttribute("alphavalue") + ')';
  /*  */
  elm.addEventListener("click", function (e) {
    var hue = parseInt(e.target.getAttribute("hue"));
    var lightness = parseInt(e.target.getAttribute("lightness"));
    var saturation = parseInt(e.target.getAttribute("saturation"));
    var alphavalue = parseInt(e.target.getAttribute("alphavalue"));
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
  var current = e.changedTouches[0];
  touch.start.X = current.pageX;
  touch.start.Y = current.pageY;
  touch.swipe.direction = "none";
  /*  */
  touch.time.start = new Date().getTime();
}, false);

touch.container.addEventListener("touchend", function (e) {
  e.preventDefault();
  /*  */
  var current = e.changedTouches[0];
  touch.dist.X = current.pageX - touch.start.X;
  touch.dist.Y = current.pageY - touch.start.Y;
  touch.time.elapsed = new Date().getTime() - touch.time.start;
  /*  */
  if (touch.time.elapsed <= touch.time.allowed) {
    if (config.LOG) console.error("> X", Math.abs(touch.dist.X), "> Y", Math.abs(touch.dist.Y));
    var vertical = Math.abs(touch.dist.X) >= touch.threshold && Math.abs(touch.dist.X) > Math.abs(touch.dist.Y);
    var horizontal = Math.abs(touch.dist.Y) >= touch.threshold && Math.abs(touch.dist.Y) > Math.abs(touch.dist.X);
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