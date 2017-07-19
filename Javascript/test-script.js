$(document).ready(function() {

  var jsonData;
  var jSonStop;
  //var suggestionsJson;

  $.getJSON('https://api.myjson.com/bins/j68kn', function(data) {
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
      $("#resultsDropdown").hide();
    } else {
      $("#resultsDropdown").empty();


      //searchArray = ["fly", "fishing"]                                    //Regular Array
      //searchPermutations = [ ["fly", "fishing"], ["fly"], ["fishing"] ]   //2D Array
      var searchArray = splitAndRemoveExtraWords(searchString);
      var searchPermutations = makePermutations(searchArray);

      var suggestionsJSON = grabSuggestedWords(searchArray); //[{score:INT, word:STRING}, {score:INT, word:STRING}]
      console.log("vv The List of Autosuggested Words vv");
      console.log(suggestionsJSON);

      var similarWordsJSON = grabSimilarWords(suggestionsJSON);

      console.log("vv The List of words similar in meaning to the autosuggested words vv");
      console.log(similarWordsJSON);

      //Search and score the results.
      //var searchResults = searchWithoutOrder(searchArray);
      var searchResults = bigSearchWithoutOrder(similarWordsJSON)

      console.log("vv The actual search results vv");
      console.log(searchResults);
      //Convert it to a sortable array, then sort by score.
      searchResultsArray = convertToArray(searchResults);
      searchResultsArray.sort(function(a, b) {
        return b["score"] - a["score"];
      });

      //Build the HTML, and add it to the dropdown.
      resultsHTML = convertToHTML(searchResultsArray, searchString);
      $("#resultsDropdown").append(resultsHTML);
      $("#resultsDropdown").show();
    }
  }

  //Takes in an array of Strings.
  //Will take three auto suggestions for the last "word" in the searchArray.
  //Gives earlier words a score of 100,000 for funsies.
  function grabSuggestedWords(searchArray){
    var suggestionsJSON = [];
    $.each(searchArray, function(i, searchTerm) {
      var tempJSON = {};
      var data;
      $.ajax({
        dataType: "json",
        url: 'https://api.datamuse.com/sug?s=' + searchTerm,
        data: data,
        async: false,
        success: function(data) {
          tempJSON = data;
        }
      });

      if (typeof suggestionsJSON != "undefined" && typeof tempJSON != "undefined") {
        var tempArray = convertToArray(tempJSON);
        tempArray = tempArray.slice(0,4);

        $.each(tempArray, function(i, result){
          if (result["word"].toUpperCase() == searchTerm.toUpperCase()){
            suggestionsJSON.push(result);
            return false;
          } else {
            suggestionsJSON.push(result);
          }

        });
      }
    });
    return suggestionsJSON;
  }

  //TODO: Finish
  function grabSimilarWords(suggestionsArray) {
    var similarWords = [];

    $.each(suggestionsArray, function(i, suggestion){ //suggestion = {score:10000, word:"something"}

      //First, push the suggestion back on, with a bonus added.
      var word = suggestion["word"];
      var score = suggestion["score"] + 100000;
      similarWords.push({score, word});

      var tempJSON = {};
      var data;
      /*
      $.ajax({
        dataType: "json",
        url: 'https://api.datamuse.com/words?rel_trg=' + suggestion["word"],
        data: data,
        async: false,
        success: function(data) {
          tempJSON = data;
        }
      });
      */

      $.ajax({
        dataType: "json",
        url: 'https://api.datamuse.com/words?ml=' + suggestion["word"],
        data: data,
        async: false,
        success: function(data) {
          tempJSON = data;
        }
      });


      if (typeof suggestionsArray != "undefined" && typeof tempJSON != "undefined") {
        var tempArray = convertToArray(tempJSON);
        tempArray = tempArray.slice(0,6);
        $.each(tempArray, function(i, result){
          similarWords.push(result);
        });
      }

    });
    return similarWords;
  }

  function convertToHTML(searchResultsArray, searchString) {
    var resultsHTML = "";
    var indent = "&nbsp".repeat(6);

    $.each(searchResultsArray, function(i, result) {
      var limitedSummary = result["Summary"].slice(0,50);
      resultsHTML += '<li ><a href="'+ result["URL"] +'">' + result["Title"] +'<br>' + indent + limitedSummary + '...</br>' +'</a></li>';
    });

    return resultsHTML;
  }

  //TODO: Implement
  function boldMatching(resultString, searchString){
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
    //TODO: cry
    searchResults = {};

    //grabSimilarWords(searchArray);

    var FIRSTCHARACTERMATCHBONUS = 10000;
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
                                 firstCharacterMatchBonus:FIRSTCHARACTERMATCHBONUS};

         var scorePayloadSummary = {searchTerm:term,
                                    searchResults:searchResults,
                                    jsonEntry:jsonEntry,
                                    jsonEntryKey:"Summary",
                                    titleKey:titleKey,
                                    firstMatch:FIRSTSUMMARYMATCH,
                                    nextMatches:NEXTSUMMARYMATCHES,
                                    firstCharacterMatchBonus:FIRSTCHARACTERMATCHBONUS};


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
    return searchResults;
  }

  function bigSearchWithoutOrder(searchJSON) {
    //TODO: cry
    searchResults = {};

    //grabSimilarWords(searchArray);

    var FIRSTCHARACTERMATCHBONUS = 10000;
    var FIRSTTITLEMATCH = 10000;
    var NEXTTITLEMATCHES = 1000;
    var FIRSTSUMMARYMATCH = 1000;
    var NEXTSUMMARYMATCHES = 100;

    $.each(jsonData, function(i, jsonEntry) {
      titleKey = jsonEntry["Title"];
      //The entire database
      $.each(searchJSON, function(j, term) { //searchJSON = [{score:100, word:"lol"}, {score:150, word:"loller"}, ...]

        var scorePayloadTitle = {searchTerm:term["word"],
                                 searchResults:searchResults,
                                 jsonEntry:jsonEntry,
                                 jsonEntryKey:"Title",
                                 titleKey:titleKey,
                                 firstMatch:FIRSTTITLEMATCH,
                                 nextMatches:NEXTTITLEMATCHES,
                                 firstCharacterMatchBonus:FIRSTCHARACTERMATCHBONUS,
                                 score:term["score"]};

         var scorePayloadSummary = {searchTerm:term["word"],
                                    searchResults:searchResults,
                                    jsonEntry:jsonEntry,
                                    jsonEntryKey:"Summary",
                                    titleKey:titleKey,
                                    firstMatch:FIRSTSUMMARYMATCH,
                                    nextMatches:NEXTSUMMARYMATCHES,
                                    firstCharacterMatchBonus:FIRSTCHARACTERMATCHBONUS,
                                    score:term["score"]};


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
    return searchResults;
  }

  function scoreATerm(payload){
    if (payload["jsonEntry"][payload["jsonEntryKey"]].toUpperCase().includes(payload["searchTerm"].toUpperCase())) {
      var firstCharacterBoolean = false;
      if (payload["jsonEntry"][payload["jsonEntryKey"]].toUpperCase().includes(" " + payload["searchTerm"].toUpperCase()) || payload["jsonEntry"][payload["jsonEntryKey"]].toUpperCase().charAt(0) == payload["searchTerm"].toUpperCase().charAt(0)) {
        firstCharacterBoolean = true;
      }

      if (typeof searchResults[payload["titleKey"]] == "undefined") { //True = entry doesn't exist
        payload["searchResults"][payload["titleKey"]] = payload["jsonEntry"];
        payload["searchResults"][payload["titleKey"]]["score"] = 0;
      }

      var instances = countInstances(payload["jsonEntry"][payload["jsonEntryKey"]].toUpperCase(), payload["searchTerm"].toUpperCase());

      if(firstCharacterBoolean){
        payload["searchResults"][payload["titleKey"]]["score"] += payload["firstMatch"] + payload["firstCharacterMatchBonus"] + payload["score"];
        payload["searchResults"][payload["titleKey"]]["score"] += payload["nextMatches"] + (instances - 1) * payload["firstCharacterMatchBonus"] + payload["score"]; //lol, like this will ever happen
      } else {
        payload["searchResults"][payload["titleKey"]]["score"] += payload["firstMatch"] + payload["score"];
        payload["searchResults"][payload["titleKey"]]["score"] += payload["nextMatches"] * (instances - 1) + payload["score"]; //lol, like this will ever happen
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
