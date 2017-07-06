$(document).ready(function() {

  var jsonData;
  var jSonStop;

  $.getJSON('https://api.myjson.com/bins/64n67', function(data) {
    //data is the JSON string
    jsonData = data;

    console.log(jsonData[1]);

    var obj = {
      "Name": "Raj",
      "Something": "lol"
    };

    console.log(obj);
  });

  $.getJSON('https://api.myjson.com/bins/qddqn', function(nData) {
    //nData is the JSON string of stopwords
    jSonStop = nData;

  });


  //assign the function filterResults to the searchBar
  $("#searchBar").keyup(filterResults);
  //$("#searchButton").click(filterResults);

  function filterResults() {
    var searchString = $("#searchBar").val().toUpperCase();
    if (searchString == "") {
      //I think bootstrap does this automatically with classes? I'm not sure how, so I've done it this way.
      $("#resultsDropdown").hide();
    } else {
      //Clear the dropdown.
      $("#resultsDropdown").empty();


      //searchArray = ["fly", "fishing"]                                    //Regular Array
      //searchPermutations = [ ["fly", "fishing"], ["fly"], ["fishing"] ]   //2D Array
      var searchArray = splitAndRemoveExtraWords(searchString);
      var searchPermutations = makePermutations(searchArray);

      //Search and score the results.
      var searchResults = searchWithoutOrder(searchArray);

      //Convert it to a sortable array, then sort by score.
      searchResultsArray = convertToArray(searchResults);
      searchResultsArray.sort(function(a, b) {
        return b["score"] - a["score"];
      });

      //Build the HTML, and add it to the dropdown.
      resultsHTML = convertToHTML(searchResultsArray);
      $("#resultsDropdown").append(resultsHTML);
      $("#resultsDropdown").show();
    }
  }

  function convertToHTML(searchResultsArray) {
    var resultsHTML = "";
    $.each(searchResultsArray, function(i, result) {
      resultsHTML += '<li ><a href="'+ result["URL"] +'">' + result["Title"] + '</a></li>';
    });

    return resultsHTML;
  }

  function splitAndRemoveExtraWords(searchString) {
    var searchArray = searchString.split(" ");

    //i feel like there is a much more efficient way to accomplish this.
    for (var i = 0; i < searchArray.length; i++) {
      if (jSonStop.includes(searchArray[i])) {
        searchArray.splice(i, 1);
      }
    }

    return searchArray;
  }

  //TODO: Implement
  function makePermutations(searchArray) {

    //This just turns it into a 2d array with one entry.
    var searchPermutations = [searchArray];
    return searchPermutations;
  }

  function searchWithOrder(searchPermutations) {
    //TODO Order is getting really complicated =/
    //     so I gave up on it for now, RIP

    searchResults = {};

    $.each(jsonData, function(i, jsonEntry) { //The entire database
      $.each(searchPermutations, function(j, searchArray) { //The 2d array of search permutations. [ ["fly", "fishing"], ["fly"], ["fishing"] ]
        $.each(searchArray, function(j, searchTerm) { //One permutation.                     ["fly", "fishing"]
          var matchFound = false;
          var score = 0;

          if (jsonEntry["Title"].includes(searchTerm)) {
            matchFound = true;
            score += 1000;

            titleKey = jsonEntry["Title"];

            searchResults[titleKey] = jsonEntry;
            searchResults[titleKey]["score"] = score;


            console.log(searchResults[titleKey]);
            //TODO: calculate a score for matching the title
          }

          if (jsonEntry["Summary"].includes(searchTerm)) {
            matchfound = true;
            score += 100;
            //TODO: calculate a score for matching the description.
          }
        });
      });
    });
  }

  function searchWithoutOrder(searchArray) {
    searchResults = {};

    var TITLEMATCH = 1000;
    var SUMMARYMATCH = 100;

    $.each(jsonData, function(i, jsonEntry) {
      titleKey = jsonEntry["Title"];
      var score = 0;
      //The entire database
      $.each(searchArray, function(j, term) { //A regular array of search terms             ["fly", "fishing"]


        if (jsonEntry["Title"].toUpperCase().includes(term)) {

          if (typeof searchResults[titleKey] == "undefined") { //True = entry doesn't exist
            searchResults[titleKey] = jsonEntry;
            searchResults[titleKey]["score"] = 0;
          }

          var instances = countInstances(jsonEntry["Title"].toUpperCase(), term);

          searchResults[titleKey]["score"] += TITLEMATCH * instances;

        }

        if (jsonEntry["Summary"].toUpperCase().includes(term)) {
          score += 100;


          if (typeof searchResults[titleKey] == "undefined") { //True = entry doesn't exist
            searchResults[titleKey] = jsonEntry;
            searchResults[titleKey]["score"] = 0;
          }

          var instances = countInstances(jsonEntry["Summary"].toUpperCase(), term);

          searchResults[titleKey]["score"] += SUMMARYMATCH * instances;

        }
      });
    });
    console.log(searchResults);
    return searchResults;
  }

  function countInstances(string, word) {
    var substrings = string.split(word);
    return substrings.length - 1;
  }

  function convertToArray(map) {
    var array = [];

    $.each(map, function(i, item) {
      array.push(item);
    });

    return array;
  }

});
