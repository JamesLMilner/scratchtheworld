
(function() {
    // Register Service worker
    window.addEventListener("load", function() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/serviceworker.js')
            .then(function(registration) {

                registration.addEventListener('updatefound', function() {
                    // A wild service worker has appeared in reg.installing!
                    const newWorker = registration.installing;
                
                    newWorker.state;
                    // "installing" - the install event has fired, but not yet complete
                    // "installed"  - install complete
                    // "activating" - the activate event has fired, but not yet complete
                    // "activated"  - fully active
                    // "redundant"  - discarded. Either failed install, or it's been
                    //                replaced by a newer version
                
                    newWorker.addEventListener('statechange', function() {
                        console.log("State change", newWorker.state);
                        // newWorker.state has changed
                        if (newWorker.state === "activated") {
                            var yes = confirm("A new version of Scratch the World is available, would you like to reload?")
                            if (yes) {
                                location.reload()
                            }
                        }
                    });
                });

                // registration worked
                registration.update();


                console.debug('Registration of service worker succeeded');
            }).catch(function(error) {
                // registration failed
                console.error('Registration failed with ' + error);
            });
        }
    });

    
    
})();
