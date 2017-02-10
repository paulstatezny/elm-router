module SampleLocations exposing (..)


import Navigation


empty : Navigation.Location
empty =
  { href = ""
  , host = ""
  , hostname = ""
  , protocol = ""
  , origin = ""
  , port_ = ""
  , pathname = ""
  , search = ""
  , hash = ""
  , username = ""
  , password = ""
  }


matching : Navigation.Location
matching =
  { empty | pathname = "/contact" }
