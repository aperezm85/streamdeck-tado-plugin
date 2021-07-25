// Prototype which represents a power action
function PowerAction(inContext, inSettings) {
  // Init PowerAction
  var instance = this;

  // Inherit from Action
  Action.call(this, inContext, inSettings);

  // Update the state
  updateState();

  // Public function called on key up event
  this.onKeyUp = function (
    inContext,
    inSettings,
    inCoordinates,
    inUserDesiredState,
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

  // Before overwriting parent method, save a copy of it
  var actionNewCacheAvailable = this.newCacheAvailable;

  // Public function called when new cache is available
  this.newCacheAvailable = function (inCallback) {
    // Call actions newCacheAvailable method
    actionNewCacheAvailable.call(instance, function () {
      // Update the state
      updateState();

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

    // Check if a light was set for this action
    if (!("room" in settings)) {
      return;
    }

    // Find out if it is a light or a group
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
}
