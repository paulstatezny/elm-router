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
  register: function(ports) { ... },
  samplePortName: "openModal"
};

var ports = [
  myPortsModule
];

elmRouter.start(Elm, ports);
```

### `register`

A function that takes the `ports` object of an instantiated Elm app in JavaScript, and "wires up" the ports by calling `ports.somePortName.subscribe(function( ... ) { ... })`.

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
