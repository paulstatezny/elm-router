module ElmRouter.Update exposing (update, locationMatchesRegex, appCmd, routeLogCmd)


import Dict exposing (Dict)
import Regex exposing (regex)
import Json.Decode as JD
import Json.Encode as JE
import Http exposing (decodeUri)
import Navigation exposing (Location)
import ElmRouter.Ports as Ports
import ElmRouter.Types exposing (..)
import ElmRouter.Types.RouterCmd as RouterCmd exposing (RouterCmd(..))


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    ReceiveCmd (command, payload) ->
      case RouterCmd.fromStringAndPayload command payload of
        Just Back ->
          ( model
          , Navigation.back 1 -- Navigation seems kind of buggy with this. Use carefully.
          )

        Just (ModifyUrl url) ->
          ( model
          , Navigation.modifyUrl url
          )

        Just (NewUrl url) ->
          let
            previousUrl = decodeUri (model.location.pathname ++ model.location.search)
          in
            if (Just url) == previousUrl then
              model ! []

            else
              ( model
              , Navigation.newUrl url
              )

        Just (LaunchRoute routeName) ->
          -- Launch a route with Manual strategy
          if Dict.member routeName model.manualRoutes then
            model.manualRoutes
            |> Dict.get routeName
            |> Maybe.withDefault []
            |> List.map appCmd
            |> Cmd.batch
            |> \cmd ->
                 model ! [cmd, routeLogCmd <| OnBroadcast message]

          else
            model ! []

        Nothing ->
          model ! []

    UrlUpdate location -> -- Launch routes with OnUrl strategy
      let
        routeUrls =
          model.manualRoutes
          |> Dict.keys
          |> List.filter (locationMatchesRegex location)

        newPathname = model.location.pathname /= location.pathname
        routeFoundExpectingRefresh = List.any (locationMatchesRegex location) model.newPageLoadWithUrlRoutes
        reloadPage = newPathname && routeFoundExpectingRefresh
      in
        { model | location = location } !
        [ Ports.broadcastUrlUpdate location
        , if reloadPage then Ports.refreshBrowser () else Cmd.none
        , routeUrls
            |> List.map ((flip Dict.get) model.manualRoutes)
            |> List.map (Maybe.withDefault [])
            |> List.concat
            |> List.map appCmd
            |> Cmd.batch
        , routeUrls
            |> List.map OnUrl
            |> List.map routeLogCmd
            |> Cmd.batch
        ]


{-| Given a Location and Route, return whether the route should be run for this location.

    Regex matching is used for both `location.pathname` AND `location.pathname ++ location.search`.
-}
locationMatchesRegex : Location -> String -> Bool
locationMatchesRegex { pathname } pathRegex =
  Regex.contains (regex pathRegex) pathname


{-| Get a Cmd that will launch the given Elm app.
-}
appCmd : ElmApp -> Cmd Msg
appCmd elmApp =
  case elmApp of
    Worker elmAppName flags ->
      Ports.worker (elmAppName, flags)

    Embed elmAppName selector flags ->
      Ports.embed (elmAppName, selector, flags)


routeLogCmd : RouteStrategy -> Cmd Msg
routeLogCmd strategy =
  strategy
  |> strategyToString
  |> \s -> "launchRoute | " ++ s
  |> Ports.routerLog


strategyToString : RouteStrategy -> String
strategyToString strategy =
  case strategy of
    OnFirstUrl url ->
      "OnFirstUrl " ++ url

    OnUrl url ->
      "OnUrl " ++ url

    Manually routeName ->
      "Manually " ++ message

    Immediately ->
      "Immediately"
