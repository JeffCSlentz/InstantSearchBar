$(document).ready(function(){

  var jsonData;
 var jSonStop;
 
  $.getJSON('https://api.myjson.com/bins/64n67', function(data) {
    //data is the JSON string
    jsonData = data;
  });

  $.getJSON('https://api.myjson.com/bins/qddqn', function(nData){
      //nData is the JSON string of stopwords
      jSonStop = nData; 
  });
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
          matches++;
          //This is naive, we'll need to capture related suggestions and sort them by relatibilty later on.
          $("#resultsDropdown").append('<li ><a href="#">' + value["company"] + '</a></li>');
        }

        if (matches > 5){
          return false;
        }
      });
      $("#resultsDropdown").show();
    }
  }
});
