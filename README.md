# Elm Router

**Write less JavaScript.**

Create a website with many small Elm applications, powered by reusable Elm ports from NPM.

## Why use Elm Router?

JavaScript can't provide the safety and guarantees that Elm can. But Elm [requires you to use JavaScript](https://guide.elm-lang.org/interop/javascript.html) to (1) launch Elm apps and (2) perform side effects. (Sending Websockets, saving to LocalStorage, etc.)

Elm Router minimizes the JavaScript you'll write by:

1. Launching Elm apps **in Elm** instead of JavaScript.
2. Powering Elm apps with generic, *reusable* ports modules for side effects.

## Installation

Make sure you understand [how Elm and JavaScript interact](https://guide.elm-lang.org/interop/javascript.html).

### Installation: The JavaScript Part

Using [npm](https://www.npmjs.com/):

```
$ npm install --save elm-router
```

Then add this to your JavaScript:

```javascript
var elmRouter = require("elm-router");
elmRouter.start(Elm);
```

(Not sure where `Elm` comes from? See the [Elm tutorial](https://guide.elm-lang.org/interop/javascript.html).)

### Installation: The Elm Part

```
$ elm-package install http
$ elm-package install navigation
```

**Note:** Exact path to `node_modules` may be different for you below.

#### Add source directory to `elm-package.json`

```js
{
    ...

    "source-directories": [
        ...
        "../../node_modules/elm-router/lib/elm"
    ],

    ...
}
```

#### Include ElmRouter app in `elm-make` command

```
$ elm-make --output elm.js ./MyApp.elm ./MyOtherApp.elm ../node_modules/elm-router/lib/elm/ElmRouter/App.elm
```

If you're using a build tool like Webpack or Brunch to run `elm-make` for you, [see this guide](/docs/BuildTools.md).


#### Add `Routes.elm` template to your project

Use the command line tool. (Or just copy-and-paste [from here](https://github.com/knledg/elm-router/blob/master/lib/elm-templates/Routes.elm).)

```
$ npm install -g elm-router
$ cd /path/to/elm/project    <-- This directory must be in `source-directories` in elm-package.json
$ elm-router init
```

## What do Elm Routes look like?

This JavaScript code can be replaced by the Elm code below:

```javascript
// Runs on every page
Elm.MobileMenu.App.worker();

// Code that only runs on contact page:
Elm.ContactForm.App.embed(document.getElementById('contact_form'));

// Code that only runs on homepage:
Elm.SearchBar.App.embed(document.getElementById('search_bar'), {
  placeholder: 'What are you looking for?'
});
```

```elm
import Json.Encode exposing (object, string)


routes location =
  [ Route Immediately
      [ Worker "MobileMenu"
      , -- Other apps to run on immediately on page load, no matter the page
      ]

  , Route (OnUrl "^/contact$") -- Regex for contact page
      [ Embed "ContactForm" "#contact_form"
      , -- Other apps on contact page
      ]

  , Route (OnUrl "^/$") -- Regex for homepage
      [ EmbedWithFlags "SearchBar" "#search_bar" <| object
          [ ( "placeholder", string "What are you looking for?" )
          ]
      , -- Other apps on homepage
      ]
  ]
```

For more information about building out your routes, [see this guide](/docs/SettingUpRoutes.md).

## Tell me about these "Reusable Ports Modules"

### Example

Details omitted for brevity.

#### JavaScript

`google-maps-ports.js`:
```javascript
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
```

`app.js`:
```javascript
elmRouter.start(Elm, [
  require('./google-maps-ports')
]);
```

There is no more JavaScript to write. You don't need to "wire up" any specific Elm app; Elm Router will do that for you.

#### Elm

Multiple Elm apps can take advantage of this supporting JavaScript.

`Ports/GoogleMaps.elm`:
```elm
port module Ports.GoogleMaps exposing (..)


port createGoogleMap : CreateMapOptions -> Cmd msg


port zoomChanged : (MapBounds -> msg) -> Sub msg
```

`SomeElmApp/App.elm`:
```elm
module SomeElmApp.App exposing (main)


module Ports.GoogleMaps exposing (..)


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

For more information on reusable ports modules, [see this guide](/docs/AddingPortsModules.md).

### Ports modules on NPM

- [elm-local-storage-ports](https://www.npmjs.com/package/elm-local-storage-ports)
- [elm-dom-ports](https://www.npmjs.com/package/elm-dom-ports)
- [elm-pub-sub-ports](https://www.npmjs.com/package/elm-pub-sub-ports)
- [elm-phoenix-websocket-ports](https://www.npmjs.com/package/elm-phoenix-websocket-ports)

## Questions or Problems?

Feel free to create an issue in the [GitHub issue tracker](https://github.com/knledg/elm-router/issues).
