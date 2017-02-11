# Adding Routes to your Project

`elm-router init` creates a file named `Routes.elm`. Just add your routes there and you're done.

Elm Router follows a "convention over configuration" rule for naming your Elm apps. It appends `.App` to the given name:

| App name in Routes.elm | Elm Router expects this `main` module to exist |
|------------------------|------------------------------------------------|
| `"Foo"`                | `Foo.App`                                      |
| `"Mobile.Menu"`        |  `Mobile.Menu.App`                             |

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
      [ Worker "MobileMenu"
      , Embed "SearchBox" "#search_box"

      -- This app takes a JSON object with a `photos` list and `speed` int as flags
      , EmbedWithFlags "PhotoSlider" "#photo_slider" <| object
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
  , Route (OnCmd "launchLoginModal")
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
  = Worker ElmAppName
  | WorkerWithFlags ElmAppName Flags
  | Embed ElmAppName Selector
  | EmbedWithFlags ElmAppName Selector Flags


type RouteStrategy
  = OnFirstUrl Url -- Launch the apps when ElmRouter initializes if the URL matches the Url regex
  | OnUrl Url -- Launch the apps every time the URL updates matching the Url regex
  | OnCmd String -- Launch the apps every time a the given Cmd is broadcast
  | Immediately -- Launch the apps when ElmRouter initializes (on page load)
```
