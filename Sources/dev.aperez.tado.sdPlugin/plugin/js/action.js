function Action(inContext, inSettings) {
  // Init Action
  var instance = this;

  // Private variable containing the context of the action
  var context = inContext;

  // Private variable containing the settings of the action
  var settings = inSettings;

  // Set the default values
  setDefaults();

  // Public function returning the context
  this.getContext = function () {
    return context;
  };

  // Public function returning the settings
  this.getSettings = function () {
    return settings;
  };

  // Public function for settings the settings
  this.setSettings = function (inSettings) {
    settings = inSettings;
  };

  // Public function called when new cache is available
  this.newCacheAvailable = function (inCallback) {
    // Set default settings
    setDefaults(inCallback);
  };

  // Private function to set the defaults
  function setDefaults(inCallback) {
    // If at least one bridge is paired
    if (!(Object.keys(cache.data).length > 0)) {
      // If a callback function was given
      if (inCallback !== undefined) {
        // Execute the callback function
        inCallback();
      }
      return;
    }

    // Find out type of action
    var action;
    if (instance instanceof PowerAction) {
      action = "dev.aperez.tado.power";
    }
    if (instance instanceof StatusAction) {
      action = "dev.aperez.tado.status";
    }

    // If no config is set for this action
    if (!("config" in settings)) {
      // Sort the config alphabetically
      var configs = Object.keys(cache.data).sort(function (a, b) {
        return cache.data[a].name.localeCompare(cache.data[b].name);
      });

      // Set the configs automatically to the first one
      settings.config = configs[0];

      // Save the settings
      saveSettings(action, inContext, settings);
    }

    // Find the configured config
    var configCache = cache.data[settings.config];
    // If no rooms is set for this action
    if (!("room" in settings)) {
      // First try to set a group, because scenes only support groups
      // If the bridge has at least one group
      if (Object.keys(configCache.zones).length > 0) {
        // Sort the groups automatically
        var groupIDsSorted = Object.keys(configCache.zones).sort(function (
          a,
          b
        ) {
          return configCache.zones[a].name.localeCompare(
            configCache.zones[b].name
          );
        });

        // Set the light automatically to the first group
        settings.room = groupIDsSorted[0];

        // Save the settings
        saveSettings(action, inContext, settings);
      }
    }

    // If a callback function was given
    if (inCallback !== undefined) {
      // Execute the callback function
      inCallback();
    }
  }
}
