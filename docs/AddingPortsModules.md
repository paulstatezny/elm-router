# Adding Ports

Elm Router supports an interface for auto-wiring Elm apps with reusable ports modules.

## Ports modules on NPM

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
