document.addEventListener("keydown", function (e) {
  config.app.gesture(e.which);
});

document.getElementById("speed").addEventListener("change", function (e) {
  if (parseInt(e.target.value) + '' === e.target.value + '') {
    config.storage.write("speed", e.target.value);
  }
});

document.querySelector(".keyboard").addEventListener("click", function (e) {
  var data = e.target.getAttribute("data");
  var key = parseInt(data) || 0;
  config.app.gesture(key);
});

document.getElementById("toggle").addEventListener("click", function () {
  var toggle = config.storage.read("toggle") !== undefined ? config.storage.read("toggle") : "hide";
  toggle = toggle === "show" ? "hide" : "show";
  config.storage.write("toggle", toggle);
  /*  */
  document.querySelector(".settings").setAttribute("toggle", toggle);
});

document.getElementById("undo").addEventListener("click", function () {
  var state = config.storage.read("O_state");
  if (state !== undefined) {
    config.app.matrix.cell.e.grid = state.grid;
    config.app.matrix.make(state.p, config.app.matrix.cell.e.grid, false, "undo");
    config.app.update(config.app.matrix.cell.e);
  }
});

document.getElementById("redo").addEventListener("click", function () {
  var state = config.storage.read("N_state");
  if (state !== undefined) {
    config.app.matrix.cell.e.grid = state.grid;
    config.app.matrix.make(state.p, config.app.matrix.cell.e.grid, false, "redo");
    config.app.update(config.app.matrix.cell.e);
  }
});

document.getElementById("hint").addEventListener("click", function (e) {
  var i = config.app.predict(config.app.kernel.AI, false);
  e.target.textContent = ['↑', '→', '↓', '←'][i];
  /*  */
  window.setTimeout(function () {
    e.target.textContent = "?";
  }, 1000);
});

document.getElementById("best").addEventListener("click", function () {
  var reset = window.confirm("Do you want to reset best score?");
  if (reset) {
    config.storage.write("besttile", 0);
    config.storage.write("bestscore", 0);
    /*  */
    var bestscore = config.storage.read("bestscore") + ' (' + config.storage.read("besttile") + ')';
    document.getElementById("best").textContent = config.storage.read("bestscore") !== undefined ? bestscore : 0;
  }
});

document.getElementById("auto").addEventListener("click", function () {
  if (!config.app.kernel.AI.running) {
    config.app.kernel.AI.running = true;
    this.textContent = 'STOP';
    config.app.play.auto();
  } else {
    config.app.kernel.AI.running = false;
    this.textContent = 'Auto';
  }
});

document.getElementById("init").addEventListener("click", function () {
  config.storage.write("storage", '');
  config.app.init(config.app.kernel.AI);
  config.app.update(config.app.kernel.AI);
  /*  */
  document.getElementById("hint").textContent = "?";
  document.getElementById("score").textContent = "0";
  document.getElementById("auto").textContent = "Auto";
  /*  */
  var bestscore = config.storage.read("bestscore") + ' (' + config.storage.read("besttile") + ')';
  document.getElementById("best").textContent = config.storage.read("bestscore") !== undefined ? bestscore : 0;
});

[...document.querySelectorAll("td[class='HSLA']")].map(function (elm) {
  elm.style.backgroundColor = "hsla(" + elm.getAttribute("hue") + ', ' + elm.getAttribute("saturation") + "%, " + elm.getAttribute("lightness") + "%, " + elm.getAttribute("alphavalue") + ')';
  /*  */
  elm.addEventListener("click", function (e) {
    var hue = parseInt(e.target.getAttribute("hue"));
    var lightness = parseInt(e.target.getAttribute("lightness"));
    var saturation = parseInt(e.target.getAttribute("saturation"));
    var alphavalue = parseInt(e.target.getAttribute("alphavalue"));
    /*  */
    config.app.color.HSLA = {"hue": hue, "lightness": lightness, "saturation": saturation, "alphavalue": alphavalue};
    config.app.update();
  });
});
