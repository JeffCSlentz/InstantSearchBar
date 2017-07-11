$(document).ready(function() {

  var jsonData;
  var jSonStop;

  $.getJSON('https://api.myjson.com/bins/64n67', function(data) {
    jsonData = data;  //data is the JSON string
  });

  $.getJSON('https://api.myjson.com/bins/qddqn', function(nData) {
    jSonStop = nData; //nData is the JSON string of stopwords
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
    var indent = "&nbsp".repeat(6);

    $.each(searchResultsArray, function(i, result) {
      var limitedSummary = result["Summary"].slice(0,50);
      resultsHTML += '<li ><a href="'+ result["URL"] +'">' + result["Title"] +'<br>' + indent + limitedSummary + '...</br>' +'</a></li>';
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

  //TODO: Finish
  function grabSimilarWords(searchArray) {
    var url = "https://api.datamuse.com/words?ml="
    var relatedWords = [];
    var relatedWordsJSON;

    $.each(searchArray, function(i, searchTerm){
      console.log(url + searchTerm)

      $.getJSON(url + searchTerm, function(data){
        relatedWordsJSON = data;
        console.log(relatedWordsJSON);
      });
      setTimeout(function(){
        console.log(relatedWordsJSON);
      }, 100);
    });

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


            //console.log(searchResults[titleKey]);
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
    //TODO: Improve the scoring; the first match should be worth more than the next matches for each word.
    searchResults = {};

    grabSimilarWords(searchArray);

    var FIRSTCHARACTERMATCHMULTIPLIER = 10;
    var FIRSTTITLEMATCH = 10000;
    var NEXTTITLEMATCHES = 1000;
    var FIRSTSUMMARYMATCH = 1000;
    var NEXTSUMMARYMATCHES = 100;

    $.each(jsonData, function(i, jsonEntry) {
      titleKey = jsonEntry["Title"];
      //The entire database
      $.each(searchArray, function(j, term) { //A regular array of search terms             ["fly", "fishing"]

        var scorePayloadTitle = {searchTerm:term,
                                 searchResults:searchResults,
                                 jsonEntry:jsonEntry,
                                 jsonEntryKey:"Title",
                                 titleKey:titleKey,
                                 firstMatch:FIRSTTITLEMATCH,
                                 nextMatches:NEXTTITLEMATCHES,
                                 firstCharacterMatchMultiplier:FIRSTCHARACTERMATCHMULTIPLIER};

         var scorePayloadSummary = {searchTerm:term,
                                    searchResults:searchResults,
                                    jsonEntry:jsonEntry,
                                    jsonEntryKey:"Summary",
                                    titleKey:titleKey,
                                    firstMatch:FIRSTSUMMARYMATCH,
                                    nextMatches:NEXTSUMMARYMATCHES,
                                    firstCharacterMatchMultiplier:FIRSTCHARACTERMATCHMULTIPLIER};


        scoreATerm(scorePayloadTitle);
        scoreATerm(scorePayloadSummary);

        /*
        if (jsonEntry["Title"].toUpperCase().includes(term)) {
          var firstCharacterBoolean = false;
          if (jsonEntry["Title"].toUpperCase().includes(" " + term)) {
            firstCharacterBoolean = true;
          }

          if (typeof searchResults[titleKey] == "undefined") { //True = entry doesn't exist
            searchResults[titleKey] = jsonEntry;
            searchResults[titleKey]["score"] = 0;
          }

          var instances = countInstances(jsonEntry["Title"].toUpperCase(), term);

          if(firstCharacterBoolean){
            searchResults[titleKey]["score"] += FIRSTTITLEMATCH * FIRSTCHARACTERMATCHMULTIPLIER;
            searchResults[titleKey]["score"] += NEXTTITLEMATCHES * instances - 1 * FIRSTCHARACTERMATCHMULTIPLIER; //lol, like this will ever happen
          } else {
            searchResults[titleKey]["score"] += FIRSTTITLEMATCH;
            searchResults[titleKey]["score"] += NEXTTITLEMATCHES * instances - 1; //lol, like this will ever happen
          }

        }

        if (jsonEntry["Summary"].toUpperCase().includes(term)) {
          if (typeof searchResults[titleKey] == "undefined") { //True = entry doesn't exist
            searchResults[titleKey] = jsonEntry;
            searchResults[titleKey]["score"] = 0;
          }

          var instances = countInstances(jsonEntry["Summary"].toUpperCase(), term);

          searchResults[titleKey]["score"] += FIRSTSUMMARYMATCH;
          searchResults[titleKey]["score"] += NEXTSUMMARYMATCHES * instances - 1;
        }
        */
      });
    });
    //console.log(searchResults);
    return searchResults;
  }


  function scoreATerm(payload){
    if (payload["jsonEntry"][payload["jsonEntryKey"]].toUpperCase().includes(payload["searchTerm"])) {
      var firstCharacterBoolean = false;
      if (payload["jsonEntry"][payload["jsonEntryKey"]].toUpperCase().includes(" " + payload["searchTerm"])) {
        firstCharacterBoolean = true;
      }

      if (typeof searchResults[payload["titleKey"]] == "undefined") { //True = entry doesn't exist
        payload["searchResults"][payload["titleKey"]] = payload["jsonEntry"];
        payload["searchResults"][payload["titleKey"]]["score"] = 0;
      }

      var instances = countInstances(payload["jsonEntry"][payload["jsonEntryKey"]].toUpperCase(), payload["searchTerm"]);

      if(firstCharacterBoolean){
        payload["searchResults"][payload["titleKey"]]["score"] += payload["firstMatch"] * payload["firstCharacterMatchMultiplier"];
        payload["searchResults"][payload["titleKey"]]["score"] += payload["nextMatches"] * (instances - 1) * payload["firstCharacterMatchMultiplier"]; //lol, like this will ever happen
      } else {
        payload["searchResults"][payload["titleKey"]]["score"] += payload["firstMatch"];
        payload["searchResults"][payload["titleKey"]]["score"] += payload["nextMatches"] * (instances - 1); //lol, like this will ever happen
      }
    }
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
