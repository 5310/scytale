Scytale
=======

Scytale is a simple passkey protected reference based note-taking application build for Android. It is built using localstorage, Knockout.js, Fries, and Cordova/Phonegap. 

You can download the app at [Phonegap Build](https://build.phonegap.com/apps/459138/share).

That is, if it worked! 
----------------------

While the app works properly on a desktop browser (well, Chrom/e/ium) it doesn't work properly after packaged. Not even Fries, or my stylesheet loads properly, and the modal dialog doesn't show at all, and the back button isn't overridden. The app also clearly needs a splash to hide the ugly webview header. 

I'll have to debug it, perhaps starting by packaging the Fries Cordova project to see if it works and how. But that'll have to wait.
