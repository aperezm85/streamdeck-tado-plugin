function PowerPI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
  var instance = this;
  // Inherit from PI
  PI.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);

  // Before overwriting parrent method, save a copy of it
  var piLocalize = this.localize;

  this.localize = function () {
    // Call PIs localize method
    piLocalize.call(instance);

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
  };

  var temperature =
    '<div class="sdpi-item"> \
    <div class="sdpi-item-label" id="temperature-label"></div> \
    <input \
      class="sdpi-item-value" \
      id="temperature" \
      inputmode="numeric" \
      pattern="[0-9]*" \
      type="number" \
      name="temperature" \
    /> \
  </div>';

  document.getElementById("placeholder").innerHTML = temperature;

  // Add event listener
  document.getElementById("temperature").addEventListener("keyup", tempChanged);

  // Temperature changed
  function tempChanged(inEvent) {
    var temp = parseInt(inEvent.target.value, 10);
    if (temp) {
      settings.temperature = temp;
      instance.saveSettings();
    }
  }

  this.loadTemp = function () {
    if (settings.temperature !== undefined) {
      document.getElementById("temperature").value = settings.temperature;
    }
  };
}
