const loadView = () => {
  document.getElementById("title").innerHTML = localization["Intro"]["Title"];

  // Fill the content area
  var content = "<p>" + localization["Intro"]["Description"] + "</p>";
  content += `<form id="setupForm">
  <div class="error"></div>
  <div>
  <label for="name">${localization["Intro"]["Name"]}: </label>
  <input
    type="text"
    name="name"
    id="name"
    placeholder="${localization["Intro"]["NamePlaceholder"]}"
  />
  </div>
  <div>
  <label for="email">${localization["Intro"]["Email"]}: </label>
  <input type="email" name="email" id="email" placeholder="${localization["Intro"]["EmailPlaceholder"]}" />
  </div>
  <div>
  <label for="password">${localization["Intro"]["Password"]}: </label>
  <input
    type="password"
    name="password"
    id="password"
    placeholder="${localization["Intro"]["PasswordPlaceholder"]}"
  />
  </div>
  <div>
  <input type="submit" value="${localization["Intro"]["Save"]}" />
  </div>
  </form>`;

  content +=
    "<div class='button-transparent' id='close'>" +
    localization["Intro"]["Close"] +
    "</div>";
  document.getElementById("content").innerHTML = content;

  const form = document.getElementById("setupForm");
  debugger;
  if (form.attachEvent) {
    form.attachEvent("submit", processForm);
  } else {
    form.addEventListener("submit", processForm);
  }
};

const showError = (errorMessage) => {
  document.getElementsByClassName("error")[0].innerText = errorMessage;
};
const processForm = (e) => {
  debugger;
  if (e.preventDefault) e.preventDefault();
  /* do what you want with the form */
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  var tado = new Tado(email, password);
  tado.getRoomsConfiguration(function (isValid, result) {
    if (!isValid) {
      showError("Error on the connection. Review the connection data");
      return false;
    }
    if (!result) {
      showError("Error on the connection. Review the connection data");
    } else {
      detail = {
        detail: {
          name: name,
          email: email,
          password: password,
          zones: result,
        },
      };

      // You must return false to prevent the default form behavior
      var event = new CustomEvent("saveConfig", detail);
      window.opener.document.dispatchEvent(event);
      close();
    }
    return false;
  });
};
