# Elm Router

**Write less JavaScript.**

Create a website with many small Elm applications, powered by reusable Elm ports from NPM.

## Why use Elm Router?

JavaScript can't provide the safety and guarantees that Elm can. But Elm [requires you to use JavaScript](https://guide.elm-lang.org/interop/javascript.html) to (1) launch Elm apps and (2) perform side effects. (Sending Websockets, saving to LocalStorage, etc.)

Elm Router minimizes the JavaScript you'll write by:

1. Launching Elm apps **in Elm** instead of JavaScript.
2. Powering Elm apps with generic, *reusable* port modules for side effects.

## Docs

- [Installation](https://github.com/knledg/elm-router#installation)
- [Setting Up Routes](https://github.com/knledg/elm-router/blob/master/docs/SettingUpRoutes.md)
- [Adding Port Modules](https://github.com/knledg/elm-router/blob/master/docs/AddingPortModules.md)
- [Installation Notes for Build Tools](https://github.com/knledg/elm-router/blob/master/docs/BuildTools.md)
- [API Reference](https://github.com/knledg/elm-router/blob/master/docs/API.md)

## Installation

Make sure you understand [how Elm and JavaScript interact](https://guide.elm-lang.org/interop/javascript.html).

### Installation: The JavaScript Part

Using [npm](https://www.npmjs.com/):

```
$ npm install --save elm-router
```

Then add this to your JavaScript:

```javascript
var elmRouter = require("elm-router");
elmRouter.start(Elm);
```

(Not sure where `Elm` comes from? See the [Elm tutorial](https://guide.elm-lang.org/interop/javascript.html).)

### Installation: The Elm Part

```
$ elm-package install http
$ elm-package install navigation
```

**Note:** Exact path to `node_modules` may be different for you below.

#### Add source directory to `elm-package.json`

```js
{
    ...

    "source-directories": [
        ...
        "../../node_modules/elm-router/lib/elm"
    ],

    ...
}
```

#### Include ElmRouter app in `elm-make` command

```
$ elm-make --output elm.js ./MyApp.elm ./MyOtherApp.elm ../node_modules/elm-router/lib/elm/ElmRouter/App.elm
```

If you're using a build tool like Webpack or Brunch to run `elm-make` for you, [see this guide](/docs/BuildTools.md).


#### Add `Routes.elm` template to your project

Use the command line tool. (Or just copy-and-paste [from here](https://github.com/knledg/elm-router/blob/master/lib/elm-templates/Routes.elm).)

```
$ npm install -g elm-router
$ cd /path/to/elm/project    <-- This directory must be in `source-directories` in elm-package.json
$ elm-router init
```

## What do Elm Routes look like?

Replace this JavaScript code:

```javascript
// Code that only runs on contact page:
Elm.ContactForm.App.embed(document.getElementById('contact_form'), {
  showPhoneField: false,
  successMessage: 'Thanks! We\'ll be in touch.'
});
```

With this Elm code:

```elm
import Json.Encode exposing (object, string, bool)


routes location =
  [ Route (OnUrl "^/contact$") -- Regex for contact page
      [ EmbedWithFlags "ContactForm" "#contact_form" <| object
          [ ("showPhoneField", bool False)
          , ("successMessage", string "Thanks! We'll be in touch.")
          ]
      , -- Other apps on contact page
      ]
  ]
```

For more information about building out your routes, [see this guide](/docs/SettingUpRoutes.md).

## Questions or Problems?

Feel free to create an issue in the [GitHub issue tracker](https://github.com/knledg/elm-router/issues).
