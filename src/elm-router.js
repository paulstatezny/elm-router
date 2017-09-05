/**
 * ==== elm-router ====
 *
 * Launch Elm apps based on the URL path.
 */

const { logFor, debug } = require("./log-ports");
const routerPorts = require("./router-ports");
const log = logFor("ElmRouter");

module.exports = {
  start: start,
  logPorts: debug
};

/**
 * Initialize Monarch Elm app and wire up ports to it.
 *
 * @param {Object} Elm          A compiled Elm object containing Elm app launchers (objects with `embed` or `worker`)
 * @param {Array}  portModules  An array of port module objects with `register` and `samplePortName`
 */
function start(Elm, portModules) {
  const portsObjects = [];
  portModules = portModules || [];
  portModules.push(routerPorts);

  const elmRouter = worker("ElmRouter");

  elmRouter.ports.routerWorker.subscribe(
    ([name, flags]) => worker(name, flags || undefined)
  );
  elmRouter.ports.routerEmbed.subscribe(
    ([name, selector, flags]) => embed(name, selector, flags || undefined)
  );

  elmRouter.ports.routerEmbedMany.subscribe(
    ([name, selector, flags]) => embedMany(name, selector, flags || undefined)
  );

  elmRouter.ports.routerLog.subscribe(message => {
    log(message);
  });

  elmRouter.ports.routerBroadcastUrlUpdate.subscribe(broadcastUrlUpdate);

  /**
   * Launch an Elm worker app.
   *
   * @param  {String} name  The name of the Elm app
   * @param  {Object} flags
   *
   * @throws {Error}  Elm[name].App must be an Elm module with `main` defined.
   */
  function worker(name, flags) {
    if (flags) {
      log("worker " + name, flags);
    } else {
      log("worker " + name);
    }

    const App = elmApp(name);
    const application = App.worker ? App.worker(flags) : App.embed(document.createElement("div"), flags);
    registerPorts(application.ports, name);

    return application;
  }

  /**
   * Embed an Elm app in the HTML document.
   *
   * @param  {String}          name     The name of the Elm app
   * @param  {String}          selector A selector for a DOM element
   * @param  {Object|Function} flags    Either a flags object or a function taking `app` and returning a flags object
   *
   * @throws {Error}  The selector must correspond to an existing DOM node.
   * @throws {Error}  Elm[name].App must be an Elm module with `main` defined.
   */
  function embed(name, selector, flags) {
    if (flags) {
      log("embed " + name, selector, flags);
    } else {
      log("embed " + name, selector);
    }

    const domNode = document.querySelector(selector);

    if (!domNode) {
      throw new Error(`Elm app ${name} couldn't be launched. DOM node not found with selector ${selector}.`);
    }

    const App = elmApp(name);
    const application = App.embed(domNode, flags);
    registerPorts(application.ports, name);
  }

  /**
  * Embed an Elm app into many different dom nodes of the same selector
  * @param {String}          name      The name of the Elm app
  * @param {String}          selector  A selector for many DOM element
  * @param {Object|Function} flags     Either a flags object or a function taking `app` and returning a flags object
  *
  * @throw {Error} the selector must correspond to existing DOM nodes.
  * @throw {Error} Elm[name].App must be an Elm module with `main` defined.
  */
  function embedMany(name, selector, flags) {
    if (flags) {
      log("embedMany " + name, selector, flags);
    } else {
      log("embedMany " + name, selector);
    }

    const domNodes = document.querySelectorAll(selector);

    if (!domNodes.length) {
      throw new Error(`Elm app ${name} couldn't be launched. DOM domNodes not found with selector ${selector}.`);
    }

    const App = elmApp(name);

    for (let i = 0; i < domNodes.length; i++) {
      const application = App.embed(domNodes[i]);
      registerPorts(application.ports, name)
    }
  }

  /**
   * Return an un-launched Elm app with the given name.
   *
   * The name of the Elm app can be namespaced with a "." as such:
   *
   *   elmApp("Foo")         // Elm.Foo.App
   *   elmApp("Foo.Bar")     // Elm.Foo.Bar.App
   *   elmApp("Foo.Bar.Baz") // Elm.Foo.Bar.Baz.App
   *
   * @param  {String} name The name of an Elm app
   * @throws {Error}  Elm[name] must have been added to brunch-config.js in `plugins -> elmBrunch -> mainModules`.
   * @throws {Error}  Elm[name].App must be an Elm module with `main` defined.
   */
  function elmApp(name) {
    const appContainer = name.split(".").reduce(
      (container, nameSegment) => {
        if (!container[nameSegment]) {
          throw new Error(
            `Elm module \`${name}.App\` not found. ` +
            "It must not have been included in your `elm-make` command. " +
            "Did you add it to the necessary config such as `brunch-config.js` or `project.elmproj`? " +
            "Does it export a `main` function?`"
          );
        }

        return container[nameSegment];
      },
      Elm
    );

    if (!appContainer.App) {
      throw new Error(
        `Expected Elm namespace \`${name}\` to contain App module exporting \`main\`. ` +
        "Hint: Did you create `App.elm` in that folder? " +
        "Did you add it to the necessary config such as `brunch-config.js` or `app.elmproj`?"
      );
    }

    return appContainer.App;
  }

  /**
   * Register all detected ports modules on the given Elm app.
   *
   * @param {Object}   ports       Ports object from an Elm app
   * @param {Function} elmAppName  The name of the Elm app
   */
  function registerPorts(ports, elmAppName) {
    const log = logFor(elmAppName);

    portsObjects.push(ports);

    portModules.forEach(portModule => {
      const { register, samplePortName } = portModule;

      const throwError = errorString => {
        throw new Error(
          errorString +
          " I'm not sure which port module this is, but I found these properties exported: " +
          Object.keys(portModule).join(" ")
        );
      }

      if (!register) {
        throwError(
          "Port modules must export a `register` Function with this signature: " +
          "`register(ports, log)`."
        );
      }

      if (!samplePortName) {
        throwError(
          "Port modules must export a `samplePortName` String. It should contain the name of a " +
          "port in the given module so I know whether a given Elm app is using this port module."
        );
      }

      if (ports[samplePortName]) {
        register(
          ports,
          log,
          elmRouter ? elmRouter.ports : ports
        );
      }
    });
  }

  function broadcastUrlUpdate(location) {
    log("broadcastUrlUpdate", location);
    // There is an issue with serializing Location records;
    // `username`, `password`, `origin`, and `hash` often become `undefined`
    // (`origin` specifically in IE10)
    location.username = location.username || "";
    location.password = location.password || "";
    location.origin = location.origin || "";

    log("urlUpdate", location);
    portsObjects.forEach(ports => {
      if (ports.urlUpdate) {
        ports.urlUpdate.send(location);
      }
    });
  }
}
