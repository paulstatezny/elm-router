module.exports = {
  logFor: logFor,
  debug: debug
};

let debugMode = false;
let logWhitelist = null;

/**
 * Log a ports action if debug mode is on.
 *
 * @param {String} elmAppName    The name of the Elm app associated with the port call being logged
 * @param {String} portName      The name of the port being logged
 * @param {...*}   [logItems] Other items to be logged
 */
function log(elmAppName, portName) {
  if (debugMode === false) {
    return;
  }

  if (logWhitelist
      && logWhitelist.indexOf(portName.split(" ")[0]) == -1
      && logWhitelist.indexOf(elmAppName) == -1) {
    // Bail; the log whitelist is set and this message is not on the list
    return;
  }

  let args = Array.from(arguments)
    .slice(2) // Ignore elmAppName and portName
    .map(arg => {
      switch (arg) {
        case null:
          return "[null]";

        case undefined:
          return "[undefined]";

        case "":
          return "[empty string]";

        default:
          return arg;
      }
    });

  const app = elmAppName ? `[${elmAppName}]` : "";

  console.group(`${app} ${portName}`);
  args.forEach(arg => console.log(arg));
  console.groupEnd();
}

/**
 * Curry `log` with an elmAppName.
 *
 * @param  {String} elmAppName The name of an Elm app
 * @return {Function}
 */
function logFor(elmAppName) {
  return log.bind(null, elmAppName);
}

/**
 * Enable/disable debug mode which will turn on logging.
 *
 *   E.g.:
 *   require("./ports/log").debug();
 *   require("./ports/log").debug("addClass", "historyGoBack");
 *
 * @param {...String} [messages] Messages or Elm App names to display (e.g. "addClass", "historyPush", "GeoSuggest")
 */
function debug() {
  debugMode = true;

  logWhitelist = Array.prototype.slice.call(arguments);

  if (!logWhitelist.length) {
    logWhitelist = null;
  }
}
