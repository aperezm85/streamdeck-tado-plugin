// Prototype which represents a status action
function StatusAction(inContext, inSettings) {
  // Init StatusAction
  var instance = this;

  // Inherit from Action
  Action.call(this, inContext, inSettings);

  // Update the state
  getStatus();

  // Public function called on key up event
  this.onWillAppear = function (inContext, inSettings) {
    // Check if any room is configured
    if (!("config" in inSettings)) {
      log("No config configured");
      showAlert(inContext);
      return;
    }

    // Check if the configured room is in the cache
    if (!(inSettings.config in cache.data)) {
      log("Config " + inSettings.config + " not found in cache");
      showAlert(inContext);
      return;
    }

    // Find the configured settings
    var configCache = cache.data[inSettings.config];

    // Check if any room is configured
    if (!("room" in inSettings)) {
      log("No room configured");
      showAlert(inContext);
      return;
    }

    // Create a room instance
    var tado = new Tado(configCache.email, configCache.password);
    // Het Room status
    tado.checkStatusRoom(inSettings.room, function (success, result) {
      if (success) {
        setTitle(inContext, result.celsius + "°C");
      } else {
        log(result);
        setTitle(inContext, "-");
        showAlert(inContext);
      }
    });
  };

  this.onKeyUp = function (inContext, inSettings) {
    // Check if any room is configured
    if (!("config" in inSettings)) {
      log("No config configured");
      showAlert(inContext);
      return;
    }

    // Check if the configured room is in the cache
    if (!(inSettings.config in cache.data)) {
      log("Config " + inSettings.config + " not found in cache");
      showAlert(inContext);
      return;
    }

    // Find the configured settings
    var configCache = cache.data[inSettings.config];

    // Check if any room is configured
    if (!("room" in inSettings)) {
      log("No room configured");
      showAlert(inContext);
      return;
    }

    // Create a room instance
    var tado = new Tado(configCache.email, configCache.password);
    // Het Room status
    tado.checkStatusRoom(inSettings.room, function (success, result) {
      if (success) {
        setTitle(inContext, result.celsius + "°C");
      } else {
        log(result);
        setTitle(inContext, "-");
        showAlert(inContext);
      }
    });
  };

  // Before overwriting parent method, save a copy of it
  var actionNewCacheAvailable = this.newCacheAvailable;

  // Public function called when new cache is available
  this.newCacheAvailable = function (inCallback) {
    // Call actions newCacheAvailable method
    actionNewCacheAvailable.call(instance, function () {
      // Update the state
      getStatus();

      // Call the callback function
      inCallback();
    });
  };

  function getStatus() {
    // Get the settings and the context
    var settings = instance.getSettings();
    var context = instance.getContext();
    // Check if any bridge is configured
    if (!("config" in settings)) {
      return;
    }

    // Check if the configured bridge is in the cache
    if (!(settings.config in cache.data)) {
      return;
    }
    // Find the configured bridge
    var configCache = cache.data[settings.config];

    // Create a room instance
    var tado = new Tado(configCache.email, configCache.password);
    // Get Room status
    tado.checkStatusRoom(settings.room, function (success, result) {
      if (success) {
        setTitle(context, result.celsius + "°C");
      } else {
        log(result);
        setTitle(context, "-");
        showAlert(context);
      }
    });
  }
}
