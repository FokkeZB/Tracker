# Tracker: How to protect your global scope and still share variables

*I recently started [building a Geo Tracker App in Titanium](http://www.appcelerator.com/blog/2016/04/building-a-geo-tracker-app-in-titanium/) to [support Compassion](http://www.fokkezb.nl/rwanda) and [open-sourced the code](../) for us all to learn from. I will guide you through the code in a series of blog posts and share some best practices as I continue to develop the app.*

Today I'd like to talk to you about protecting the global scope.

## alloy.js becomes app.js

If you have been using, or maybe still are using Titanium "Classic" without the Alloy MVC you'll know that `Resources/app.js` is the file that Titanium first loads to bootstrap your app. From there you'll (hopefully) use [require()](http://docs.appcelerator.com/platform/latest/#!/api/Global-method-require) to load additional CommonJS modules.

In Alloy your bootstrap file is [app/alloy.js](../app/alloy.js). When Alloy compiles it takes whatever you have there and wraps it in the following [template](https://github.com/appcelerator/alloy/blob/master/Alloy/template/app.js):

```js
var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

// your app/alloy.js code here

Alloy.createController("index");
```

The last statement will call `require('alloy/controllers/index')` to load the main controller. Together this becomes the `Resources/app.js` file of the Titanium Classic project Alloy compiles down to.

This means that what applies to `Resources/app.js` in a classic project also applies to `app/alloy.js` in an Alloy project.

## app.js is global scope

As you will know if you have been using Alloy, you can use the Underscore (`_`), Backbone and the Alloy libraries anywhere in your app without explicitly requiring them. This is because they are required and referenced from `app.js` as we've just seen.

Variables defined in the root of `app.js` are available anywhere in your app.

This is also known as **global scope**. Variables that you define in other CommonJS modules are limited to just that **module scope**, while in both cases variables defined in functions are limited to that **function scope**. You can always access variables in higher up in this hierarchy, as the following example demonstrates:

**app/lib/foo.js**

```js
var moduleScope = true;

function fn() {
	moduleScope === true;
	
	var functionScope = true;
	forgotVar = true;
}

fn();

functionScope === undefined;
forgotVar === true;
```

Notice that if you forget `var` the variable will belong to the module (or global, for `app.js`) scope instead of the function scope. This can easily cause unexpected memory leaks or stateful variables where you expect them to be not, e.g. in Alloy Controllers.

## Why you should protect global scope

Although it might sound convenient to have variables available anywhere in your app you should actually try to avoid this. Unlike a simple webpage, an app will be active for a long time and the more variables you have in global scope, the more memory your app will eat and unless you manually clean it up it will eventually crash.

## How to protect your global scope

As we discussed variables defined in functions are limited to that **function scope**. We can use this protect the global scope in `app.js`. Simply wrap your bootstrap code in a function:

**app/alloy.js**

```js
function init() {
	var functionScope = true;
}

init();
```

Which we can simplify to a [Self Executing Function]() (SEF) as I do in the app's [app/alloy.js](../app/alloy.js):

```js
(function init() {
	var functionScope = true;
})();
```

## How to make common variables accessible

So how *should* you make variables available to multiple CommonJS modules then? Well, by using exactly that: another CommonJS module that you explicitly require where needed. The [app/lib](../app/lib) folder is meant to store libraries like these. When Alloy compiles they are simply copied over to `Resources`.

**app/lib/state.js**

```
exports.counter = 0;
```

**app/controllers/index.js**

```
require('state').counter++;
```

CommonJS modules are only executed when they are first required. Every following call to `require()` will return the previously constructed exported object, which makes it really fast and ideal for stateful data.

In the app [app/lib/tracker.js](../app/lib/tracker.js#L24) is a good example as it keeps track of the `currentRide` in a stateful private variable and can be required anywhere to check of change the state using its public interface.

## Config.json

A common use case for global variables is for storing configuration. In Alloy you'll want to use [app/config.json](../app/config.json) for this. This JSON file allows you set variables for specific platforms and environments. Alloy will compile it to an `CFG.js` CommonJS module which is available via `Alloy.CFG` anywhere in your app, including XML attribute and TSS property values.

It's best practice not to change this property at run-time, although as you can see for this app I do override the default measurement system in [app/alloy.js](../app/alloy.js).

## Alloy.Globals

For variables that you do set and change at run-time Alloy has another, empty object available under `Alloy.Globals`. It's up to you what properties you add, although I suggest to only use this for globals that you need to refer from XML and TSS. Anywhere else it's better to use a CommonJS module to explicitly require where needed.

In [app/alloy.js](../app/alloy.js#L4) you can see I use `Alloy.Globals` to keep a global reference to the FontAwesome unicodes so that I can use them in TSS files like [app/styles/tracker.tss](../app/styles/tracker.tss#L29).

## Using SEFs in Controllers

You might also have noticed I use SEFs in controllers (and libraries) as well. This is not to protect the scope like in `app/alloy.js` but simply to keep my code organised. As I mentioned CommonJS modules are only executed once and instead of by grouping it in a SEF I try to make it clear that there's no other code in between or following all of the functions that executes at that time.

## Stop using Ti.include()

Finally, if you are still using [Ti.include()](http://docs.appcelerator.com/platform/latest/#!/api/Titanium-method-include) now is the time to finally say goodbye. We have deprecated this API in 3.3.0 will remove it in 6.0 which will come out with iOS X. One of the reasons for removing `Ti.include()` is that it evaluates in the root context, thus pollutes the global scope. Please refactor any files you include as [CommonJS Modules](http://docs.appcelerator.com/platform/latest/#!/guide/CommonJS_Modules_in_Titanium) so you can [require()](http://docs.appcelerator.com/platform/latest/#!/api/Global-method-require) them instead.

Code Strong, Code Safe, Code with Compassion! 🚴