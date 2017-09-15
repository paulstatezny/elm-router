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
port windowLocationHref : String -> Cmd msg -- Set window.location.href to the String
port routerSetLocation : String -> Cmd msg
port routerSetLocationRelative : String -> Cmd msg


-- Receive from JS (Sub)
port urlUpdate : (Navigation.Location -> msg) -> Sub msg
