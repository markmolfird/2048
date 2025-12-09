var config = {
  "LOG": false,
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?tab") config.port.name = "tab";
            if (document.location.search === "?win") config.port.name = "win";
            /*  */
            chrome.runtime.connect({
              "name": config.port.name
            });
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "load": function () {
    const theme = document.getElementById("theme");
    const reload = document.getElementById("reload");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    /*  */
    reload.addEventListener("click", function () {
      document.location.reload();
    });
    /*  */
    support.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        const url = config.addon.homepage();
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        const url = config.addon.homepage() + "?reason=support";
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    theme.addEventListener("click", function () {
      let attribute = document.documentElement.getAttribute("theme");
      attribute = attribute === "dark" ? "light" : "dark";
      /*  */
      document.documentElement.setAttribute("theme", attribute);
      config.storage.write("theme", attribute);
    }, false);
    /*  */
    window.removeEventListener("load", config.load, false);
    config.storage.load(function () {config.app.start(true)});
  },
  "app": {
    "table": [],
    "color": {
      set HSLA(o) {config.storage.write("HSLA", o)},
      get HSLA() {
        const tmp = {"hue": 28, "saturation": 80, "lightness": 75, "alphavalue": 1};
        return config.storage.read("HSLA") !== undefined ? config.storage.read("HSLA") : tmp;
      }
    },
    "gesture": function (e) {
      if (config.app.matrix.cell.TIMEOUT) window.clearTimeout(config.app.matrix.cell.TIMEOUT);
      config.app.matrix.cell.TIMEOUT = window.setTimeout(function () {
        if (e in config.app.kernel.AI.map) {
          config.app.matrix.cell.move(config.app.kernel.AI.map[e], config.app.kernel.AI, true);
          document.getElementById("hint").textContent = '?';
          config.app.update(config.app.kernel.AI);
        }
      }, 30);
    },
    "init": function (e) {
      e.grid = [];
      for (let i = 0; i < config.app.matrix.size; i++) {
        e.grid[i] = [];
        for (let j = 0; j < config.app.matrix.size; j++) {
          e.grid[i][j] = 0;
        }
      }
      /*  */
      config.app.kernel.random(e.grid, true);
      config.app.kernel.random(e.grid, true);
      e.steps = 0;
    },
    "play": {
      "speed": 300,
      "auto": function () {
        const p = config.app.predict(config.app.kernel.AI, true);
        if (p !== null && config.app.kernel.AI.running) {
          config.app.matrix.cell.move(p, config.app.kernel.AI, false);
          config.app.update(config.app.kernel.AI);
          /*  */
          const speed = config.storage.read("speed") !== undefined ? parseInt(config.storage.read("speed")) : config.app.play.speed;
          window.setTimeout(function () {
            window.requestAnimationFrame(config.app.play.auto);
          }, speed);
        } else {
          window.alert("Game Over! please press on the reset button to start a new game.");
        }
      }
    },
    "predict": function (e, flag) {
      const compute = function (n) {
        if (!n.children.length) {
          return n.score;
        } else {
          let v = n.children.map(compute);
          if (n.prob) {
            return Math.max.apply(null, v);
          } else {
            let avg = 0;
            for (let i = 0; i < v.length; i++) {
              avg += n.children[i].prob * v[i];
            }
            /*  */
            return avg / (v.length / 2);
          }
        }
      };
      /*  */
      let free = config.app.matrix.cell.free(e.grid);
      let root = {"path": [], "prob": 1, "grid": e.grid, "children": []};
      /*  */
      e.depth = free > 7 ? 1 : (free > 4 ? 2 : 3);
      config.app.matrix.auto.move(root, e);
      /*  */
      if (!root.children.length) return null;
      /*  */
      let values = root.children.map(compute);
      let tmp = config.app.matrix.cell.max(values);
      /*  */
      return root.children[tmp[1]].path[0];
    },
    "update": function (e) {
      let old = 100;
      const theme = config.storage.read("theme");
      /*  */
      document.getElementById("score").style.color = "#333";
      document.getElementById("score").style.backgroundColor = "rgba(0, 0, 0, 0.50)";
      /*  */
      config.app.table.forEach(function (tr, i) {
        tr.forEach(function (elm, j) {
          let key = '';
          if (e) {
            key = parseInt(e.grid[i][j]);
            elm.textContent = key || '';
          } else {
            key = parseInt(elm.textContent);
          }
          /*  */
          let id = key > 0 ? Math.log2(key) : 0;
          if (id > 0) {
            const lightness = {'1': 85, '2': 75, '3': 65, '4': 60, '5': 55, '6': 50, '7': 45, '8': 43, '9': 40, '10': 37, '11': 35};
            const color = "hsla(" + config.app.color.HSLA.hue + ", " + config.app.color.HSLA.saturation + "%, " + lightness[id] + "%, " + config.app.color.HSLA.alphavalue + ")";
            /*  */
            elm.style.backgroundColor = color;
            elm.style.color = id > 4 ? "#fff" : "#333";
            /*  */
            if (lightness[id] < old) {
              document.getElementById("score").style.backgroundColor = color;
              document.getElementById("score").style.color = id > 4 ? "#fff" : "#333";
              old = lightness[id];
            }
          } else {
            elm.style.backgroundColor = theme === "light" ? "rgba(0, 0, 0, 0.01)" : "rgba(255, 255, 255, 0.05)";
          }
        });
      });
    },
    "start": function () {
      const main = document.getElementById("main");
      const settings = config.storage.read("storage");
      const theme = config.storage.read("theme") !== undefined ? config.storage.read("theme") : "light";
      const bestscore = config.storage.read("bestscore") + ' (' + config.storage.read("besttile") + ')';
      const toggle = config.storage.read("toggle") !== undefined ? config.storage.read("toggle") : "hide";
      /*  */
      document.documentElement.setAttribute("theme", theme);
      document.querySelector(".settings").setAttribute("toggle", toggle);
      document.getElementById("best").textContent = config.storage.read("bestscore") !== undefined ? bestscore : 0;
      document.getElementById("speed").value = config.storage.read("speed") !== undefined ? config.storage.read("speed") : config.app.play.speed;
      /*  */
      config.app.matrix.TRF = new config.app.matrix.compute(config.app.matrix.size);
      config.app.matrix.DEFAULT = config.app.matrix.DEFAULT.map(function (e) {return e.map(Math.exp)});
      /*  */
      for (let i = 0; i < config.app.matrix.size; i++) {
        const tr = document.createElement("tr");
        /*  */
        config.app.table[i] = [];
        for (let j = 0; j < config.app.matrix.size; j++) {
          config.app.table[i][j] = document.createElement("td");
          tr.appendChild(config.app.table[i][j]);
        }
        /*  */
        main.appendChild(tr);
      }
      /*  */
      if (settings !== undefined) {
        config.app.kernel.AI = settings.e;
        config.app.matrix.cell.e = settings.e;
        document.getElementById("score").textContent = settings.s;
        config.app.matrix.make(settings.p, settings.e.grid, false, "init");
        /*  */
        config.app.update(settings.e);
      } else {
        config.app.init(config.app.kernel.AI);
        config.app.update(config.app.kernel.AI);
      }
    },
    "kernel": {
      "AI": {
        "grid": [],
        "depth": 1,
        "running": false,
        "weight": [1, 1],
        "map": {
          "38": 0, 
          "39": 1, 
          "40": 2, 
          "37": 3
        }
      },
      "random": function (e, flag) {
        let r = Math.floor(Math.random() * config.app.matrix.cell.free(e)), _r = 0;
        for (let i = 0; i < e.length; i++) {
          for (let j = 0; j < e.length; j++) {
            if (config.app.table.length === 4) config.app.table[i][j].removeAttribute("type");
            /*  */
            if (!e[i][j]) {
              if (_r === r) {
                e[i][j] = Math.random() < 0.9 ? 2 : 4;
                if (config.app.table.length === 4) {
                  if (flag) {
                    config.app.table[i][j].setAttribute("type", "pop-in");
                  }
                }
              }
              _r++;
            }
          }
        }
      }
    },
    "matrix": {
      "size": 4,
      "TRF": null,
      "DEFAULT": [
        [10, 8, 7, 6.5],
        [.5, .7, 1, 3],
        [-.5, -1.5, -1.8, -2],
        [-3.8, -3.7, -3.5, -3]
      ],
      "compare": function (a, b) {
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < a.length; j++) {
            if (a[i][j] !== b[i][j]) {
              return false;
            }
          }
        }
        /*  */
        return true;
      },
      "max": function (e) {
        if (e) {
          let max = -1;
          for (let i = 0; i < config.app.matrix.size; i++) {
            if (e[i]) {
              for (let j = 0; j < config.app.matrix.size; j++) {
                if (e[i][j] > max) max = e[i][j];
              }
            }
          }
          /*  */
          let bestscore = parseInt(config.storage.read("besttile"));
          config.storage.write("besttile", bestscore ? (max > bestscore ? max : bestscore) : max);
        }
      },
      "statistics": function (c, p) {
        const dot2 = function (a, b) {
          let r = 0;
          for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < a[0].length; j++) {
              r += a[i][j] * b[i][j];
            }
          }
          /*  */
          return r;
        };
        /*  */
        let free = config.app.matrix.cell.free(c);
        c = dot2(c, config.app.matrix.DEFAULT);
        return [c, free * free];
      },
      "compute": function (n) {
        let tmp_a = [], tmp_b = [];
        for (let i = 0; i < n; i++) {
          tmp_a[i] = [];
          tmp_b[i] = [];
          /*  */
          for (let j = 0; j < n; j++) {
            tmp_a[i][j] = [[j, i], [i, n-1-j], [j, n-1-i], [i, j]];
            tmp_b[i][j] = [[j, i], [i, n-1-j], [n-1-j, i], [i, j]];
          }
        }
        /*  */
        this.copy = function (e) {return this.transform(3, e)};
        this.transform = function (k, e) {return this.transformer(k, e, tmp_a)};
        this.itransform = function (k, e) {return this.transformer(k, e, tmp_b)};
        this.transformer = function (k, e, m) {
          let result = [];
          for (let i = 0; i < e.length; i++) {
            result[i] = [];
            for (let j = 0; j < e.length; j++) {
              result[i][j] = e[m[i][j][k][0]][m[i][j][k][1]];
            }
          }
          /*  */
          return result;
        }
      },
      "auto": {
        "random": function (node, e) {
          let tmp = 0;
          for (let i = 0; i < node.grid.length; i++) {
            for (let j = 0; j < node.grid.length; j++) {
              if (!node.grid[i][j]) {
                let grid2 = config.app.matrix.TRF.copy(node.grid);
                let grid4 = config.app.matrix.TRF.copy(node.grid);
                grid2[i][j] = 2;
                grid4[i][j] = 4;
                /*  */
                let child2 = {"grid": grid2, "prob": 0.9, "path": node.path, "children": []};
                let child4 = {"grid": grid4, "prob": 0.1, "path": node.path, "children": []};
                node.children.push(child2);
                node.children.push(child4);
                /*  */
                tmp += config.app.matrix.auto.move(child2, e);
                tmp += config.app.matrix.auto.move(child4, e);
              }
            }
          }
          /*  */
          return tmp;
        },
        "move": function (node, e) {
          let flag = true, tmp = 0;
          if (node.path.length < e.depth) {
            for (let i of [0, 1, 2, 3]) {
              let grid = config.app.matrix.make(i, node.grid, false, "auto");
              if (!config.app.matrix.compare(grid, node.grid)) {
                flag = false;
                const child = {"grid": grid, "path": node.path.concat([i]), "children": []};
                node.children.push(child);
                tmp += config.app.matrix.auto.random(child, e);
              }
            }
          }
          /*  */
          if (flag) node.score = config.app.matrix.cell.cross(e.weight, config.app.matrix.statistics(node.grid));
          return flag ? 1 : tmp;
        }
      },
      "cell": {
        'e': null,
        "TIMEOUT": null,
        "free": function (e) {
          return e.reduce(function(v, a) {
            return v + a.reduce(function(t, x) {
              return t + (x === 0);
            }, 0);
          }, 0);
        },
        "cross": function (a, b) {
          let r = 0;
          for (let i = 0; i < a.length; i++) r += a[i] * b[i];
          return r;
        },
        "max": function (e) {
          let m = [-Infinity, null];
          for (let i = 0; i < e.length; i++) {
            if (e[i] > m[0]) m = [e[i], i];
          }
          return m;
        },
        "move": function (p, e, flag) {
          let grid = config.app.matrix.make(p, e.grid, flag, "move");
          if (!config.app.matrix.compare(grid, e.grid)) {
            /*  */
            config.storage.write("N_state", {'p': p, "grid": grid});
            config.storage.write("O_state", {'p': p, "grid": e.grid});
            config.app.matrix.cell.e = e;
            /*  */
            e.grid = grid;
            try {
              config.app.kernel.random(e.grid, flag);
              e.steps++;
            } catch (e) {
              if (config.LOG) {
                console.error("Error!", e);
              }
            }
          } else {
            if (flag) {
              if (config.app.matrix.cell.TIMEOUT) window.clearTimeout(config.app.matrix.cell.TIMEOUT);
              config.app.matrix.cell.TIMEOUT = window.setTimeout(function () {
                const p = config.app.predict(config.app.kernel.AI, false);
                if (p === null) {
                  window.alert("Game Over! please press on the reset button to start a new game.");
                }
              }, 1000);
            }
          }
          /*  */
          if (flag) {
            const s = document.getElementById("score").textContent;
            config.storage.write("storage", {
              'e': e, 
              'p': p, 
              's': s
            });
          }
        }
      },
      "make": function (k, e, highlight, loc) {
        let tmpObj = {};
        let tmp = config.app.matrix.TRF.itransform(k, e);
        /*  */
        for (var i = 0; i < tmp.length; i++) {
          var a = tmp[i];
          for (var j = 0, Q = 0; j < a.length; j++) {
            if (a[j]) {
              let _index = Q++;
              let _flag = j < a.length - 1 && a[j] === a[j + 1];
              /*  */
              if (highlight && loc !== "auto") {
                if (_flag) {
                  let _rand = Math.random();
                  /*  */
                  a[_index] = _rand;
                  let _value = 2 * a[++j];
                  tmpObj[_rand] = {"value": _value, "index": _index};
                } else {
                  a[_index] = a[j];
                }
              } else {
                a[_index] = _flag ? (2 * a[++j]) : a[j];
              }
            }
          }
          /*  */
          for (; Q < a.length; Q++) a[Q] = 0;
        }
        /*  */
        let result = config.app.matrix.TRF.transform(k, tmp);
        let key = parseInt(document.getElementById("score").textContent);
        /*  */
        if (highlight && loc !== "auto") {
          let tmparr = [];
          for (let w1 = 0; w1 < 4; w1++) {
            for (let w2 = 0; w2 < 4; w2++) {
              config.app.table[w1][w2].removeAttribute("mode");
              for (let id in tmpObj) {
                if (result[w1][w2] + '' === id + '') {
                  result[w1][w2] = tmpObj[id].value;
                  tmparr.push(config.app.table[w1][w2]);
                  key = key ? (key + tmpObj[id].value) : tmpObj[id].value;
                  break;
                }
              }
            }
          }
          /*  */
          window.setTimeout(function () {
            for (let i = 0; i < tmparr.length; i++) {
              tmparr[i].setAttribute("mode", "pop-out");
            }
          }, 100);
          /*  */
          config.app.matrix.max(result);
          const bestscore = parseInt(config.storage.read("bestscore"));
          config.storage.write("bestscore", bestscore ? (key > bestscore ? key : bestscore) : key);
          document.getElementById("best").textContent = config.storage.read("bestscore") + ' (' + config.storage.read("besttile") + ')';
          document.getElementById("score").textContent = key;
        }
        /*  */
        return result;
      }
    }
  }  
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
