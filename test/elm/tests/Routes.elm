module Routes exposing (routes)


import Json.Encode exposing (string, object)
import Navigation
import ElmRouter.Types exposing (..)


routes : Navigation.Location -> List Route
routes location =
  [ Route OnStart
      [ Worker "HeaderSearchBar"
      ]

  , Route (OnUrl "^/$") []
  , Route (OnUrl "^/foo") []

  , Route (OnUrl "^/contact")
      [ Worker "ContactForm"
      ]

  , Route (OnFirstUrl "^/search-results")
      [ EmbedWithFlags "SomeSearchRelatedApp" "#some_search_related_app_container" <|
          string "stringFlags"
      ]

  , Route (OnFirstUrl "^/contact")
      [ EmbedWithFlags "ContactPopUpOnFirstUrl" "#contact_popup" <| object
          [ ("message", string "Do you want to subscribe?")
          , ("foo", string "bar")
          ]
      ]

  , Route (OnCmd "ItemDetailsModal")
      [ Embed "Modal" "#modal"
      ]
  , Route (OnCmd "SubscribeDrawer") []
  ]
