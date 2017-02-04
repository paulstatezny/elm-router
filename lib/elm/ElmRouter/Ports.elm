port module ElmRouter.Ports exposing (..)


import Json.Encode
import Navigation
import ElmRouter.Types exposing (..)


type alias Command = String


-- Send to JS (Cmd) -- for ElmRouter's use
port routerWorker : (ElmAppName, Maybe Flags) -> Cmd msg
port routerEmbed : (ElmAppName, Selector, Maybe Flags) -> Cmd msg
port routerLog : String -> Cmd msg
port routerBroadcastUrlUpdate : Navigation.Location -> Cmd msg


-- Receive from JS (Sub)
port routerReceiveCmd : ((Command, Json.Encode.Value) -> msg) -> Sub msg
