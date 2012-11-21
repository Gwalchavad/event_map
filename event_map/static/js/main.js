// Filename: main.js
require([
  // Load our app module and pass it to our definition function
  'jquery',
  'app',
  
], function($,App){
    // The "app" dependency is passed in as "App"
    $(function(){
        App.initialize();
    });
});


