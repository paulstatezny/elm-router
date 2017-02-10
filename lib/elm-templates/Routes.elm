module Routes exposing (routes)


import Json.Encode exposing (object, string, list, bool, null, float, int)
import Navigation exposing (Location)
import ElmRouter.Types exposing (..)


{-| Routes for launching Elm apps.

    See the API Reference for the full range of ElmApp and RouteStrategy types:
    https://github.com/knledg/elm-router/blob/master/docs/API.md

    App names can be namespaced within the name String using "." as such:
    Worker "Foo.Bar" corresponds to `module Foo.Bar`

    ElmRouter will launch EVERY route that matches, instead of just the first one it finds.
-}
routes : Location -> List Route
routes location =
  []
