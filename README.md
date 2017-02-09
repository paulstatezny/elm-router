# Elm Router

Elegantly launch Elm apps and wire up generic ports.

# Quick Start (5 steps)

## 1. Install via NPM

```
$ npm install --save elm-router
```

## 2. In `elm-package.json`, import the [ElmRouter](https://github.com/knledg/elm-router/tree/master/lib/elm/ElmRouter) Elm code

Add `node_modules/elm-router/lib/elm` to your `source-directories`:

```js
// elm-package.json

{
    // ...

    "source-directories": [
        "../../node_modules/elm-pub-sub-ports/lib/elm", // Exact path to node_modules may be different for you
        "./"
    ],

    // ...
}
```

This will allow `elm-make` to find all of the Elm code.

## 3. Add Routes.elm to your project

```
$ npm install -g elm-router
$ cd /path/to/elm/project    <-- This directory must be in `source-directories` in elm-package.json
$ elm-router init
```

If you don't want to globally install `elm-router` just to create the `Routes.elm` template, here are your options:

1. Copy it into your Elm project from [here](https://github.com/knledg/elm-router/blob/master/lib/elm-templates/Routes.elm)
2. Reference the CLI tool from `node_modules` like this: `../path/to/node_modules/elm-router/bin/elm-router init`

## 4. Add `ElmRouter` to your Elm app configuration

### Using [Webpack](https://webpack.js.org/) with [elm-webpack-project-loader](https://github.com/joeandaverde/elm-webpack-project-loader)

Add this path to the `"main-modules"` section of your `.elmproj` file:

```javascript
{
  ...

  "main-modules": [
    ...

    "../../node_modules/elm-router/lib/elm/ElmRouter/App.elm"
  ]
}
```

(Careful, `node_modules` might be in a slightly different location for you.)

### Using Other Build Tools

#### The short version

```
$ elm-make --output elm.js ./App1.elm ./App2.elm ../node_modules/elm-router/lib/elm/ElmRouter/App.elm
```

#### The long explanation

`elm-make` bundles your Elm app along with the Elm runtime. (Which is a lot of JavaScript.) If you run `elm-make` for each app separately and then bundle the compiled results, you'll end up bundling multiple copies of the Elm runtime.

To avoid this performance hit, `elm-make` should be passed every one of your Elm apps, which will bundle them together with a single copy of the Elm runtime. Just make sure that this path is one of the paths passed to `elm-make`: `node_modules/elm-router/lib/elm/ElmRouter/App.elm`

## 5. Start the router in your JavaScript

```javascript
var elmRouter = require("elm-router");
elmRouter.start(Elm);
```

`Elm` is the object compiled with `elm-make`, containing all of your project's Elm apps. It's the object with which you would have previously called `Elm.SomeApp.embed(document.getElementById("some-app"))`.

# Adding Routes

`elm-router init` creates a file named `Routes.elm`. Just add your routes there and you're done.

Elm Router follows a "convention over configuration" rule for naming your Elm apps. It appends `.App` to the given name:

| App name in Routes.elm | Elm Router expects this `main` module to exist |
|------------------------|------------------------------------------------|
| `Foo`                  | `Foo.App`                                      |
| `Mobile.Menu`          |  `Mobile.Menu.App`                             |

## Example Routes File

```elm
module Routes exposing (routes)


import Json.Encode exposing (object, string, list, bool, null, float, int)
import Navigation exposing (Location)
import ElmRouter.Types exposing (..)


routes : Location -> List Route
routes location =
  [ Route (OnUrl "^/$") -- Home page
      -- `Nothing` means no flags for these apps
      [ Worker "MobileMenu" Nothing
      , Embed "SearchBox" "#search_box" Nothing

      -- This app takes a JSON object with a `photos` list and `speed` int as flags
      , Embed "PhotoSlider" "#photo_slider" <| Just <| object
          [ ("photos", list [string "photo1.jpg", string "photo2.jpg"])
          , ("speed", int 500)
          ]
      ]

  -- Launch these whenever the URL matches the regex "^/search"
  , Route (OnUrl "^/search")
      [ ... ]

  -- Launch these immediately on page load if the URL matches
  , Route (OnFirstUrl "^/some-landing-page")
      [ ... ]

  -- Launch these if an Elm app makes this cmd: Router.routerLaunchRoute "launchLoginModal"
  , Route (Manually "launchLoginModal")
      [ ... ]

  -- Always launch these immediately on page load
  , Route Immediately
      [ ... ]
  ]
```

## Building a `Route`

To understand the example above, note the types from `ElmRouter.Types`:

```elm
type alias Route =
  { strategy : RouteStrategy
  , elmApps : List ElmApp
  }

type ElmApp
  = Worker ElmAppName (Maybe Flags)
  | Embed ElmAppName Selector (Maybe Flags)


type RouteStrategy
  = OnFirstUrl Url -- Launch the apps when ElmRouter initializes if the URL matches the Url regex
  | OnUrl Url -- Launch the apps every time the URL updates matching the Url regex
  | Manually String -- Launch the apps every time a the given Cmd is broadcast
  | Immediately -- Launch the apps when ElmRouter initializes (on page load)
```

## Adding Ports

Elm Router supports an interface for auto-wiring Elm apps with reusable ports modules.

### JavaScript Interface

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

#### `register`

A function that takes the `ports` object of an instantiated Elm app in JavaScript, and "wires up" the ports by calling `ports.somePortName.subscribe(function( ... ) { ... })`.

#### `samplePortName`

The name of one of the ports in the `port module`. (Any one.) This allows Elm Router to automatically inspect Elm apps as they are launched and automatically subscribe the ports.

## Questions or Problems?

Feel free to create an issue in the [GitHub issue tracker](https://github.com/knledg/elm-router/issues).
