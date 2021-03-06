# API Reference

- [JavaScript](#javascript)
  - [elm-router](#elm-router)
  - [Port modules](#port-modules)
- [Elm](#elm)
  - [Route](#route)
  - [RouteStrategy](#routestrategy)
  - [ElmApp](#elmapp)
  - [Ports.Router](#portsrouter)

# JavaScript

## elm-router

### start(Elm, ports)

Example:
```javascript
var elmRouter = require('elm-router');

elmRouter.start(Elm, [
  require('elm-local-storage-ports'),
  require('elm-pub-sub-ports'),
  require('elm-dom-ports'),
  myCustomGoogleMapsPorts
]);
```

#### `Elm` (required)

The `Elm` object compiled by `elm-make` into JavaScript.

#### `ports` (optional)

An `Array` of [port modules](#port-modules).

### logPorts([portOrApp1[, portOrApp2[, ...]]])

**(For debug use only, obviously.)**

Logs ports activity to the console.

Accepts an arbitrary number of "whitelist" arguments, which can be either (1) the name of an Elm app or (2) the name of a port.

```javascript
var elmRouter = require('elm-router');

elmRouter.logPorts(); // Log all ports activity in the console
elmRouter.logPorts('SearchBar'); // Log only ports from the Elm app called SearchBar
elmRouter.logPorts('websocketSend'); // Log only ports activity of the port called websocketSend
elmRouter.logPorts('websocketSend', 'addClass'); // Log the websocketSend and addClass ports
elmRouter.logPorts('MyApp', 'MyOtherApp', 'addClass', 'removeClass'); // Log activity for each of these apps and ports
```

## Port Modules

Port modules must be in this form:

```javascript
{
  register: function(ports) { ... },
  samplePortName: 'somePortName'
}
```

### `register(ports)`

A function that takes the `ports` object of an instantiated Elm app in JavaScript, and "wires up" the Elm-to-JavaScript ports (`Cmd`s) by calling `ports.somePortName.subscribe(function( ... ) { ... })`. It should also wire up the JavaScript-to-Elm ports (`Sub`s) by calling `ports.someReturningPortName.send()` when appropriate.

### `samplePortName`

A string containing the name of one of the ports in the port module. This is used by Elm Router to infer whether or not a given Elm app uses a given port module.

# Elm

Type aliases used below:

```elm
type alias Url = String
type alias ElmAppName = String
type alias Selector = String
type alias Flags = Json.Encode.Value
```

## Route

```elm
type alias Route =
  { strategy : RouteStrategy
  , elmApps : List ElmApp
  }
```

Use it in `Routes.elm` like this:

```elm
Route (OnUrl "/user")
  [ -- List of ElmApps to launch for this route here
  ]
```

## RouteStrategy

```elm
type RouteStrategy
  = OnFirstUrl Url -- Launch the apps when ElmRouter initializes if the URL matches the Url regex
  | OnUrl Url -- Launch the apps every time the URL updates matching the Url regex
  | OnCmd String -- Launch the apps every time Ports.Router.routerLaunchRoute is dispatched with the given string
  | OnStart -- Launch the apps immediately when elmRouter.start() is called
```

## ElmApp

```elm
type ElmApp
  = Worker ElmAppName -- Launch a worker Elm app created by Platform.program
  | WorkerWithFlags ElmAppName Flags -- Launch a worker Elm app created by Platform.programWithFlags
  | Embed ElmAppName Selector -- Embed an Elm app created by Html.program
  | EmbedWithFlags ElmAppName Selector Flags -- Embed an Elm app created by Html.programWithFlags
  | EmbedMany ElmAppName Selector -- Embed an Elm app created by Html.program into every DOM node that matches the selector
  | EmbedWithFlags ElmAppName Selector Flags -- Same as EmbedMany, but with Flags
```

## DomNode and DomNodeFlags

Embedded apps are passed information about the DOM node that they're embedded in. This is helpful for passing in information to the Elm app on initialization via `data-` attributes on the HTML element.

`DomNodeFlags` is the shape of the flags passed to `Html.programWithFlags`.

```elm
type alias DomNode =
  { className : String
  , nodeId : String
  , data : List (String, String)
  }

type alias DomNodeFlags =
  { node : DomNode
  }
```

## Ports.Router

`Ports.Router` follows the same design as all Elm Router [port modules](#port-modules). Its purpose is to allow Elm apps to manually navigate the browser URL, as well as letting them know when the URL is updated by another Elm app.

### Commands

#### `routerRefresh`

```elm
port routerRefresh : () -> Cmd msg
```

Reload/refresh the browser. Used when you want to manually update the URL and then force a page refresh.

#### `routerBack`

```elm
port routerBack : () -> Cmd msg
```

Navigate back to the last page.

#### `routerModifyUrl`

```elm
port routerModifyUrl : String -> Cmd msg
```

Change the URL without adding a new history entry. Basically a passthrough for [`history.replaceState()`](https://developer.mozilla.org/en-US/docs/Web/API/History).

#### `routerNewUrl`

```elm
port routerNewUrl : String -> Cmd msg
```

Change the URL and add a new history entry. Basically a passthrough for [`history.pushState()`](https://developer.mozilla.org/en-US/docs/Web/API/History).

#### `routerLaunchRoute`

```elm
port routerLaunchRoute : String -> Cmd msg
```

Launch all [`Route`](#route)s using the `OnCmd` [`RouteStrategy`](#routestrategy) with a matching string.

Can be used to launch, for example, a modal window:

```elm
-- Routes.elm
Route (OnCmd "ItemDetailsModal")
  [ -- Elm apps to launch for the modal
  ]


-- SomeApp.Update
update msg model =
  case msg of
    LaunchTheModal ->
      (model, Ports.Router.routerLaunchRoute "ItemDetailsModal")
```


#### `routerSetLocation`

```elm
port routerSetLocation : String -> Cmd msg
```

Will set the location and load that new page. Given a realative path the browser knows to navigate within the same origin.

### Subscriptions

#### `urlUpdate`

```elm
port urlUpdate : (Navigation.Location -> msg) -> Sub msg
```

Lets any Elm app be notified when the URL updates. For example:

```elm
type Msg
  = UrlUpdate Navigation.Location


subscriptions model =
  Ports.Router.urlUpdate UrlUpdate
```

See Elm's [Navigation](http://package.elm-lang.org/packages/elm-lang/navigation/latest/Navigation) package for details about the shape of `Location`.
