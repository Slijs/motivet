angular.module('app.services', [])
	
    .service('AppService', ['$q', '$rootScope', '$localStorage', '$timeout',
        function ($q, $rootScope, $localStorage, $timeout) {


			// check to see if an element of a specified property is present in an array, and return its index
			var arrayObjectIndexOf = function(myArray, searchTerm, property) {
			    for (i = 0; i < myArray.length; i++) {
			        if (myArray[i][property] === searchTerm) return i;
			    }
			    return -1;
			}

        	return {

        		// This function gets a list of all of the category names listed at Parse.com. It then creates an array
        		// of objects, in the form of [{text: "CATEGORYNAME", checked: BOOL},...]
				/*setCategoryNames: function() {
					console.log("checking for new quote categories");
					return $q(function(resolve, reject){
						$timeout(function(){
							var categoryNamesSelector = Parse.Object.extend("QuoteCategories");
							var categoryQuery = new Parse.Query(categoryNamesSelector);
							categoryQuery.find({
								success: function(_response) {
									var categories = new Array();
									for (i = 0; i < _response.length; i++) {
										//categories.push((_response[i].get('category')));
										console.log("added _response: " + _response[i].get('category'));
									};
									console.log('received quote category names from parse: ' + JSON.stringify(_response));
									return categories;
								},
								error: function(e) {
									reject(console.log("setCategoryNames query to Parse.com failed. Reason: " + e));
								}
							}).then(function(categories){
								//"use strict"; FIND A DIFFERENT WAY TO DO THIS WHEN I ADD THIS FEATURE BACK IN -- DOESN'T WORK ON BLACKBERRIES
								console.log("categories received are: " + JSON.stringify(categories));
								var categorySelections = new Array();
								// check if the number of items is different from what is already here
								if (categories.length != $localStorage.categoryNames.length) {
									// add any new categories that aren't already existent
									for (let i = 0; i < categories.length; i++) {
										if (arrayObjectIndexOf($localStorage.categoryNames, categories[i].get('category'), 'text') < 0) {
											categorySelections.push({text: categories[i].get('category'), checked: true})
											console.log("Added category: " + JSON.stringify(categories[i].get('category')));
										}
									}
								} else {
									console.log("No new categories received.");
								}
								console.log("categorySelections are: " + categorySelections);
								return categorySelections;
							}).then(function(categorySelections){
								console.log("categorySelections are: " + JSON.stringify(categorySelections));
								if (categorySelections != null) {
									$localStorage.categoryNames = $localStorage.categoryNames.concat(categorySelections);
								}
								resolve(categorySelections);
							});
							
							
						}, 10000);
					});

				},*/

				renewQuotes: function(receivedQuotes) {
					return $q(function(resolve, reject){
						setTimeout(function(){
		                    if (receivedQuotes.length == 0) {
		                        reject(console.log('renewQuotes: REJECTED. Reason: empty array.'));
		                    } else {
		                        if (receivedQuotes.length > 30) {
		                            receivedQuotes.length = 30;
		                        }
		                        resolve(receivedQuotes);
		                    }
						}, 5000);
					});

				},

				addQuotes: function(receivedQuotes) {
					return $q(function(resolve, reject){
						setTimeout(function(){
		                    var storedQuotes = $localStorage.quotations;
		                    console.log(receivedQuotes);
		                    if (receivedQuotes.length == 0) {
		                        console.log('REJECTED');
		                        reject(receivedQuotes);
		                    } else {
			                    receivedQuotes = receivedQuotes.concat(storedQuotes);
			                    if (receivedQuotes.length > 30) {
			                        receivedQuotes.length = 30;
			                    }
		                        resolve(receivedQuotes);
		                    }
						}, 5000);
					});

				},


	            // test to see if not all categories are false
	            atLeastOneSelected: function(element) {
	                return element.checked;
	            },

				createLocalstorageCategoryNameArray: function() {
					return $q(function(resolve, reject){
	                    $localStorage.selectedCategories = []; 
	                    for (i = 0; i < $localStorage.categoryNames.length; i++) {
	                        if ($localStorage.categoryNames[i].checked) {
	                            $localStorage.selectedCategories.push($localStorage.categoryNames[i].text);
	                        }
	                    }
	                    resolve(console.log("created localstorage array of category names"));
					});

				},
        	}
    	}
    ])
;
