var touch = {
  "threshold": 30,
  "swipe": {"direction": null},
  "dist": {'X': null, 'Y': null},
  "start": {'X': null, 'Y': null},
  "container": document.getElementById("main"),
  "time": {"start": null, "elapsed": null, "allowed": 1000}
};

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
    if (vertical) touch.swipe.direction = (touch.dist.X < 0) ? 37 : 39;
    else if (horizontal) touch.swipe.direction = (touch.dist.Y < 0) ? 38 : 40;
  }
  /*  */
  config.app.gesture(touch.swipe.direction);
}, false);

window.addEventListener("resize", function (e) {
  if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
  config.resize.timeout = window.setTimeout(function () {
    config.storage.write("width", window.innerWidth || window.outerWidth);
    config.storage.write("height", window.innerHeight || window.outerHeight);
  }, 1000);
});

window.addEventListener("load", config.load, false);
