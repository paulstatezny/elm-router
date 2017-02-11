# Adding Port Modules

Elm Router supports an interface for auto-wiring Elm apps with port modules. With Elm Router, port modules are intended to be mostly generic and reused by multiple Elm apps.

## Port modules on NPM

- [elm-local-storage-ports](https://www.npmjs.com/package/elm-local-storage-ports)
- [elm-dom-ports](https://www.npmjs.com/package/elm-dom-ports)
- [elm-pub-sub-ports](https://www.npmjs.com/package/elm-pub-sub-ports)
- [elm-phoenix-websocket-ports](https://www.npmjs.com/package/elm-phoenix-websocket-ports)

## JavaScript Interface

```javascript
var myPortsModule = {
  register: function(ports, log) { ... },
  samplePortName: "openModal"
};

var ports = [
  myPortsModule
];

elmRouter.start(Elm, ports);
```

### `register(ports, log)`

A function that takes the `ports` object of an instantiated Elm app in JavaScript, and "wires up" the ports by calling `ports.somePortName.subscribe(function( ... ) { ... })`.

#### `ports`

This will be the `ports` property of any Elm app which needs wired up to these ports.

#### `log` (Optional)

For `log`, Elm Router will pass a function which will log to the console **if and only if** `elmRouter.logPorts()` has been called. (Intended for debug use.)

The intended use is as such:

```javascript
log(nameOfPort, arg1, arg2, ...)
```

You can pass `log()` an arbitrary amount of arguments, but you should probably pass exactly what was passed to the port. Like this:

```javascript
var myPorts = {
  register: function(ports, log) {
    ports.submitForm.subscribe(function([name, email]) {
      log('submitForm', name, email);

      // ...
    });
  },
  samplePortName: 'submitForm'
};
```

### `samplePortName`

The name of one of the ports in the `port module`. (Any one.) This allows Elm Router to automatically inspect Elm apps as they are launched and automatically subscribe the ports.

## Example Port Module: Google Maps

```javascript
// google-maps-ports.js
function registerPorts(ports) {
  ports.createGoogleMap.subscribe(function(options) {
    // Create a Google map

    map.addListener('zoom_changed', function(event) {
      ports.zoomChanged.send(/* updated map bounds */);
    });
  });
}

module.exports = {
  register: registerPorts,
  samplePortName: 'createGoogleMap'
};


// app.js
elmRouter.start(Elm, [
  require('./google-maps-ports')
]);
```

```elm
-- Ports/GoogleMaps.elm
port module Ports.GoogleMaps exposing (..)


port createGoogleMap : CreateMapOptions -> Cmd msg
port zoomChanged : (MapBounds -> msg) -> Sub msg


-- SomeElmApp/App.elm
module SomeElmApp.App exposing (main)


import Ports.GoogleMaps exposing (..)


subscriptions model =
  zoomChanged ZoomChanged


update msg model =
  case msg of
    AddMapToPage ->
      ( model
      , createGoogleMap defaultMapOptions
      )

    ZoomChanged newBounds ->
      -- Do something with newBounds
```

Note that in the example, only a single Elm app uses the Google Maps ports. However, it would be trivial to use them in other Elm apps.
