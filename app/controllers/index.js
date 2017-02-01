if (OS_ANDROID) {
    $.index.addEventListener('androidback', function () {
        var intent = Ti.Android.createIntent({
            action: Ti.Android.ACTION_MAIN
        });
        intent.addCategory(Ti.Android.CATEGORY_HOME);
        Ti.Android.currentActivity.startActivity(intent);
    });
}

$.index.open();
