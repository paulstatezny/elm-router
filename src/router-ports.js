module.exports = {
  register: register,
  samplePortName: "routerRefresh"
};

/**
 * Subscribe the given Elm app ports to ports from the Elm Router ports module.
 *
 * @param  {Object}   ports  Ports object from an Elm app
 * @param  {Function} log    Function to log ports for the given Elm app
 */
function register(ports, log, routerPorts) {
  ports.routerRefresh.subscribe(() => {
    log("routerRefresh");
    window.location.reload();
  });

  ports.routerBack.subscribe(() => {
    routerPorts.routerReceiveCmd.send(["back", null]);
  });

  ports.routerModifyUrl.subscribe(url => {
    routerPorts.routerReceiveCmd.send(["modifyUrl", url]);
  });

  ports.routerNewUrl.subscribe(url => {
    routerPorts.routerReceiveCmd.send(["newUrl", url]);
  });

  ports.routerLaunchRoute.subscribe(routeName => {
    routerPorts.routerReceiveCmd.send(["launchRoute", routeName]);
  });

  ports.windowLocationHref.subscribe(url => {
    window.location.href = url;
  });
}
