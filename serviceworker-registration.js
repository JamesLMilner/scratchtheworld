
(function() {
    // Register Service wroker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/serviceworker.js')
        .then(function(registration) {
            // registration worked
            registration.update();
            console.debug('Registration of service worker succeeded');
        }).catch(function(error) {
            // registration failed
            console.error('Registration failed with ' + error);
        });
    }
})();
