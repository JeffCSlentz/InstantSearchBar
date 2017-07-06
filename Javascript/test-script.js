$(document).ready(function(){

<<<<<<< HEAD
var jsonData;
var jSonStop;

=======
  var jsonData;
 var jSonStop;
 
>>>>>>> 9a29dded864c8d6bcb25ac90125e8044bd4661c1
  $.getJSON('https://api.myjson.com/bins/64n67', function(data) {
    //data is the JSON string
    jsonData = data;
    console.log(jsonData[1]);

    var obj = {"Name": "Raj", "Something": "lol"};

    console.log(obj);
  });

  $.getJSON('https://api.myjson.com/bins/qddqn', function(nData){
      //nData is the JSON string of stopwords
<<<<<<< HEAD
      jSonStop = nData;

  });


=======
      jSonStop = nData; 
  });
>>>>>>> 9a29dded864c8d6bcb25ac90125e8044bd4661c1
  //assign the function filterResults to the searchBar
  $("#searchBar").keyup(filterResults);

  function filterResults(){
    var searchString = $("#searchBar").val().toUpperCase();
    if (searchString == ""){
      //I think bootstrap does this automatically with classes? I'm not sure how, so I've done it this way.
      $("#resultsDropdown").hide();
    }
    else{
      //Clear the dropdown.
      $("#resultsDropdown").empty();
<<<<<<< HEAD


      //searchArray = ["fly", "fishing"]                                    //Regular Array
      //searchPermutations = [ ["fly", "fishing"], ["fly"], ["fishing"] ]   //2D Array
      var searchArray = splitAndRemoveExtraWords(searchString);
      var searchPermutations = makePermutations(searchArray);

      var searchResults = search(searchPermutations);

      var matches = 0;

      //Iterate through the jsonData.
      $.each(jsonData, function( index, value ) {
        //this part is rough to maintain if the data-structure changes.
        var title = value["Title"].toUpperCase();
        if (title.includes(searchString)){
=======
     
     //create array of words in search query
      var searchArray = searchString.split(" ");
      
      //i feel like there is a much more efficient way to accomplish this.
      for(var i = 0; i < searchArray.length; i++){
          if(jSonStop.includes(searchArray [i]){
              searchArray.splice(i, 1);
          }
      }
     
      var matches = 0;
      //Iterate through the jsonData. 
      $.each(jsonData, function( index, value ) {
        //this part is rough to maintain if the data-structure changes.
        var companyName = value["company"].toUpperCase();
        if (value["company"].includes(searchString)){
>>>>>>> 9a29dded864c8d6bcb25ac90125e8044bd4661c1
          matches++;
          //This is naive, we'll need to capture related suggestions and sort them by relatibilty later on.
          $("#resultsDropdown").append('<li ><a href="#">' + value["Title"] + '</a></li>');
        }

        if (matches > 5){
          return false;
        }
      });
      $("#resultsDropdown").show();
    }
  }

  function splitAndRemoveExtraWords(searchString){
      var searchArray = searchString.split(" ");

      //i feel like there is a much more efficient way to accomplish this.
      for(var i = 0; i < searchArray.length; i++){
          if(jSonStop.includes(searchArray [i])){
              searchArray.splice(i, 1);
          }
      }

      return searchArray;
  }

  function makePermutations(searchArray){
      //TODO: Implement


      //This just turns it into a 2d array with one entry.
      var searchPermutations = [searchArray];
      return searchPermutations;
  }

    function search(searchPermutations){

        var score;


        $.each(jsonData, function(i, jsonEntry) {
            $.each(searchPermutations, function( j, searchArray ) {
                $.each(searchArray, function( j, searchTerm ) {
                    var matchFound = false;

                    if(jsonEntry["Title"].includes(searchTerm)){
                        matchFound = true;
                        //TODO: calculate a score for matching the title
                    }

                    if(jsonEntry["Summary"].includes(searchTerm)){
                        matchfound
                        //TODO: calculate a score for matching the description.
                    }
                });
            });
        });
    }
});
