rm -rf platforms plugins hooks &&
cordova plugin add cordova-plugin-camera &&
cordova plugin add cordova-plugin-console &&
cordova plugin add cordova-plugin-device &&
cordova plugin add cordova-plugin-media &&
cordova plugin add cordova-plugin-file &&
cordova plugin add cordova-plugin-vibration &&
cordova plugin add cordova-plugin-statusbar &&
cordova plugin add cordova-plugin-geolocation &&
cordova plugin add cordova-plugin-dialogs &&
cordova plugin add cordova-plugin-inappbrowser &&
cordova plugin add cordova-plugin-network-information &&
cordova plugin add cordova-plugin-crosswalk-webview &&
cordova plugin add https://github.com/phonegap-build/PushPlugin.git &&
cordova plugin add https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git &&
cordova plugin add com.ionic.keyboard &&
cordova platform add android
