module ElmRouter.Types exposing (..)


import Dict exposing (Dict)
import Json.Encode
import Navigation exposing (Location)


type alias ElmAppName = String
type alias Selector = String
type alias Flags = Json.Encode.Value
type alias Url = String


type ElmApp
  = Worker ElmAppName (Maybe Flags)
  | Embed ElmAppName Selector (Maybe Flags)


type RouteStrategy
  = OnFirstUrl Url -- Launch the apps when ElmRouter initializes if the URL matches the Url regex
  | OnUrl Url -- Launch the apps every time the URL updates matching the Url regex
  | Manually String -- Launch the apps every time a the given Cmd is broadcast
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
  , newPageLoadWithUrlRoutes : List Url
  }
