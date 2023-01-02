function Tado(username = null, password = null) {
  this.instance = null;

  this.getUsername = function () {
    return username;
  };
  this.getPassword = function () {
    return password;
  };


  this.testAccess = function (callback) {
    if (username && password) {
      const data = new FormData();
      data.append("client_id", "tado-web-app");
      data.append(
        "client_secret",
        "wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc"
      );
      data.append("grant_type", "password");
      data.append("password", password);
      data.append("scope", "home.user");
      data.append("username", username);

      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.onload = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          if (xhr.response !== undefined && xhr.response != null) {
            var result = JSON.parse(xhr.response);
            if ("access_token" in result) {
              callback(true, '');
            } else {
              var message = result["error"]["description"];
              callback(false, message);
            }
          } else {
            callback(false, "Tado response is undefined or null.");
          }
        } else {
          callback(false, `Could not connect to tado. ${xhr.response}`);
        }
      };

      xhr.onerror = function () {
        callback(false, "Unable to connect to tado.");
      };

      xhr.ontimeout = function () {
        callback(false, "Connection to tado timed out.");
      };

      xhr.open("POST", "https://auth.tado.com/oauth/token");

      xhr.send(data);
    }
  }


  function getAccessToken(callback) {
    if (username && password) {
      const data = new FormData();
      data.append("client_id", "tado-web-app");
      data.append(
        "client_secret",
        "wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc"
      );
      data.append("grant_type", "password");
      data.append("password", password);
      data.append("scope", "home.user");
      data.append("username", username);

      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.onload = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          if (xhr.response !== undefined && xhr.response != null) {
            var result = JSON.parse(xhr.response);
            if ("access_token" in result) {
              callback(true, result.access_token);
            } else {
              var message = result["error"]["description"];
              callback(false, message);
            }
          } else {
            callback(false, "Tado response is undefined or null.");
          }
        } else {
          callback(false, "Could not connect to tado.");
        }
      };

      xhr.onerror = function () {
        callback(false, "Unable to connect to tado.");
      };

      xhr.ontimeout = function () {
        callback(false, "Connection to tado timed out.");
      };

      xhr.open("POST", "https://auth.tado.com/oauth/token");

      xhr.send(data);
    }
  }

  function getHomeId(access_token, callback) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.responseType = "json";
    xhr.onload = function () {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        if (xhr.response !== undefined && xhr.response != null) {
          var result = xhr.response;

          if ("homeId" in result) {
            callback(true, result.homeId);
          } else {
            var message = result["error"]["description"];
            callback(false, message);
          }
        } else {
          callback(false, "Tado response is undefined or null.");
        }
      } else {
        callback(false, "Could not connect to tado.");
      }
    };

    xhr.onerror = function () {
      callback(false, "Unable to connect to tado.");
    };

    xhr.ontimeout = function () {
      callback(false, "Connection to tado timed out.");
    };

    xhr.open("GET", "https://my.tado.com/api/v1/me");
    xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);

    xhr.send();
  }

  function getZones(callback) {
    getAccessToken(function (isValid, access_token) {
      if (!isValid || !access_token) return callback(false, null);
      getHomeId(access_token, function (isValid, homeId) {
        if (!isValid || !access_token) return callback(false, null);
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.responseType = "json";
        xhr.onload = function () {
          if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            if (xhr.response !== undefined && xhr.response != null) {
              var result = xhr.response;

              callback(true, result);
            } else {
              callback(false, "Tado response is undefined or null.");
            }
          } else {
            callback(false, "Could not connect to tado.");
          }
        };

        xhr.onerror = function () {
          callback(false, "Unable to connect to tado.");
        };

        xhr.ontimeout = function () {
          callback(false, "Connection to tado timed out.");
        };
        xhr.open("GET", `https://my.tado.com/api/v2/homes/${homeId}/zones`);
        xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);

        xhr.send();
      });
    });
  }

  this.getRoomsConfiguration = function (callback) {
    getZones(function (isValid, zones) {
      if (!isValid || !zones) return callback(false, null);
      const config = zones.reduce((acc, zone) => {
        if (zone.type === "HEATING") {
          return acc.concat({ id: zone.id, name: zone.name });
        }
        return acc;
      }, []);
      callback(true, config);
    });
  };

  this.setPower = function (
    targetState,
    room,
    temperature = 22,
    units,
    callback
  ) {
    getAccessToken(function (isValid, access_token) {
      if (!isValid || !access_token) return callback(false, null);
      getHomeId(access_token, function (isValid, homeId) {
        if (!isValid || !access_token) return callback(false, null);

        let data = {};
        if (!targetState) {
          data = JSON.stringify({
            termination: { typeSkillBasedApp: "MANUAL" },
            setting: { type: "HEATING", power: "OFF" },
          });
        } else {
          var temp = { celsius: temperature };
          if (units === "fahrenheit") {
            temp = { fahrenheit: temperature };
          }
          data = JSON.stringify({
            termination: { typeSkillBasedApp: "MANUAL" },
            setting: {
              type: "HEATING",
              power: "ON",
              temperature: temp,
            },
          });
        }

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.responseType = "json";
        xhr.onload = function () {
          if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            if (xhr.response !== undefined && xhr.response != null) {
              var result = xhr.response;

              callback(true, result);
            } else {
              callback(false, "Tado response is undefined or null.");
            }
          } else {
            callback(false, "Could not connect to tado.");
          }
        };

        xhr.onerror = function () {
          callback(false, "Unable to connect to tado.");
        };

        xhr.ontimeout = function () {
          callback(false, "Connection to tado timed out.");
        };
        xhr.open(
          "PUT",
          `https://my.tado.com/api/v2/homes/${homeId}/zones/${room}/overlay`
        );
        xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.send(data);
      });
    });
  };

  this.checkStatus = function (room, callback) {
    getAccessToken(function (isValid, access_token) {
      if (!isValid || !access_token) return callback(false, null);
      getHomeId(access_token, function (isValid, homeId) {
        if (!isValid || !access_token) return callback(false, null);

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.responseType = "json";
        xhr.onload = function () {
          if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            if (xhr.response !== undefined && xhr.response != null) {
              var result = xhr.response;
              callback(true, result);
            } else {
              callback(false, "Tado response is undefined or null.");
            }
          } else {
            callback(false, "Could not connect to tado.");
          }
        };

        xhr.onerror = function () {
          callback(false, "Unable to connect to tado.");
        };

        xhr.ontimeout = function () {
          callback(false, "Connection to tado timed out.");
        };
        xhr.open(
          "GET",
          `https://my.tado.com/api/v2/homes/${homeId}/zones/${room}/overlay`
        );
        xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);

        xhr.send();
      });
    });
  };

  this.checkStatusRoom = function (room, callback) {
    getAccessToken(function (isValid, access_token) {
      if (!isValid || !access_token) return callback(false, null);
      getHomeId(access_token, function (isValid, homeId) {
        if (!isValid || !access_token) return callback(false, null);

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.responseType = "json";
        xhr.onload = function () {
          if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            if (xhr.response !== undefined && xhr.response != null) {
              var result = xhr.response;
              var temperature = result.sensorDataPoints.insideTemperature;
              callback(true, temperature);
            } else {
              callback(false, "Tado response is undefined or null.");
            }
          } else {
            callback(false, "Could not connect to tado.");
          }
        };

        xhr.onerror = function () {
          callback(false, "Unable to connect to tado.");
        };

        xhr.ontimeout = function () {
          callback(false, "Connection to tado timed out.");
        };
        xhr.open(
          "GET",
          `https://my.tado.com/api/v2/homes/${homeId}/zones/${room}/state`
        );
        xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);

        xhr.send();
      });
    });
  };
}
