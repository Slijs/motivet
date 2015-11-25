/**
 * beginnings of a controller to login to system
 * here for the purpose of showing how a service might
 * be used in an application
 */
angular.module('app.controllers', [])
    // THIS CONTROLLER TO BE REMOVED
    .controller('ListDetailCtrl', [
        '$state', '$scope', '$stateParams', 'AppService',  // <-- controller dependencies
        function ($state, $scope, $stateParams, AppService) {

            $scope.index = $stateParams.itemId;

        }])
    .controller('ListCtrl', [
        '$state',
        '$rootScope',
        '$scope',
        'AppService',
        '$localStorage',
        '$ionicSlideBoxDelegate',
        '$timeout',
        '$window',
        '$cordovaSocialSharing',
        '$ionicLoading',
        '$ionicPopup', // <-- controller dependencies
        function ($state, $scope, $rootScope, AppService, $localStorage, $ionicSlideBoxDelegate, $timeout, $window, $cordovaSocialSharing, $ionicLoading, $ionicPopup) {

            // Refresh quotesionicView
            $scope.refreshQuotes = function() {
                // make sure that there are categories selected to get quotes from
                if ($localStorage.categoryNames.some(AppService.atLeastOneSelected)) {
                    $scope.showLoadingIcon();
                    var dataList = null;
                    var categoryNames = $localStorage.categoryNames;

                    // Set the categories for the query for Parse.com
                    var ListQuotes = Parse.Object.extend("TheseQuotes");
                    var querySelector = new Array();
                    for (var i = 0; i < categoryNames.length; i++) {
                        if (categoryNames[i].checked) {
                            querySelection = new Parse.Query(ListQuotes);
                            querySelection.equalTo("category", categoryNames[i].text);
                            querySelector.push(querySelection);
                        }
                    };
                    // finalize the parse.com query options, then get the quotes
                    var query = Parse.Query.or.apply(Parse.Query, querySelector);
                    query.limit(30);
                    query.skip(0);
                    query.descending("updatedAt");
                    // check if the category selection has changed. If not, we can get only the latest quotes.
                    if (!($rootScope.categoryChanged) || (typeof $rootScope.categoryChanged === 'undefined')) {
                        query.greaterThan("createdAt", $localStorage.quotesLastUpdated);
                        console.log('getting only most recent quotes.')
                    }
                    console.log("getting quotes");
                    query.find({
                        success: function(_response) {
                            dataList = _response;
                            // Check if the category has changed. If so, we will repopulate the
                            // entire list, and change the categoryChanged back to false.
                            // Otherwise, we will simply add the new quotes.
                            if ($rootScope.categoryChanged) {
                                AppService.renewQuotes(dataList)
                                .then(function(quotesToStore){
                                    $localStorage.quotations = quotesToStore;
                                    // reload window to deal with blank quotations -- check if this is fixed after updating ionic/angular libraries.
                                    $window.location.reload(true);
                                    console.log('new quotation list created');
                                }, function(emptyQuoteArray) {
                                    console.log('No new quotes recieved.');
                                })
                                .then(function() {
                                    $rootScope.categoryChanged = false;
                                    $ionicSlideBoxDelegate.update();
                                    
                                    console.log('slideboxdelegate updated and categorychanged to false. renewQuotes() executed.');
                                    // Stop the ion-refresher from spinning
                                    $scope.$broadcast('scroll.refreshComplete');
                                    $scope.hideLoadingIcon();
                                });
                            } else if ((typeof $rootScope.categoryChanged === 'undefined') || !($rootScope.categoryChanged)) {
                                console.log($rootScope.categoryChanged);
                                AppService.addQuotes(dataList)
                                .then(function(quotesToStore) {
                                    $localStorage.quotations = quotesToStore;
                                    console.log('added quotes');
                                    // reload window to deal with blank quotations -- check if this is fixed after updating ionic/angular libraries.
                                    $window.location.reload(true);
                                }, function(emptyQuoteArray) {
                                    console.log('No new quotes recieved.');
                                })
                                .then(function() {
                                    $ionicSlideBoxDelegate.update();
                                    console.log('slideboxdelegate updated. addQuotes() executed');
                                    // Stop the ion-refresher from spinning
                                    $scope.$broadcast('scroll.refreshComplete');
                                    $scope.hideLoadingIcon();
                                });
                            }
                            $localStorage.quotesLastUpdated = new Date();
                        },
                        error: function() {
                            $scope.hideLoadingIcon();
                            $scope.$broadcast('scroll.refreshComplete');
                            $scope.showAlert("Server Error", "Problem downloading quotes. Try again later.");
                        }
                    }).then(function() {                  
                        if ($localStorage.firstLoad) {
                            
                        }
                    });
                // no categories were selected, alert the user
                } else {
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.hideLoadingIcon();
                    $scope.showAlert("No Categories Selected", "There are no categories selected for you to view. Please select one or more categories in the Settings tab.");
                }
            }

            $scope.showAlert = function(_title, _message) {
                $ionicPopup.alert({
                    title: _title,
                    content: _message
                }).then(function(res) {
                    console.log('Showed alert');
                });
            };

            $scope.likeQuote = function (index) {
                console.log("like button clicked");
                console.log("quote is " + $localStorage.quotations[index].quote);
                if ($localStorage.favourites.length == 1 && $localStorage.favourites[0].objectId === "SPECIAL") {
                    $localStorage.favourites = [$localStorage.quotations[index]]
                } else {
                    if ($localStorage.favourites.indexOf($localStorage.quotations[index]) <= -1) {
                        $localStorage.favourites.push($localStorage.quotations[index]);
                    } else {
                        console.log("quote object already exists in favourites. //TODO: Shift to top of list (last index)");
                    }
                }
            }

            $scope.unlikeFavourite = function (quote) {
                if ($localStorage.favourites.length == 1) {
                    $localStorage.favourites = [{"category":"Wisdom","objectId":"SPECIAL","quote":"Looks like you haven't liked any Motivets! Click on the heart button next to your favourite quotes to save them here."}];
                } else {
                    $localStorage.favourites.splice($localStorage.favourites.indexOf(quote), 1);
                }
            }

            $scope.shareQuote = function (quote) {
                console.log("share button clicked");
                console.log("quote is " + quote.quote);
                $cordovaSocialSharing.share(quote.quote, "Here's some " + quote.category, "https://pbs.twimg.com/profile_images/378800000614832437/158880c3ce8f901b877d0113d8f0a4dc_400x400.jpeg", "https://twitter.com/JoshOkello");
            }

            $scope.shareFavourite = function (quote) {
                console.log("share button clicked");
                console.log("quote is " + quote.quote);
                $cordovaSocialSharing.share(quote, quote.category + " for you.", "www/img/ionic.png", "https://twitter.com/JoshOkello");
            }

            $scope.doLogoutAction = function () {
                UserService.logout().then(function () {

                    // transition to next state
                    $state.go('app-login');

                }, function (_error) {
                    alert("error logging in " + _error.debug);
                })
            }

            $scope.navSlide = function(index) {
                $localStorage.quotations = $localStorage.quotations;
                $ionicSlideBoxDelegate.slide(index, 500);
            }

            $scope.whatIsStringLength = function(string) {
                if (string.length > 75) {
                    return 'long';
                } else if (string.length < 30) {
                    return 'short';
                } else {
                    return 'medium';
                }
            }

            // Load the quotes on page load
            //$scope.refreshQuotes();

            // This is called after the delay in refreshQuotes()
            //$ionicSlideBoxDelegate.update();

            // Listen for a request to refresh the quotes
            $scope.$on('refreshQuotes', function(event, args) {
                console.log("received broadcast refreshQuotes");
                $scope.refreshQuotes();
            });

            $scope.$on('$ionicView.enter', function(event, args) {
                console.log('$ionicView.enter fired');
                if ($localStorage.quotations.length == 0 || (typeof $localStorage.quotations === 'undefined')) {
                    $scope.refreshQuotes();
                }
                $timeout(function() {
                    $ionicSlideBoxDelegate.update();
                    console.log('ionicSlideBoxDelegate updated');
                }, 1000);
            });

            // Loading indicators
            $scope.showLoadingIcon = function() {
                $ionicLoading.show({
                    template: 'Loading...'
                });
            };

            $scope.hideLoadingIcon = function(){
                $ionicLoading.hide();
            };



        }])
    .controller('AccountCtrl', [
        '$state', '$scope', '$rootScope', 'AppService', 'UserService', '$localStorage', '$timeout', '$ionicPopup', '$ionicLoading', // <-- controller dependencies
        function ($state, $scope, $rootScope, AppService, UserService, $localStorage, $timeout, $ionicPopup, $ionicLoading) {
            $scope.noCategoriesSelected = false;

            $scope.categoryClick = function() {
                $scope.categoryClicked = true;
            }

            // broadcast a request to refresh quotes
            $scope.categorySelectionChange = function() {
                // make sure at least one category is checked
                if ($localStorage.categoryNames.some(AppService.atLeastOneSelected)) {
                    $rootScope.categoryChanged = true;
                    $rootScope.$broadcast('refreshQuotes');
                    $scope.categoryClicked = false;
                    $localStorage.selectedCategories = []; 
                    console.log("sent broadcast refreshQuotes");
                    for (i = 0; i < $localStorage.categoryNames.length; i++) {
                        if ($localStorage.categoryNames[i].checked) {
                            $localStorage.selectedCategories.push($localStorage.categoryNames[i].text);
                        }
                    }
                } else {
                    $ionicPopup.alert({
                        title: 'Must Select a Category',
                        content: 'You must select at least one category.'
                    }).then(function(res) {
                        console.log('Showed alert');
                        $localStorage.categoryNames[0].checked = true;
                    });
                } 
            };

            $scope.$on('$ionicView.leave', function(event, args) {
                if ($localStorage.categoryNames.every(AppService.atLeastOneSelected)) {
                    $localStorage.categoryNames[0].checked = true;
                }
                console.log('no categories selected when leaving settings, automatically selected category 1.');
            });

        }]);
