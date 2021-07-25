// Global variable containting the localizations
let localization = null;

// Global variable containing the discovered termostast
let termostats = [];

// Current termostat paired
let termostat = null;

window.onload = () => {
  const close = () => {
    window.close();
  };

  // Bind enter and ESC keys
  document.addEventListener("keydown", (e) => {
    let key;

    if (e.key !== undefined) {
      key = e.key;
    } else if (e.keyIdentifier !== undefined) {
      key = e.keyIdentifier;
    } else if (e.keyCode !== undefined) {
      key = e.keyCode;
    }

    if (key === 27) {
      close();
    }
  });

  // Get the url parameter
  const url = new URL(window.location.href);
  const language = url.searchParams.get("language") || "en";
  // Load the localizations
  getLocalization(language, (inStatus, inLocalization) => {
    if (inStatus) {
      // Save the localizations globally
      localization = inLocalization["Setup"];
      // Show the intro view
      loadView();
    } else {
      getLocalization("en", (inStatus, inLocalization) => {
        if (inStatus) {
          // Save the localizations globally
          localization = inLocalization["Setup"];
          // Show the intro view
          loadView();
        } else {
          console.log(inStatus);
          document.getElementById("content").innerHTML =
            "<p>" + inLocalization + "</p>";
        }
      });
    }
  });
};
