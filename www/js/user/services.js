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

                    //debugger;
                    // if initialized, then return the activeUser
                    if (parseInitialized === false) {
                        var ParseConfiguration = null;
            
                        $http.get('parse-config.json').success(function(data) {
                            ParseConfiguration = data;
                        }).then(function() {
                            console.log(JSON.stringify(ParseConfiguration));
                            //Parse.initialize(ParseConfiguration.applicationId, ParseConfiguration.javascriptKey);
                            Parse.initialize(ParseConfiguration.applicationId, ParseConfiguration.javascriptKey);
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

                registerPushCategories: function () {
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
                }

            }
        }]);
