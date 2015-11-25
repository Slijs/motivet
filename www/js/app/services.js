angular.module('app.services', [])
	
    .service('AppService', ['$q', '$rootScope', '$localStorage',
        function ($q, $rootScope, $localStorage) {

        	return {

				setCategoryNames: function() {
					return $q(function(resolve, reject){
						setTimeout(function(){
							var CategoryNames = Parse.Object.extend("QuoteCategories");
							var categoryQuery = new Parse.Query(CategoryNames);
							var categories = new Array();
							categoryQuery.find({
								success: function(_response) {
									for (var i = 0; i < _response.length; i++) {
										categories.push(_response[i].get("category"));
									};	
								},
								error: function() {
									reject(console.log("REJECTED"));
								}
							}).then(function(categories){
								var categorySelections = new Array();
								Parse.User.current().fetch().then(function (user) {
									for (var i = 0; i < categories.length; i++) {
										var selected = [
											{text: categories[i], checked: user.get(categories[i])}
										];
										categorySelections.push(selected);
									};
									this.categoryNames = categorySelections;
									resolve(console.log("Resolved!"));
								});
							});
							
							
						}, 5000);
					});

				},

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
	            }
        	}
    	}
    ])
;
