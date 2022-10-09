function PI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
  var instance = this;

  // Public localizations for the UI
  this.localization = {};

  // add event listener
  document
    .getElementById("config-select")
    .addEventListener("change", configChanged);
  document
    .getElementById("room-select")
    .addEventListener("change", roomChanged);

  // document
  //   .getElementById("temperature")
  //   .addEventListener("change", tempChanged);

  document.addEventListener("saveConfig", setupCallback);

  getLocalization(inLanguage || "en", function (inStatus, inLocalization) {
    if (inStatus) {
      // Save the localizations globally
      instance.localization = inLocalization["PI"];
      // Show the intro view
      instance.localize();
    } else {
      log(inLocalization);
    }
  });

  // Localize the UI
  this.localize = function () {
    // Check if localizations were loaded
    if (instance.localization == null) {
      return;
    }
    document.getElementById("config-label").innerHTML =
      instance.localization["Config"];
    document.getElementById("no-configs").innerHTML =
      instance.localization["NoConfigs"];
    document.getElementById("add-config").innerHTML =
      instance.localization["AddConfig"];

    document.getElementById("room-label").innerHTML =
      instance.localization["Room"];
    document.getElementById("no-rooms").innerHTML =
      instance.localization["NoRooms"];

    document.getElementById("temperature-label").innerHTML =
      instance.localization["Temperature"];

    document.getElementById("units-label").innerHTML =
      instance.localization["Units"];
    document.getElementById("message-label").innerHTML =
      instance.localization["Message"];
  };

  // show all loaded configurations
  this.loadConfigurations = function () {
    // Remove previous shown configs
    const configs = document.getElementsByClassName("configs");
    while (configs.length > 0) {
      configs[0].parentNode.removeChild(configs[0]);
    }

    // Check if any configuration is stored
    if (Object.keys(cache).length > 0) {
      document.getElementById("no-configs").style.display = "none";

      // Sort the configurations alphabetically
      var configIDsSorted = Object.keys(cache).sort(function (a, b) {
        return cache[a].name.localeCompare(cache[b].name);
      });

      // Add the configurations
      configIDsSorted.forEach(function (inConfigId) {
        // Add the group
        var option =
          "<option value='" +
          inConfigId +
          "' class='configs'>" +
          cache[inConfigId].name +
          "</option>";
        document
          .getElementById("no-configs")
          .insertAdjacentHTML("beforebegin", option);
      });

      // Check if the config is already configured
      if (settings.config !== undefined) {
        // Select the currently configured bridge
        document.getElementById("config-select").value = settings.config;
      }
      // Load the rooms
      loadRooms();
    } else {
      // Show the 'No Bridges' option
      document.getElementById("no-configs").style.display = "block";
    }
    // Show PI
    document.getElementById("pi").style.display = "block";
  };

  // Show all rooms
  function loadRooms() {
    // Check if any bridge is configured
    if (!("config" in settings)) {
      return;
    }

    // Check if the configured bridge is in the cache
    if (!(settings.config in cache)) {
      return;
    }

    // Find the configured bridge
    const configCache = cache[settings.config];

    // Remove previously shown rooms
    const rooms = document.getElementsByClassName("rooms");
    while (rooms.length > 0) {
      rooms[0].parentNode.removeChild(rooms[0]);
    }

    // Check if the bridge has at least one room
    if (Object.keys(configCache.zones).length > 0) {
      // Hide the 'No room' option
      document.getElementById("no-rooms").style.display = "none";

      // Sort the rooms alphabetically
      const roomIDsSorted = Object.keys(configCache.zones).sort((a, b) => {
        return configCache.zones[a].name.localeCompare(
          configCache.zones[b].name
        );
      });

      // Add the rooms
      roomIDsSorted.forEach((inRoomID) => {
        const zone = configCache.zones[inRoomID];

        // Add the room
        var option =
          "<option value='" +
          zone.id +
          "' class='rooms'>" +
          zone.name +
          "</option>";
        document
          .getElementById("no-rooms")
          .insertAdjacentHTML("beforebegin", option);
      });
    } else {
      // Show the 'No Rooms' option
      document.getElementById("no-rooms").style.display = "block";
    }

    // Check if a room is already setup
    if (settings.room !== undefined) {
      // Select the currently configured room or group
      document.getElementById("room-select").value = settings.room;

      // Dispatch room change event manually
      // So that the colorPI can set the correct color picker at initialization
      document
        .getElementById("room-select")
        .dispatchEvent(new CustomEvent("change", { detail: { manual: true } }));
    }

    if (instance instanceof PowerPI) {
      //Load the temperature
      instance.loadTemp();
      instance.loadUnit();
    }
  }

  // Function called on successful config pairing
  function setupCallback(inEvent) {
    // Set config to the newly added config
    settings.config = inEvent.detail.name;
    instance.saveSettings();

    // Check if global settings need to be initialized
    if (globalSettings.configs === undefined) {
      globalSettings.configs = {};
    }

    // Add new config to the global settings
    globalSettings.configs[inEvent.detail.name] = {
      name: inEvent.detail.name,
      email: inEvent.detail.email,
      password: inEvent.detail.password,
      zones: inEvent.detail.zones,
      temperature: inEvent.detail.temperature,
      units: inEvent.detail.units,
    };
    saveGlobalSettings(inContext);
  }

  // Config select changed
  function configChanged(inEvent) {
    if (inEvent.target.value === "add") {
      // Open setup window
      window.open(
        "../setup/index.html?language=" +
        inLanguage +
        "&streamDeckVersion=" +
        inStreamDeckVersion +
        "&pluginVersion=" +
        inPluginVersion
      );

      // Select the first in case user cancels the setup
      document.getElementById("config-select").selectedIndex = 0;
    } else if (inEvent.target.value === "no-configs") {
      // If no bridge was selected, do nothing
    } else {
      settings.config = inEvent.target.value;
      instance.saveSettings();
      instance.loadConfigurations();
    }
  }

  function roomChanged(inEvent) {
    if (inEvent.target.value === "no-rooms") {
      // If no room was selected, do nothing
    } else if (inEvent.detail !== undefined) {
      // If the room was changed via code
      if (inEvent.detail.manual === true) {
        // do nothing
      }
    } else {
      settings.room = inEvent.target.value;
      instance.saveSettings();
    }
  }

  // function tempChanged(inEvent) {
  //   settings.temperature = inEvent.target.value;
  //   instance.saveSettings();
  // }

  // Private function to return the action identifier
  function getAction() {
    let action;

    // Find out type of action
    if (instance instanceof PowerPI) {
      action = "dev.aperez.tado.power";
    }
    if (instance instanceof StatusPI) {
      action = "dev.aperez.tado.status";
    }
    return action;
  }

  // Public function to save the settings
  this.saveSettings = function () {
    saveSettings(getAction(), inContext, settings);
  };

  // Public function to send data to the plugin
  this.sendToPlugin = function (inData) {
    sendToPlugin(getAction(), inContext, inData);
  };
}
