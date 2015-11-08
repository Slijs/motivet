/**
 * beginnings of a controller to login to system
 * here for the purpose of showing how a service might
 * be used in an application
 */
angular.module('app.controllers', [])
    .controller('ListDetailCtrl', [
        '$state', '$scope', '$stateParams', 'AppService',  // <-- controller dependencies
        function ($state, $scope, $stateParams, AppService) {

            $scope.index = $stateParams.itemId;

        }])
    .controller('ListCtrl', [
        '$state', '$rootScope', '$scope', 'AppService', '$localStorage', '$ionicSlideBoxDelegate', '$timeout', '$window', '$cordovaSocialSharing', '$ionicLoading', // <-- controller dependencies
        function ($state, $scope, $rootScope, AppService, $localStorage, $ionicSlideBoxDelegate, $timeout, $window, $cordovaSocialSharing, $ionicLoading) {

            // Refresh quotes
            $scope.refreshQuotes = function() {
                $scope.showLoadingIcon();
                var dataList = null;
                var categoryNames = $rootScope.$storage.categoryNames;

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
                    query.greaterThan("createdAt", $rootScope.$storage.quotesLastUpdated);
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
                                $rootScope.$storage.quotations = quotesToStore;
                                // reload window to deal with blank quotations -- check if this is fixed after updating ionic/angular libraries.
                                $window.location.reload(true);
                                console.log('new quotation list created');
                            }, function(emptyQuoteArray) {
                                console.log('No new quotes recieved.');
                            })
                            .finally(function() {
                                $rootScope.categoryChanged = false;
                                $timeout(function() {
                                    $ionicSlideBoxDelegate.update();
                                    console.log('updated slidebox');
                                }, 3000);
                                
                                console.log('slideboxdelegate updated and categorychanged to false. renewQuotes() executed.');
                                // Stop the ion-refresher from spinning
                                $scope.$broadcast('scroll.refreshComplete');
                                $scope.hideLoadingIcon();
                            });
                        } else if ((typeof $rootScope.categoryChanged === 'undefined') || !($rootScope.categoryChanged)) {
                            console.log($rootScope.categoryChanged);
                            AppService.addQuotes(dataList)
                            .then(function(quotesToStore) {
                                $rootScope.$storage.quotations = quotesToStore;
                                console.log('added quotes');
                                // reload window to deal with blank quotations -- check if this is fixed after updating ionic/angular libraries.
                                $window.location.reload(true);
                            }, function(emptyQuoteArray) {
                                console.log('No new quotes recieved.');
                            })
                            .finally(function() {
                                $ionicSlideBoxDelegate.update();
                                console.log('slideboxdelegate updated. addQuotes() executed');
                                // Stop the ion-refresher from spinning
                                $scope.$broadcast('scroll.refreshComplete');
                                $scope.hideLoadingIcon();
                            });
                        }
                        $rootScope.$storage.quotesLastUpdated = new Date();
                    }
                }).then(function() {                  
                    // something
                });
            }

            $scope.likeQuote = function (index) {
                console.log("like button clicked");
                console.log("quote is " + $rootScope.$storage.quotations[index].quote);
                $rootScope.$storage.favourites.push($rootScope.$storage.quotations[index]);
            }

            $scope.unlikeFavourite = function (index) {
                console.log("unlike button clicked");
                $rootScope.$storage.favourites.splice(index, 1);
            }

            $scope.shareQuote = function (index) {
                console.log("share button clicked");
                console.log("quote is " + $rootScope.$storage.quotations[index].quote);
                $cordovaSocialSharing.share($rootScope.$storage.quotations[index].quote, "for you.", "www/img/ionic.png", "https://twitter.com/JoshOkello");
            }

            $scope.shareFavourite = function (index) {
                console.log("share button clicked");
                console.log("quote is " + $rootScope.$storage.favourites[index].quote);
                $cordovaSocialSharing.share($rootScope.$storage.favourites[index].quote, $rootScope.$storage.favourites[index].category + " for you.", "www/img/ionic.png", "https://twitter.com/JoshOkello");
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
                $rootScope.$storage.quotations = $localStorage.quotations;
                $ionicSlideBoxDelegate.slide(index, 500);
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

            $scope.$on('$ionicView.loaded', function(event, args) {
                console.log('onLoad fired');
                if ($rootScope.$storage.quotations.length == 0 || (typeof $rootScope.$storage.quotations === 'undefined')) {
                    $scope.refreshQuotes();
                }
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
        '$state', '$scope', '$rootScope', 'AppService',  // <-- controller dependencies
        function ($state, $scope, $rootScope, AppService) {

            // broadcast a request to refresh quotes
            $scope.categorySelectionChange = function() {
                $rootScope.categoryChanged = true;
                $rootScope.$broadcast('refreshQuotes');
                console.log("sent broadcast refreshQuotes");
                
            };

        }]);
