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


type RouteStrategy
  = OnFirstUrl Url -- Launch the apps when ElmRouter initializes if the URL matches the Url regex
  | OnUrl Url -- Launch the apps every time the URL updates matching the Url regex
  | Manually String -- Launch the apps every time Ports.Router.routerLaunchRoute is dispatched with the given string
  | Immediately -- Launch the apps when ElmRouter initializes


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
  , manualRoutes : Dict String (List ElmApp)
  }
