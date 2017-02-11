module Tests exposing (..)


import Json.Encode exposing (object, string, null)
import Navigation
import Test exposing (..)
import Expect
import String
import SampleLocations
import ElmRouter.Types exposing (..)
import ElmRouter.Ports as Ports
import ElmRouter.Init
import ElmRouter.Update exposing (update)
import Dict


all : Test
all =
  describe "ElmRouter"
    [ describe "Init"
        [ test "routesOnUrl contains the correct routes" <|
            \() ->
              initEmptyLocation
              |> \(model, cmd) -> model
              |> .routesOnUrl
              |> Dict.keys
              |> Expect.equal ["^/$", "^/contact", "^/foo"]

        , test "routesOnCmd contains the correct routes" <|
            \() ->
              initEmptyLocation
              |> \(model, cmd) -> model
              |> .routesOnCmd
              |> Dict.keys
              |> Expect.equal ["ItemDetailsModal", "SubscribeDrawer"]

        , test "returns a command launching all routes that should be launched and logging them" <|
            \() ->
              let
                expectedCmd =
                  Cmd.batch
                    [ Cmd.batch
                        [ Ports.routerLog "launchRoute | Immediately"
                        , Ports.routerLog "launchRoute | OnUrl ^/contact"
                        , Ports.routerLog "launchRoute | OnFirstUrl ^/contact"
                        ]
                    , Cmd.batch
                        [ Ports.routerWorker ("HeaderSearchBar", Nothing)
                        , Ports.routerWorker ("ContactForm", Nothing)
                        , Ports.routerEmbed
                            ( "ContactPopUpOnFirstUrl"
                            , "#contact_popup"
                            , Just <|
                                object
                                  [ ("message", string "Do you want to subscribe?")
                                  , ("foo", string "bar")
                                  ]
                            )
                        ]
                    ]
              in
                initMatchingLocation
                |> \(model, cmd) -> cmd
                |> Expect.equal expectedCmd
        ]

    , describe "Update"
        [ describe "ReceiveCmd"
            [ test "back" <|
                \() ->
                  sampleModel
                  |> update (ReceiveCmd ("back", null))
                  |> \(model, cmd) -> cmd
                  |> Expect.equal (Navigation.back 1)

            , test "modifyUrl" <|
                \() ->
                  sampleModel
                  |> update (ReceiveCmd ("modifyUrl", string "/new/url"))
                  |> \(model, cmd) -> cmd
                  |> Expect.equal (Navigation.modifyUrl "/new/url")

            , test "newUrl" <|
                \() ->
                  sampleModel
                  |> update (ReceiveCmd ("newUrl", string "/new/url"))
                  |> \(model, cmd) -> cmd
                  |> Expect.equal (Navigation.newUrl "/new/url")

            , test "launchRoute" <|
                \() ->
                  let
                    expectedCmd =
                      Cmd.batch
                        [ Cmd.batch
                            [ Ports.routerEmbed ("Modal", "#modal", Nothing)
                            ]
                        , Ports.routerLog "launchRoute | OnCmd ItemDetailsModal"
                        ]
                  in
                    sampleModel
                    |> update (ReceiveCmd ("launchRoute", string "ItemDetailsModal"))
                    |> \(model, cmd) -> cmd
                    |> Expect.equal expectedCmd
            ]

        , describe "UrlUpdate"
            [ test "launches all routes matching the given URL" <|
                \() ->
                  let
                    expectedCmd =
                      Cmd.batch
                        [ Ports.routerBroadcastUrlUpdate SampleLocations.matching
                        , Cmd.batch
                            [ Ports.routerWorker ("ContactForm", Nothing)
                            ]
                        , Cmd.batch
                            [ Ports.routerLog "launchRoute | OnUrl ^/contact"
                            ]
                        ]
                  in
                    sampleModel
                    |> update (UrlUpdate SampleLocations.matching)
                    |> \(model, cmd) -> cmd
                    |> Expect.equal expectedCmd
            ]
        ]
    ]



initEmptyLocation : (Model, Cmd Msg)
initEmptyLocation =
  ElmRouter.Init.init SampleLocations.empty


initMatchingLocation : (Model, Cmd Msg)
initMatchingLocation =
  ElmRouter.Init.init SampleLocations.matching


sampleModel : Model
sampleModel =
  SampleLocations.matching
  |> ElmRouter.Init.init
  |> \(model, url) -> model
