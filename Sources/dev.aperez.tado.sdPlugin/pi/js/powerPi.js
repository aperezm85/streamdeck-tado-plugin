function PowerPI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
  var instance = this;
  // Inherit from PI
  PI.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);

  // Before overwriting parrent method, save a copy of it
  var piLocalize = this.localize;

  function convertToFahrenheit(celsius) {
    return ((celsius * 9) / 5 + 32).toFixed(1);
  }

  function convertToCelsius(f) {
    return (((f - 32) * 5) / 9).toFixed(1);
  }

  function localizeLabels() {
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
  }

  function printTemperatureSlider() {
    var celsius = 22;
    var fahrenheit = 72;
    if (settings.temperature < 25) {
      celsius = settings.temperature;
      fahrenheit = convertToFahrenheit(settings.temperature);
    } else {
      fahrenheit = settings.temperature;
      celsius = convertToCelsius(settings.temperature);
    }
    if (settings.units === "fahrenheit") {
      return (
        '<div class="sdpi-item"> \
      <div type="range" class="sdpi-item" id="temperature"> \
        <div class="sdpi-item-label" id="temperature-label"></div>\
        <div class="sdpi-item-value">\
          <span class="clickable" value="41">41°F</span> \
          <input id="celsius" type="range" min="41" max="77" step="1" value=' +
        fahrenheit +
        '> \
          <span class="clickable" value="77">77°F</span> \
        </div>\
      </div>\
    </div>'
      );
    } else {
      return (
        '<div class="sdpi-item"> \
    <div type="range" class="sdpi-item" id="temperature"> \
      <div class="sdpi-item-label" id="temperature-label"></div>\
      <div class="sdpi-item-value">\
        <span class="clickable" value="5">5°C</span> \
        <input id="celsius" type="range" min="5" max="25" step="0.5" value=' +
        celsius +
        '> \
        <span class="clickable" value="25">25°C</span> \
      </div>\
    </div>\
  </div>'
      );
    }
  }

  function printPI() {
    var temperature =
      '<div class="sdpi-item"> \
      <div class="sdpi-item-label" id="units-label"></div> \
      <select class="sdpi-item-value select" id="units"> \
        <option value="celsius" default>Celsius</option> \
        <option value="fahrenheit">Fahrenheit</option> \
      </select> \
    </div>';

    var messageInfo =
      '<details class="message"> \
      <summary><span id="message-label"></span> <span id="temp">' +
      settings.temperature +
      "</span></summary>\
    </details>";

    document.getElementById("placeholder").innerHTML =
      temperature + printTemperatureSlider() + messageInfo;

    // Add event listener
    document
      .getElementById("temperature")
      .addEventListener("change", tempChanged);
    document.getElementById("units").addEventListener("change", unitChanged);
    document.getElementById("temp").innerHTML = settings.temperature;
    localizeLabels();
  }

  this.localize = function () {
    // Call PIs localize method
    piLocalize.call(instance);
    localizeLabels();
  };

  printPI();

  // Temperature changed
  function tempChanged(inEvent) {
    var temp = parseFloat(inEvent.target.value);
    if (temp) {
      settings.temperature = temp;
      document.getElementById("temp").innerHTML = temp;
      instance.saveSettings();
    }
  }

  // Units changed
  function unitChanged(inEvent) {
    var unit = inEvent.target.value || "celsius";
    if (unit) {
      settings.units = unit;
      if (unit === "fahrenheit") {
        settings.temperature = convertToFahrenheit(settings.temperature);
      } else {
        settings.temperature = convertToCelsius(settings.temperature);
      }
      printPI();
      instance.saveSettings();
    }
  }

  this.loadTemp = function () {
    if (settings.temperature !== undefined) {
      document.getElementById("temperature").value = settings.temperature;
    }
  };

  this.loadUnit = function () {
    if (settings.units !== undefined) {
      document.getElementById("units").value = settings.units;
    }
  };
}
