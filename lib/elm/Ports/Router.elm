port module Ports.Router exposing (..)


import Json.Encode
import Navigation
import ElmRouter.Types exposing (..)


-- Send to JS (Cmd)
port routerRefresh : () -> Cmd msg
port routerBack : () -> Cmd msg
port routerModifyUrl : String -> Cmd msg
port routerNewUrl : String -> Cmd msg
port routerLaunchRoute : String -> Cmd msg -- Launch a route using the OnCmd strategy


-- Receive from JS (Sub)
port urlUpdate : (Navigation.Location -> msg) -> Sub msg
