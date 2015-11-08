// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter',
    [
        'ionic',
        'ngStorage',
        'ngCordova',
        'app.controllers',
        'app.services',
        'user.controllers',
        'user.services'
    ]
)

/**
 *
 */
    .config(function ($stateProvider, $urlRouterProvider) {

        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            /* No need for this for now
            // create account state
            .state('app-signup', {
                url: "/signup",
                templateUrl: "templates/user/signup.html",
                controller: "SignUpController"
            })
            // login state that is needed to log the user in after logout
            // or if there is no user object available
            .state('app-login', {
                url: "/login",
                templateUrl: "templates/user/login.html",
                controller: "LoginController"
            })
*/
            // setup an abstract state for the tabs directive, check for a user
            // object here is the resolve, if there is no user then redirect the
            // user back to login state on the changeStateError
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html",
                
                resolve: {
                    user: function (UserService) {
                        var value = UserService.init();
                        return value;
                    }
                }
                
            })


            // Each tab has its own nav history stack:
            .state('tab.list', {
                url: '/list',
                views: {
                    'tab-list': {
                        templateUrl: 'templates/tab-list.html',
                        controller: 'ListCtrl'
                    }
                },
            })
            .state('tab.list-detail', {
                url: '/list/:itemId',
                views: {
                    'tab-list': {
                        templateUrl: 'templates/list-detail.html',
                        controller: 'ListDetailCtrl'
                    }
                }
            })

            .state('tab.quotes', {
                url: '/quotes',
                views: {
                    'tab-quotes': {
                        templateUrl: 'templates/tab-quotes.html',
                        controller: 'ListCtrl'
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
                cache: false,
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }

            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/quotes');

    })
    .run(function ($ionicPlatform, $rootScope, $state, $localStorage, $ionicSlideBoxDelegate) {


        $rootScope.$on('$stateChangeError',
            function (event, toState, toParams, fromState, fromParams, error) {

                debugger;

                console.log('$stateChangeError ' + error && (error.debug || error.message || error));

                // if the error is "noUser" the go to login state
                if (error && error.error === "noUser") {
                    event.preventDefault();

                    $state.go('app-login', {});
                }
            });

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            console.log('IONIC PLATFORM READY');
            console.log($rootScope);
            console.log($localStorage);
            console.log(Date());

            // initialize local storage objects if they do not already exist
            $rootScope.$storage = $localStorage;

            if (typeof $rootScope.$storage.quotations === 'undefined') {
                $rootScope.$storage.quotations = [];
            }

            if (typeof $rootScope.$storage.favourites === 'undefined') {
                $rootScope.$storage.favourites = [];
            }

            if (typeof $rootScope.$storage.quotesLastUpdated === 'undefined') {
                $rootScope.$storage.quotesLastUpdated = new Date(0);
            }

            if (typeof $rootScope.$storage.categoryNames === 'undefined') {
                $rootScope.$storage.categoryNames = [
                    {text: "Inspiring", checked: true},
                    {text: "Wisdom", checked: true},
                    {text: "Motivational", checked: true}

                ];
            }

            $ionicSlideBoxDelegate.update();
            
        });
    })
