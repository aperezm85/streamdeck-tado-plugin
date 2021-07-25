// Protoype for a data cache
function Cache() {
  // Init Cache
  var instance = this;

  // Refresh time of the cache  in seconds
  var autoRefreshTime = 60;

  // Private timer instance
  var timer = null;

  // Private bridge discovery
  var discovery = null;

  // Public variable containing the cached data
  this.data = {};

  // Public function to start polling
  this.startPolling = function () {
    // Log to the global log file
    log("Start polling to create cache");

    // Start a timer
    instance.refresh();
    timer = setInterval(instance.refresh, autoRefreshTime * 1000);
  };

  // Public function to stop polling
  this.stopPolling = function () {
    // Log to the global log file
    log("Stop polling to create cache");

    // Invalidate the timer
    clearInterval(timer);
    timer = null;
  };

  // Private function to build a cache
  this.refresh = function () {
    // Build discovery if necessary
    // buildDiscovery(function (inSuccess) {
    inSuccess = true;
    // If discovery was not successful
    if (!inSuccess) {
      return;
    }

    // If no bridge is paired
    if (globalSettings.configs === undefined) {
      return;
    }

    Object.keys(globalSettings.configs).forEach(function (inConfig) {
      instance.data[inConfig] = globalSettings.configs[inConfig];
      const tado = new Tado(
        globalSettings.configs[inConfig].email,
        globalSettings.configs[inConfig].password
      );
      globalSettings.configs[inConfig].zones.forEach(function (zone, index) {
        tado.checkStatus(zone.id, function (isValid, result) {
          instance.data[inConfig].zones[index].power =
            result.setting.power === "ON";
          var event = new CustomEvent("newCacheAvailable");
          document.dispatchEvent(event);
        });
      });
    });
  };
}
