var app = {};

app.version = function () {return chrome.runtime.getManifest().version};
app.homepage = function () {return chrome.runtime.getManifest().homepage_url};
app.tab = {"open": function (url) {chrome.tabs.create({"url": url, "active": true})}};

if (!navigator.webdriver) {
  chrome.runtime.setUninstallURL(app.homepage() + "?v=" + app.version() + "&type=uninstall", function () {});
  chrome.runtime.onInstalled.addListener(function (e) {
    window.setTimeout(function () {
      var previous = e.previousVersion !== undefined && e.previousVersion !== app.version();
      if (e.reason === "install" || (e.reason === "update" && previous)) {
        var parameter = (e.previousVersion ? "&p=" + e.previousVersion : '') + "&type=" + e.reason;
        app.tab.open(app.homepage() + "?v=" + app.version() + parameter);
      }
    }, 3000);
  });
}

app.UI = {
  "id": null,
  "parent": {"id": null},
  "create": function () {
    chrome.storage.local.get({"width": 500, "height": 650}, function (storage) {
      chrome.windows.getCurrent(function (win) {
        app.UI.parent.id = win.id;
        var width = storage.width;
        var height = storage.height;
        var top = win.top + Math.round((win.height - height) / 2);
        var left = win.left + Math.round((win.width - width) / 2);
        var url = chrome.runtime.getURL("data/interface/index.html");
        chrome.windows.create({'url': url, 'type': 'popup', 'width': width, 'height': height, 'top': top, 'left': left}, function (w) {
          app.UI.id = w.id;
        });
      });
    });
  }
};

chrome.windows.onRemoved.addListener(function (e) {if (e === app.UI.id) {app.UI.id = null}});

chrome.browserAction.onClicked.addListener(function () {
  app.UI.id ? chrome.windows.update(app.UI.id, {"focused": true}) : app.UI.create();
});
