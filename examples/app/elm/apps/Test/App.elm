module Test.App exposing (main)


main : Program Never Model Msg
main =
  Platform.program
    { init = init
    , subscriptions = subscriptions
    , update = update
    }
