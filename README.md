# Elm Router

Elegantly launch Elm apps and wire up generic ports.

# Set Up

## Add the Elm code to your project

[Package.elm-lang.org](http://package.elm-lang.org/) does not allow packages with port modules. (Elm Router uses these.) To get around this, you'll need to add the Elm code of Elm Router directly into your project.

```
$ npm install -g elm-router
$ cd /path/to/elm/project
$ elm-router init
```

You will be asked,

```
Are you inside one of the "source-directories" from your project's elm-package.json? (y/n)
```

Type `y` and `elm-router` will create all of the necessary Elm files.

**Note:** `elm-router init` must be run from a directory in the `"source-directories\"` array in your project's `elm-package.json`. The above commands assume that `/path/to/elm/project` is the path containing `elm-package.json`, and that you have not modified `"source-directories"`.

## Install the JavaScript dependency in your project

```
$ npm install --save elm-router
```

(Run this in the directory with `package.json`, of course.)

```javascript
var elmRouter = require("elm-router");
elmRouter.start(Elm);
```

`Elm` is the object compiled with `elm-make`, containing all of your project's Elm apps. It's the object with which you would have previously called `Elm.SomeApp.embed(document.getElementById("some-app"))`.

## Add `ElmRouter` to your Elm app configuration

Elm configuration setups for multiple Elm apps typically include a list of `main` modules to include. (An array of Elm apps.) Ensure that `ElmRouter/App.elm` is in this list.

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
