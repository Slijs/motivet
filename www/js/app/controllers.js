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
        'UserService',
        '$localStorage',
        '$ionicSlideBoxDelegate',
        '$timeout',
        '$window',
        '$cordovaSocialSharing',
        '$ionicLoading',
        '$ionicPopup',
        '$ionicModal', // <-- controller dependencies
        function ($state, $scope, $rootScope, AppService, UserService, $localStorage, $ionicSlideBoxDelegate, $timeout, $window, $cordovaSocialSharing, $ionicLoading, $ionicPopup, $ionicModal) {

            // Refresh quotesionicView
            $scope.refreshQuotes = function() {
                // make sure that there are categories selected to get quotes from
                if ($localStorage.categoryNames.some(AppService.atLeastOneSelected)) {
                    //$scope.showLoadingIcon(); TODO -- ADD IN A BETTER LOOKING METHOD TO SHOW THAT IT'S LOADING
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
                    }
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
                            // Check if the category has changed, OR if there haven't been any quotes loaded before.
                            // If so, we will repopulate the
                            // entire list, and change the categoryChanged back to false.
                            // Otherwise, we will simply add the new quotes.
                            if ($rootScope.categoryChanged || $localStorage.firstLoad || $localStorage.quotations[0].objectId=='SPECIAL') {
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
                                    $scope.showLoadingSpinner = false;
                                });
                            }
                            $localStorage.quotesLastUpdated = new Date();
                        },
                        error: function() {
                            $scope.hideLoadingIcon();
                            $scope.showLoadingSpinner = false;
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
                    $scope.showLoadingSpinner = false;
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
                $cordovaSocialSharing.share(quote.quote, "Thought you'd like this quote from Motivet", "www/img/iconbackgroundsmall.png", "https://twitter.com/JoshOkello");
            }

            $scope.shareFavourite = function (quote) {
                console.log("share button clicked");
                console.log("quote is " + quote.quote);
                $cordovaSocialSharing.share(quote, "Thought you'd like this quote from Motivet", "www/img/iconbackgroundsmall.png", "https://twitter.com/JoshOkello");
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
                if (string.length > 150) {
                    return 'very-long';
                }
                else if (string.length > 75) {
                    return 'long';
                } else if (string.length < 30) {
                    return 'short';
                } else {
                    return 'medium';
                }
            }
