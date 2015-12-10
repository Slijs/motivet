angular.module('user.services', [])

    .service('UserService', ['$q', '$http', '$localStorage',
        function ($q, $http, $localStorage) {

            var parseInitialized = false;

            return {

                /**
                 *
                 * @returns {*}
                 */
                init: function () {
                    /*
                    document.addEventListener("deviceready", function() {
                        try {
                          parsePlugin.initialize();
                          console.log("parsePlugin works")
                        } catch (ex) {
                          alert("Error: " + ex);
                        }
                    }, false);*/
                    //debugger;
                    // if initialized, then return the activeUser
                    if (parseInitialized === false) {
                        var parseConfiguration = null;
                        var parsePlugin = window.parsePlugin;
            
                        $http.get('parse-config.json').success(function(data) {
                            parseConfiguration = data;
                        }).then(function() {
                            console.log(JSON.stringify(parseConfiguration));
                            //Parse.initialize(ParseConfiguration.applicationId, ParseConfiguration.javascriptKey);
                            Parse.initialize(parseConfiguration.applicationId, parseConfiguration.javascriptKey);
                            
                            // parsePlugin initialization, for installation ids and other push notification helpers
                            try {
                                // on sign in, add the user pointer to the Installation
                                parsePlugin.initialize(parseConfiguration.applicationId, parseConfiguration.clientKey, function() {

                                  parsePlugin.getInstallationObjectId( function(id) {
                                    // Success! You can now use Parse REST API to modify the Installation
                                    // see: https://parse.com/docs/rest/guide#objects for more info
                                    console.log("PARSE NOTIFICATION PLUGIN SUCCESSFULLY INITIALIZED. installation object id: " + id);
                                    $localStorage.installData = {
                                        installation_id: id
                                    }
                                  }, function(error) {
                                    console.error('Error getting installation object id. ' + error);
                                  });

                                }, function(e) {
                                    console.error('Error initializing parsePlugin. initialization failed. Reason: ' + e);
                                });
                            } catch (ex) {
                                console.error("Error initializing parsePlugin. Caught exception: " + ex);
                            }


                            parseInitialized = true;
                            console.log("parse initialized in init function");

                        });
                    }
                    return $q.when(parseInitialized);
                    //return $q.resolve();
/*
                    var currentUser = Parse.User.current();
                    if (currentUser) {
                        return $q.when(currentUser);
                    } else {
                        return $q.reject({error: "noUser"});
                    }
*/
                },
                /**
                 *
                 * @param _userParams
                 */
                createUser: function (_userParams) {

                    var user = new Parse.User();
                    user.set("username", _userParams.email);
                    user.set("password", _userParams.password);
                    user.set("email", _userParams.email);
                    user.set("first_name", _userParams.first_name);
                    user.set("last_name", _userParams.last_name);
                    user.set("Inspiring", "true");
                    user.set("Wisdom", "true");
                    user.set("Motivational", "true");

                    // should return a promise
                    return user.signUp(null, {});

                },
                /**
                 *
                 * @param _parseInitUser
                 * @returns {Promise}
                 */
                currentUser: function (_parseInitUser) {

                    // if there is no user passed in, see if there is already an
                    // active user that can be utilized
                    _parseInitUser = _parseInitUser ? _parseInitUser : Parse.User.current();

                    console.log("_parseInitUser " + Parse.User.current());
                    if (!_parseInitUser) {
                        return $q.reject({error: "noUser"});
                    } else {
                        return $q.when(_parseInitUser);
                    }
                },
                /**
                 *
                 * @param _user
                 * @param _password
                 * @returns {Promise}
                 */
                login: function (_user, _password) {
                    return Parse.User.logIn(_user, _password);
                },
                /**
                 *
                 * @returns {Promise}
                 */
                logout: function (_callback) {
                    var defered = $q.defer();
                    Parse.User.logOut();
                    defered.resolve();
                    return defered.promise;

                },

                registerPushCategories: function (selectedCategories) {
                    console.log("registering push categories");
                    try {
                        /*
                        var ParseConfiguration = null;
                        var putObject = null;

                        $http.get('parse-config.json').success(function(data) {
                            ParseConfiguration = data;
                        }).then(function() {
                            console.log(JSON.stringify(ParseConfiguration));
                            // can only use rest API, so create the object to put
                            putObject = {
                                headers: {
                                    "X-Parse-Application-Id": ParseConfiguration.applicationId,
                                    "X-Parse-REST-API-Key": ParseConfiguration.restApiKey,
                                    "Content-Type": "application/json",
                                    'Authorization': 'basic ' + 'cHBlazdUNWU5akhFZ3hSaW1ob3ZlODNmUm1pRExndlZYMjdWSDFZSDo='
                                },
                                data: {
                                    "channels": JSON.stringify($localStorage.selectedCategories)
                                }
                            };
                        }).then(function() {
                            console.log(JSON.stringify(putObject));
                            $http.put('https://api.parse.com/1/installations/mrmBZvsErB', putObject).then(function(response) {
                                // success
                                console.log("update categories succeeded");
                            }, function(response) {
                                //error
                                console.log("update categories failed" + JSON.stringify(response));
                            });
                        });*/
                        /*
                        var xhr = new XMLHttpRequest();
                        xhr.open("PUT", "https://api.parse.com/1/installations", true);
                        xhr.setRequestHeader("X-Parse-Application-Id", "gSvrhx9CTETrwe2RDv1BJSc0u1FvKc6XG73exanZ");
                        xhr.setRequestHeader("X-Parse-REST-API-Key", "ppek7T5e9jHEgxRimhove83fRmiDLgvVX27VH1YH");
                        xhr.setRequestHeader("Content-Type", "application/json");

                        xhr.onreadystatechange = function() {
                          if (xhr.readyState == 4) {
                            var result = JSON.parse(xhr.responseText);
                            if (result.objectId) {
                              alert("saved an object with id: " + result.objectId);
                            }
                          }
                        }
                          
                        var data = JSON.stringify({"channels": ["Wisdom", "Inspiring", "Motivational"],"deviceType": "android","deviceToken":$localStorage.deviceToken});
                        xhr.send(data);
                        */

                        window.parsePlugin.getSubscriptions(function(currentSubscriptionsAsString) {
                            /*if (currentSubscriptions.length > 0) {
                                getSelectedArrays(selectedCategories, currentSubscriptions).then(function(categoriesToAdd, categoriesToRemove){
                                    console.log('Add these categories: ' + categoriesToAdd);
                                    console.log('Remove these categories: ' + categoriesToRemove);
                                })
                            }*/
                            console.log(currentSubscriptionsAsString);

                            if (currentSubscriptionsAsString.length > 0) {
                                if (typeof currentSubscriptionsAsString === 'string' && currentSubscriptionsAsString[0] === "[" && currentSubscriptionsAsString.length === 2) {
                                    var currentSubscriptions = JSON.parse(currentSubscriptionsAsString);
                                } else if (typeof currentSubscriptionsAsString === 'string' && currentSubscriptionsAsString[0] === "[" && currentSubscriptionsAsString.length != 2) {
                                    var currentSubscriptions = JSON.parse(currentSubscriptionsAsString.replace(/\b/g, "\""));
                                } else if (currentSubscriptionsAsString.constructor === Array) {
                                    var currentSubscriptions = currentSubscriptionsAsString;
                                } else {
                                    var currentSubscriptions = currentSubscriptionsAsString.replace(/\b/g, "\"");
                                }
                            }
                            
                            console.log("currentSubscriptions: " + currentSubscriptions + " currentSubscriptions.length: " + currentSubscriptions.length);

                            if (currentSubscriptions.length > 0) {
                                var categoriesToAdd = selectedCategories.filter(function(element) {
                                    return currentSubscriptions.indexOf(element) < 0;
                                });

                                var categoriesToRemove = currentSubscriptions.filter(function(element) {
                                    return selectedCategories.indexOf(element) < 0;
                                });
                            } else {
                                var categoriesToAdd = selectedCategories;
                            }

                            console.log('Add these categories: ' + categoriesToAdd);
                            console.log('Remove these categories: ' + categoriesToRemove);

                            if (categoriesToAdd.length > 0) {
                                for (i = 0; i < categoriesToAdd.length; i++) {
                                    parsePlugin.subscribe(categoriesToAdd[i], function() {
                                        console.log('Subscribed to ' + categoriesToAdd[i] + " channel");
                                    }, function(e) {
                                        console.log('SUBSCRIPTION FAILED: ' + categoriesToAdd[i]);
                                    });
                                }
                            }

                            if (categoriesToRemove.length > 0) {
                                for (i = 0; i < categoriesToRemove.length; i++) {
                                    parsePlugin.unsubscribe(categoriesToRemove[i], function() {
                                        console.log('Unsubscribed from ' + categoriesToRemove[i] + " channel");
                                    }, function(e) {
                                        console.log('UNSUBSCRIPTION FAILED: ' + categoriesToRemove[i]);
                                    });
                                }
                            }

                        }, function(e) {
                            console.log('error getting current subscriptions: ' + e);
                        });
    /*
                        getSelectedArrays: function(selectedCategories, currentSubscriptions) {
                            return $q(function(resolve, reject){
                                var categoriesToAdd = selectedCategories.filter(function(element) {
                                    return currentSubscriptions.indexOf(element) < 0;
                                });

                                var categoriesToRemove = currentSubscriptions.filter(function(element) {
                                    return selectedCategories.indexOf(element) < 0;
                                });

                                resolve(categoriesToAdd, categoriesToRemove);
                            });

                        }*/

    /*
                        function getSelectedArrays(selectedCategories, currentSubscriptions, $q) {
                            return function() {
                                var defer = $q.defer()

                                var categoriesToAdd = selectedCategories.filter(function(element) {
                                    return currentSubscriptions.indexOf(element) < 0;
                                });

                                var categoriesToRemove = currentSubscriptions.filter(function(element) {
                                    return selectedCategories.indexOf(element) < 0;
                                });

                                return defer.resolve(categoriesToAdd, categoriesToRemove);

                                return defer.promise
                            }
                        }*/
                    } catch (e) {
                        console.log("Could not register push categories. Error: " + e);
                    }

                }

            }
        }]);
