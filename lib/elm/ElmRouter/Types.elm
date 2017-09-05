module ElmRouter.Types exposing (..)


import Dict exposing (Dict)
import Json.Encode
import Navigation exposing (Location)


type alias ElmAppName = String
type alias Selector = String
type alias Flags = Json.Encode.Value
type alias Url = String


type ElmApp
  = Worker ElmAppName
  | WorkerWithFlags ElmAppName Flags
  | Embed ElmAppName Selector
  | EmbedWithFlags ElmAppName Selector Flags
  | EmbedMany ElmAppName Selector
  | EmbedManyWithFlags ElmAppName Selector Flags


type RouteStrategy
  = OnFirstUrl Url -- Launch the apps when ElmRouter initializes if the URL matches the Url regex
  | OnUrl Url -- Launch the apps every time the URL updates matching the Url regex
  | OnCmd String -- Launch the apps every time the Ports.Router.routerLaunchRoute Cmd is dispatched with the given string
  | OnStart -- Launch the apps when elmRouter.start() is called


type Msg
  = ReceiveCmd (String, Json.Encode.Value)
  | UrlUpdate Location


type alias Route =
  { strategy : RouteStrategy
  , elmApps : List ElmApp
  }


type alias Model =
  { location : Location
  , routesOnUrl : Dict Url (List ElmApp)
  , routesOnCmd : Dict String (List ElmApp)
  }