/*
            $scope.isOverflowed = function(element) {
                return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            }

            var scrollBoxDiv = document.getElementsByClassName('.slide-wrap');
            if ($scope.isOverflowed(scrollBoxDiv)) {
                console.log('OVERFLOW!!!');
                var overflowingText = document.querySelectorAll("h1.string-very-long, h1.string-long, h1.string-medium, h1.string-short");
                overflowingText.classList.add("overflowing-text");
            }*/

            // Load the quotes on page load
            //$scope.refreshQuotes();

            // This is called after the delay in refreshQuotes()
            //$ionicSlideBoxDelegate.update();

            // Listen for a request to refresh the quotes
            $scope.$on('refreshQuotes', function(event, args) {
                console.log("received broadcast refreshQuotes");
                $scope.refreshQuotes();
            });

            // UGLY FIX, ionicSlideBoxDelegate doesn't get properly updated on changes to the contents of the slidebox. This forces an update 
            $scope.$on('$ionicView.enter', function(event, args) {
                console.log('$ionicView.enter fired');
                if ($localStorage.quotations.length == 0 || (typeof $localStorage.quotations === 'undefined') || $localStorage.quotations[0].objectId == 'SPECIAL') {
                    $scope.refreshQuotes();
                }
                $timeout(function() {
                    $ionicSlideBoxDelegate.update();
                    console.log('ionicSlideBoxDelegate updated');
                }, 1000);

                //console.log("PARSE INSTALLATION ID: " + Parse._getInstallationId());
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
/*
            $ionicModal.fromTemplateUrl('templates/first-start-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });*/

            $ionicModal.fromTemplateUrl('templates/first-start-modal.html', {scope: $scope, animation: 'slide-in-up'})
                .then(function(modal) {
                    $scope.introModal = modal;
            });

            $scope.showIntroModal = function() {
                $scope.introModal.show();
            };

            $scope.hideIntroModal = function() {
                $scope.introModal.hide();
                $localStorage.firstLoad = false;
            };
/*
            $ionicModal.fromTemplateUrl('templates/logo-modal.html', {scope: $scope, animation: 'slide-in-up'})
                .then(function(modal) {
                    $scope.logoModal = modal;
            });

            $scope.showLogoModal = function() {
                $scope.logoModal.show();
            };

            $scope.hideLogoModal = function() {
                $scope.logoModal.hide();
            };*/

            if ($localStorage.firstLoad) {
                /*$scope.showLogoModal();
                $timeout(function() {
                    $scope.hideLogoModal();
                }, 1500);*/
                $timeout(function() {
                    $scope.showIntroModal();
                }, 300);

                /*// subscribe to the proper channels when first loading app ADD CHANNELS BACK IN LATER
                AppService.createLocalstorageCategoryNameArray().then(function(){
                    UserService.registerPushCategories($localStorage.selectedCategories);
                });*/
            };



        }])
    .controller('AccountCtrl', [
        '$state', '$scope', '$rootScope', 'AppService', 'UserService', '$localStorage', '$timeout', '$ionicPopup', '$ionicLoading', // <-- controller dependencies
        function ($state, $scope, $rootScope, AppService, UserService, $localStorage, $timeout, $ionicPopup, $ionicLoading) {
            $scope.noCategoriesSelected = false;

            $scope.categoryClick = function() {
                $scope.categoryClicked = true;
            }

            // show or hide loading spinner
            $scope.showLoadingSpinner = false;

            // broadcast a request to refresh quotes
            $scope.categorySelectionChange = function() {
                // show loading spinner
                $scope.showLoadingSpinner = true;

                // make sure at least one category is checked
                if ($localStorage.categoryNames.some(AppService.atLeastOneSelected)) {
                    $rootScope.categoryChanged = true;
                    $rootScope.$broadcast('refreshQuotes');
                    $scope.categoryClicked = false;
                    //$localStorage.selectedCategories = []; 
                    console.log("sent broadcast refreshQuotes");
                    /*
                    for (i = 0; i < $localStorage.categoryNames.length; i++) {
                        if ($localStorage.categoryNames[i].checked) {
                            $localStorage.selectedCategories.push($localStorage.categoryNames[i].text);
                        }
                    }*/
                    /*AppService.createLocalstorageCategoryNameArray().then(function(){ // ADD BACK IN LATER
                        UserService.registerPushCategories($localStorage.selectedCategories);
                    });*/
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

            $scope.$on('scroll.refreshComplete', function(event, args) {
                $scope.showLoadingSpinner = false;
            });

            $scope.$on('$ionicView.leave', function(event, args) {
                if ($localStorage.categoryNames.every(AppService.atLeastOneSelected)) {
                    $localStorage.categoryNames[0].checked = true;
                }
                console.log('no categories selected when leaving settings, automatically selected category 1.');
            });

/*
            $localStorage.notificationTime = "0700";

            // timepicker
            $scope.timePickerObject = {
                inputEpochTime: (parseInt($localStorage.notificationTime) * 60),
                step: 15,  //Optional
                format: 24,  //Optional
                titleLabel: 'Notification Time',  //Optional
                setLabel: 'Set',  //Optional
                closeLabel: 'Close',  //Optional
                setButtonType: 'button-positive',  //Optional
                closeButtonType: 'button-stable',  //Optional
                callback: function (val) {    //Mandatory
                    $scope.timePickerCallback(val);
                }
            };

            $scope.timePickerCallback = function(val) {
                if (typeof (val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    var selectedTime = new Date(val * 1000);
                    console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
                }
            }

            $scope.timePickerString = $localStorage.notificationTime.toString().replace(/\d{2}/, "$&:");
            //new Date(null, null, null, null, null, $scope.timePickerObject.inputEpochTime).toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0];
            */

        }]);
