# Tracker: How to target more devices with less icons & launch images

*I recently started [building a Geo Tracker App in Titanium](http://www.appcelerator.com/blog/2016/04/building-a-geo-tracker-app-in-titanium/) and [open sourced the code on GitHub](https://github.com/fokkezb/tracker). I will guide you through the code in a series of blog posts and share some best practices as I continue to develop the app.*

Let's start with some new Titanium features the app uses.

## A single DefaultIcon to rule them all

You used to have a whole bunch of `appicon*.png` images in [app/assets/iphone](../app/assets/iphone) to cater for all the different Apple devices and the different places where they display the icon.

Since Titanium 5.0 you can now have a single 1024px by 1024px [DefaultIcon.png](../DefaultIcon.png) in the root of your project and Titanium will generate these icons for you. This is also supported for Windows. Android will follow soon. Since those platforms support 32-bit PNG and iOS demands 24-bit, you can provide a `DefaultIcon-ios.png` specifically for iOS.

## A single Storyboard Launch File for all iOS devices

In addition to icons you also used to have a big set of `Default*.png` images in [app/assets/iphone](../app/assets/iphone) to be used as Launch Image (aka Splash Screen).

Since Titanium 5.2.0 you can now use a builtin or custom Xcode Storyboard as Launch File. These are the same storyboards that you'd use to build the interface of your app in Xcode. They can contain most of the available UI controls, including images. When your app first launches, iOS will capture a static image which it will use as Launch Image.

> **NOTE:** The iPad Pro is the first device that only support Launch Files.

### Using the builtin Storyboard

The *G.O. Tracker* uses the builtin in storyboard. This storyboard displays a centered image on a single color background. By default it uses the `DefaultIcon.png` to generate the image and a white background color.

In the app's [tiapp.xml](../tiapp.xml#L18) you can see how I enable the Launch Screen Storyboard and override the default background color to match the blue of the [DefaultIcon.png](../DefaultIcon.png). Finally I set the minimum supported iOS version to 8.0 so I don't need to include traditional Launch Images for older devices. Titanium 5.3 will do this [automatically](https://jira.appcelerator.org/browse/TIMOB-23172).

```xml
  <ios>
    <enable-launch-screen-storyboard>true</enable-launch-screen-storyboard>
    <default-background-color>#0054a6</default-background-color>
    <min-ios-ver>8.0</min-ios-ver>
    ...
```

To learn more about using a different image or even a fully custom Storyboard read [Titanium 5.2.0: Launch Files, iPad Pro, Slide Over and Split View](http://www.appcelerator.com/blog/2016/02/titanium-5-2-0-launch-files-ipad-pro-slide-over-and-split-view/).

## Less and smaller Android launch images with 9-Patch

On Android you can do with less and smaller launch/splash images as well thanks to [Nine-patch](http://developer.android.com/guide/topics/graphics/2d-graphics.html#nine-patch). These stretchable bitmaps allow you to achieve the same result as our builtin iOS Storyboard Launch File.

### How Nine-patch works
If you zoom into the [background.9.png](../app/platform/android/res/drawable-xxxhdpi/background.9.png) files in the [app/platform/android/res](../app/platform/android/res) folder you'll notice that the PNGs have a 1px transparent border with some black pixels on each side. The black pixels on te top and left side indicate where the image can be stretched while the right and bottom side indicate the area in which any child views need to be contained.

> **NOTE:** Even though the Android documentation still states the padding box (right and bottom pixels) are optional, [they are not](https://jira.appcelerator.org/browse/TIMOB-19190). Since Android 4.x you will see black blocks across the splash screen if you leave them out.

### Generating them with TiCons

You can use the TiCons [CLI](https://www.npmjs.com/package/ticons) or [website](http://ticons.fokkezb.nl/) to generate these 9-Patch splash using the `DefaultIcon.png` or another image. TiCons will add a transparent border with pixels to make only the outermost pixel of your image stretchable. With our [DefaultIcon.png](../DefaultIcon.png) this will result in a blue splash screen with the icon centerered, just like we have for iOS.

Code Strong, Code with Compassion! 🚴
