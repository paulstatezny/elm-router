module ElmRouter.App exposing (main)


import Html
import Navigation
import ElmRouter.Types exposing (..)
import ElmRouter.Init exposing (init)
import ElmRouter.Update exposing (update)
import ElmRouter.Ports exposing (routerReceiveCmd)


main : Program Never Model Msg
main =
  Navigation.program UrlUpdate
    { init = init
    , update = update
    , view = always (Html.text "")
    , subscriptions = always <| routerReceiveCmd ReceiveCmd
    }
