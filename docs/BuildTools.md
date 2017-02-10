# Using Build Tools like Webpack, Gulp, or Brunch

## The End Goal

`elm-make` ultimately needs to run with `node_modules/elm-router/lib/elm/ElmRouter/App.elm` given as one of the apps.

For example:

```
$ elm-make --output elm.js ./App1.elm ./App2.elm ../node_modules/elm-router/lib/elm/ElmRouter/App.elm
```

If you're using a build tool like [Brunch](http://brunch.io/) or [Webpack](https://webpack.js.org/) so that you don't manually run `elm-make`, you'll need to figure out how to make this happen.

## Example: Webpack + [elm-webpack-project-loader](https://github.com/joeandaverde/elm-webpack-project-loader)

With these two tools, you'll need to add the path to `"main-modules"` in your `.elmproj` file:

```javascript
// my-elm-project.elmproj
{
  ...

  "main-modules": [
    ...

    "../../node_modules/elm-router/lib/elm/ElmRouter/App.elm" // Exact path to node_modules may be different
  ]
}
```
