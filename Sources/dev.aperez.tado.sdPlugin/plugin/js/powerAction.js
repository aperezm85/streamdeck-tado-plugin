// Prototype which represents a power action
function PowerAction(inContext, inSettings) {
  // Init PowerAction
  var instance = this;

  // Inherit from Action
  Action.call(this, inContext, inSettings);

  // Update the state
  updateState();
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
    // Set Room status
    tado.checkStatusRoom(inSettings.room, function (success, result) {
      if (success) {
        var temperatureText = result.celsius.toFixed(1) + "°C";
        if (settings.units === 'fahrenheit') {
          temperatureText = result.fahrenheit.toFixed(1) + "°F";
        }
        setTitle(inContext, temperatureText);
      } else {
        log(result);
        setTitle(inContext, "-");
        showAlert(inContext);
      }
    });
  };

  // Public function called on key up event
  this.onKeyUp = function (
    inContext,
    inSettings,
    inState
  ) {
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

    // Check for multi action
    var targetState;
    targetState = !configCache.zones.find(
      (z) => z.id === parseInt(inSettings.room, 10)
    ).power;

    // Set Room state
    tado.setPower(
      targetState,
      inSettings.room,
      inSettings.temperature,
      inSettings.units,
      function (success, error) {
        if (success) {
          setActionState(inContext, targetState ? 0 : 1);
        } else {
          log(error);
          setActionState(inContext, inState);
          showAlert(inContext);
        }
      }
    );
  };

  this.refreshStatus = function (inContext, inSettings) {
    getStatus();
  }


  // Before overwriting parent method, save a copy of it
  var actionNewCacheAvailable = this.newCacheAvailable;

  // Public function called when new cache is available
  this.newCacheAvailable = function (inCallback) {
    // Call actions newCacheAvailable method
    actionNewCacheAvailable.call(instance, function () {
      // Update the state
      updateState();
      getStatus();
      // Call the callback function
      inCallback();
    });
  };

  function updateState() {
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
    // Check if a room was set for this action
    if (!("room" in settings)) {
      return;
    }

    // Find out if it is a room or a group
    var objCache;
    if (settings.room) {
      objCache = configCache.zones.find(
        (z) => z.id === parseInt(settings.room, 10)
      );
    }

    // Set the target state
    var targetState = objCache.power;
    // Set the new action state
    setActionState(context, targetState ? 0 : 1);
  }

  // Private function to set the state
  function setActionState(inContext, inState) {
    setState(inContext, inState);
  }

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
        var temperatureText = result.celsius.toFixed(1) + "°C";
        if (settings.units === 'fahrenheit') {
          temperatureText = result.fahrenheit.toFixed(1) + "°F";
        }
        setTitle(context, temperatureText);
      } else {
        log(result);
        setTitle(context, "-");
        showAlert(context);
      }
    });
  }
}
