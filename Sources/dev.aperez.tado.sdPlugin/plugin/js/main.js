// Global web socket
var websocket = null;

// Global cache
var cache = {};

// Global settings
var globalSettings = {};

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(
  inPort,
  inPluginUUID,
  inRegisterEvent,
) {
  // Create array of currently used actions
  var actions = {};

  // Create a cache
  cache = new Cache();

  // Open the web socket to Stream Deck
  // Use 127.0.0.1 because Windows needs 300ms to resolve localhost
  websocket = new WebSocket("ws://127.0.0.1:" + inPort);

  // Web socket is connected
  websocket.onopen = function () {
    // Register plugin to Stream Deck
    registerPluginOrPI(inRegisterEvent, inPluginUUID);

    // Request the global settings of the plugin
    requestGlobalSettings(inPluginUUID);
  };

  // Add event listener
  document.addEventListener(
    "newCacheAvailable",
    function () {
      // When a new cache is available
      Object.keys(actions).forEach(function (inContext) {
        // Inform all used actions that a new cache is available
        actions[inContext].newCacheAvailable(function () {
          var action;

          // Find out type of action
          if (actions[inContext] instanceof PowerAction) {
            action = "dev.aperez.tado.power";
          }
          if (actions[inContext] instanceof StatusAction) {
            action = "dev.aperez.tado.status";
          }
          // Inform PI of new cache
          sendToPropertyInspector(action, inContext, cache.data);
        });
      });
    },
    false
  );

  // Web socked received a message
  websocket.onmessage = function (inEvent) {
    // Parse parameter from string to object
    var jsonObj = JSON.parse(inEvent.data);

    // Extract payload information
    var event = jsonObj["event"];
    var action = jsonObj["action"];
    var context = jsonObj["context"];
    var jsonPayload = jsonObj["payload"];
    var settings;

    // Key up event
    if (event === "keyUp") {
      settings = jsonPayload["settings"];
      var coordinates = jsonPayload["coordinates"];
      var userDesiredState = jsonPayload["userDesiredState"];
      var state = jsonPayload["state"];

      // Send onKeyUp event to actions
      if (context in actions) {
        actions[context].onKeyUp(
          context,
          settings,
          coordinates,
          userDesiredState,
          state
        );
      }

      // Refresh the cache
      cache.refresh();
    } else if (event === "willAppear") {
      settings = jsonPayload["settings"];

      // If this is the first visible action
      if (Object.keys(actions).length === 0) {
        // Start polling
        cache.startPolling();
      }

      // Add current instance is not in actions array
      if (!(context in actions)) {
        // Add current instance to array
        if (action === "dev.aperez.tado.power") {
          actions[context] = new PowerAction(context, settings);
        }
        if (action === "dev.aperez.tado.status") {
          actions[context] = new StatusAction(context, settings);
        }
      }
    } else if (event === "willDisappear") {
      // Remove current instance from array
      if (context in actions) {
        delete actions[context];
      }

      // If this is the last visible action
      if (Object.keys(actions).length === 0) {
        // Stop polling
        cache.stopPolling();
      }
    } else if (event === "didReceiveGlobalSettings") {
      // Set global settings
      globalSettings = jsonPayload["settings"];

      // If at least one action is active
      if (Object.keys(actions).length > 0) {
        // Refresh the cache
        cache.refresh();
      }
    } else if (event === "didReceiveSettings") {
      settings = jsonPayload["settings"];

      // Set settings
      if (context in actions) {
        actions[context].setSettings(settings);
      }

      if (action === "dev.aperez.tado.power") {
        if (context in actions) {
          actions[context].refreshStatus(context);
        }
      }

      // Refresh the cache
      cache.refresh();
    } else if (event === "propertyInspectorDidAppear") {
      // Send cache to PI
      sendToPropertyInspector(action, context, cache.data);
    } else if (event === "sendToPlugin") {
      var piEvent = jsonPayload["piEvent"];
      // if (piEvent === 'valueChanged') {
      //   if (action === "dev.aperez.tado.power") {
      //     if (context in actions) {
      //       actions[context].onWillAppear(context);
      //     }
      //   }
      // }
    }
  };
}
