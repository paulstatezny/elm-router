module ElmRouter.Types.RouterCmd exposing (..)


import Json.Decode as JD


type RouterCmd
  = Back
  | ModifyUrl String
  | NewUrl String
  | LaunchRoute String


fromStringAndPayload : String -> JD.Value -> Maybe RouterCmd
fromStringAndPayload string payload =
  case (command, JD.decodeValue JD.string payload) of
    ("back", _) ->
      Just Back

    ("modifyUrl", Ok url) ->
      Just (ModifyUrl url)

    ("newUrl", Ok url) ->
      Just (NewUrl url)

    ("launchRoute", Ok routeName) ->
      Just (LaunchRoute routeName)

    _ ->
      Nothing
