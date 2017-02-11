module ElmRouter.Init exposing (init)


import Dict exposing (Dict)
import Navigation exposing (Location)
import ElmRouter.Types exposing (..)
import ElmRouter.Update exposing (appCmd, routeLogCmd, locationMatchesRegex)
import Routes


init : Location -> (Model, Cmd Msg)
init location =
  let
    routes = Routes.routes location
  in
    { location = location
    , routesOnUrl = routesOnUrl routes
    , routesOnCmd = routesOnCmd routes
    } !
    (immediateRouteCmds location routes)


routesOnUrl : List Route -> Dict Url (List ElmApp)
routesOnUrl routes =
  routes
  |> List.map onUrlTuple
  |> List.foldl maybeToListAccumulator []
  |> Dict.fromList


onUrlTuple : Route -> Maybe (Url, List ElmApp)
onUrlTuple { strategy, elmApps } =
  case strategy of
    OnUrl url ->
      Just (url, elmApps)

    _ ->
      Nothing


routesOnCmd : List Route -> Dict String (List ElmApp)
routesOnCmd routes =
  routes
  |> List.map onCmdTuple
  |> List.foldl maybeToListAccumulator []
  |> Dict.fromList


onCmdTuple : Route -> Maybe (Url, List ElmApp)
onCmdTuple { strategy, elmApps } =
  case strategy of
    OnCmd routeName ->
      Just (routeName, elmApps)

    _ ->
      Nothing


immediateRouteCmds : Location -> List Route -> List (Cmd Msg)
immediateRouteCmds location routes =
  let
    routesToLaunch =
      routes
      |> List.filter (launchImmediately location)
  in
    [ routesToLaunch
        |> List.map .strategy
        |> List.map routeLogCmd
        |> Cmd.batch
    , routesToLaunch
        |> List.map .elmApps
        |> List.concat
        |> List.map appCmd
        |> Cmd.batch
    ]


launchImmediately : Location -> Route -> Bool
launchImmediately location { strategy } =
  case strategy of
    OnStart ->
      True

    OnFirstUrl url ->
      locationMatchesRegex location url

    OnUrl url ->
      locationMatchesRegex location url

    _ ->
      False


maybeToListAccumulator : Maybe a -> List a -> List a
maybeToListAccumulator maybeValue listOfValues =
  case maybeValue of
    Just a ->
      a :: listOfValues

    Nothing ->
      listOfValues
