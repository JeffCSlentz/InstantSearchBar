$(document).ready(function() {
  var jsonData;
  var jSonStop;

  //Get the hobbies data.
  $.getJSON('https://api.myjson.com/bins/1fz0fz', function(data) {
    jsonData = data;
  });

  //Get the stopwords data.
  $.getJSON('https://api.myjson.com/bins/qddqn', function(nData) {
    jSonStop = nData;
  });


  //Assign filterResults to the searchBar
  $("#searchBar").keyup(filterResults);
  //$("#searchButton").click(filterResults);

  /**
 * @summary Short description. (use period)
 *
 * Long. (use period)
 *
 * @since x.x.x
 * @deprecated x.x.x Use new_function_name() instead.
 * @access private
 *
 * @class
 * @augments superclass
 * @mixes mixin
 *
 * @see Function/class relied on
 * @link URL
 * @global type $varname Short description.
 * @fires target:event
 * @listens target:event
 *
 * @param type $var Description.
 * @param type $var Optional. Description.
 * @returns type Description.
 */


  /**
  * @summary Calls all functions necessary to search the data and update results.
  *
  * @see splitAndRemoveExtraWords
  * @see grabSuggestedWords
  * @see grabSimilarWords
  * A List of search words is generated that will be used to search the database.
  * Search words have four types:
  *   Complete: User-typed word is recognized as a dictionary word.   200,000 points.
  *   Similar: Generated from Complete words                          100,000-50,000 points, depending on datamuse api.
  *   Incomplete: User-typed word is recognized to be unfinished.     20,000 points.
  *   Suggested: Generated from Incomplete words.                     10,000 points.
  *
  *
  * @see bigSearchWithoutOrder
  * The data is then searched with all search words.
  * A scaled score for each entry is added to for each word found.
  *   Mulitipliers:
  *   10:  If the first character matches.                            -> STARTSWITHBONUS = 10;
  *   2:   For the first match in a title.                            -> FIRSTTITLEMATCH = 2;
  *   1.1: For the next matches in a title.                           -> NEXTTITLEMATCHES = 1.1;
  *   0.5: For the first match in a summary.                          -> FIRSTSUMMARYMATCH = 0.5;
  *   0.1: for the next matches in a summary.                         -> NEXTSUMMARYMATCHES = 0.1;
  *

  * @see updateSuggestionsHelpBox
  * The user gets feedback on the search words being used.
  *
  * @see convertToHTML
  * List items are added to the search bar dropdown.
  *
  * @see convertToArray
  * @see consoleLog
  * Utility functions.
  */
  function filterResults() {
    console.clear();

    var searchString = $("#searchBar").val().toUpperCase();
    var searchString = searchString.replace(/\?/g,'');
    var searchArray = splitAndRemoveExtraWords(searchString); //Split on spaces and filter out stopwords.

    if (searchArray.length == 0) {  //If all the user words got filtered out.
      $("#resultsDropdown").hide();
      $("#suggestions").empty();
    } else {
      $("#resultsDropdown").empty();

      //If the user's last-typed word is incomplete, finds a suggestion.
      var suggestedWords = grabSuggestedWords(searchArray); //{score:INT, word:STRING}
      consoleLog("SearchArray + Autosuggested Word", suggestedWords);

      //If any of the suggestedWords are complete, finds similar words.
      var similarWordsJSON = grabSimilarWords(suggestedWords);
      consoleLog("List of words similar in meaning to the autosuggested words", similarWordsJSON);

      //informs the user what's happening with their search terms.
      updateSuggestionsHelpBox(similarWordsJSON);

      //Searches and scores the results.
      var searchResults = bigSearchWithoutOrder(similarWordsJSON)
      consoleLog("The actual search results", searchResults);

      //Converts searchResults to a sortable array, then sorts by score.
      searchResultsArray = convertToArray(searchResults);
      searchResultsArray.sort(function(a, b) {
        return b["score"] - a["score"];
      });
      consoleLog("The sorted search results", searchResultsArray);
      var searchResultsArray = searchResultsArray.slice(0, 10);

      //Builds the HTML, and adds it to the dropdown.
      resultsHTML = convertToHTML(searchResultsArray, searchString);
      $("#resultsDropdown").append(resultsHTML);
      $("#resultsDropdown").show();
    }
  }

  /**
  * @summary Updates the suggestions help box with the search words styled by their type.
  */
  function updateSuggestionsHelpBox(similarWordsJSON) {
    $("#suggestions").empty();
    var htmlString = "";
    var firstHeader = true;
    $.each(similarWordsJSON, function(i, item) {
      switch (item.status) {
        case "complete":
          if(firstHeader){
            firstHeader = false;
          }
          else{
            htmlString += "</li>";
          }
          htmlString += `
            <li class="list-group-item">
              <h4 class="list-group-item-heading"><b>` + item.word + `</b></h4>
          `
          break;
        case "similar":
          htmlString += `
            <p class="list-group-item-text"><i>≈ ` + item.word + `</i></p>
          `
          break;
        case "incomplete":
          if(firstHeader){
            firstHeader = false;
          }
          else{
            htmlString += "</li>";
          }
          htmlString += `
            <li class="list-group-item">
              <h4 class="list-group-item-heading"><b>` + item.word + `</b></h4>
          `
          break;
        case "suggested":
          htmlString += `
            <p class="list-group-item-text"><i>` + item.word + `</i></p>
          `
          break;
        default:
      }
    });
    htmlString += "</li>";
    $("#suggestions").append(htmlString);
  }

  /**
  * @summary Pretty prints a message with a data structure.
  */
  function consoleLog(text, item) {
    var titleText = "~~~ " + text + " ~~~";
    console.log("");
    console.log(titleText);
    console.log(item);
  }

  /**
  * @summary Might add a suggested autocomplete word.
  *
  * Assumes all but the last word are complete.
  * If the last word is incomplete (according to datamuse.com/sug?s=), add a suggestion.
  */
  function grabSuggestedWords(searchArray) {
    var suggestionsJSON = [];

    var tempJSON;
    var data;
    wordBeingTyped = searchArray[searchArray.length - 1];
    $.ajax({
      dataType: "json",
      url: 'https://api.datamuse.com/sug?s=' + wordBeingTyped + '&max=1',
      data: data,
      async: false,
      success: function(data) {
        tempJSON = data;
      }
    });

    $.each(searchArray, function(i, result) {
      suggestionsJSON.push({
        word: result,
        score: 200000,
        status: "complete"
      });
    });
    var suggestedWord = tempJSON[0].word.toUpperCase();


    if (suggestedWord != wordBeingTyped) {
      //Mark the last word typed as incomplete.
      suggestionsJSON[suggestionsJSON.length - 1].status = "incomplete";
      suggestionsJSON[suggestionsJSON.length - 1].score = 20000;
      tempJSON[0].status = "suggested";
      tempJSON[0].word = tempJSON[0].word.toUpperCase();
      tempJSON[0].score = 10000;
      suggestionsJSON.push(tempJSON[0]);
    }



    return suggestionsJSON;
  }

  /**
  * @summary Will generate similar words from any complete words.
  *
  * Similar words take their score from datamuse directly.
  */
  function grabSimilarWords(suggestionsArray) {
    var similarWords = [];

    $.each(suggestionsArray, function(i, suggestion) { //suggestion = {score:10000, word:"something"}
      similarWords.push(suggestion);

      if (suggestion.status != "incomplete" && suggestion.status != "suggested") {
        var tempJSON = {};
        var data;

        $.ajax({
          dataType: "json",
          url: 'https://api.datamuse.com/words?ml=' + suggestion["word"] + '&max=4',
          data: data,
          async: false,
          success: function(data) {
            tempJSON = data;
          }
        });


        if (typeof suggestionsArray != "undefined" && typeof tempJSON != "undefined") {
          var tempArray = convertToArray(tempJSON);
          $.each(tempArray, function(i, result) {
            result.status = "similar";
            result.similarTo = suggestion;
            similarWords.push(result);
          });
        }
      }
    });
    return similarWords;
  }

  /**
  * @summary Will generate list item data from the searchresults.
  *
  * @see highlightMatchingTitle
  * @see buildLimitedSummary
  */
  function convertToHTML(searchResultsArray, searchString) {
    var resultsHTML = "";
    var indent = "&nbsp".repeat(6);

    $.each(searchResultsArray, function(i, result) {
      matchedWordsArray = result["matchedWords"];
      matchedWordsArray.sort(function(a, b) {
        return b["score"] - a["score"];
      });
      var title = highlightMatchingTitle(result["Title"], matchedWordsArray)
      var limitedSummary = buildLimitedSummary(result);
      //var limitedSummary = result["Summary"].slice(0, 150);
      //var limitedSummary = result["Summary"];
      resultsHTML += '<li class="instant-search-li" ><a class ="instant-search-a" href="' + result["URL"] + '">' +
                      title +
                      '<div class="summary">' + indent + limitedSummary + '...</div>' + '</a></li>';
    });

    return resultsHTML;
  }

  /**
  * @summary Will build a one-line subset of the summary around a search word.
  *
  * The highest scoring word is located and bolded or italicized depending on type.
  */
  function buildLimitedSummary(item){
    var MAXSUMMARYLENGTH = 100;
    //Find the highest scoring matched word.
    matchedWordsArray = item["matchedWords"];
    matchedWordsArray.sort(function(a, b) {
      return b["score"] - a["score"];
    });

    var wordAllCaps = matchedWordsArray[0]["word"]
    var wordIndex = item["Summary"].toUpperCase().indexOf(wordAllCaps.toUpperCase());
    var word = item["Summary"].slice(wordIndex, wordIndex + wordAllCaps.length);
    switch (matchedWordsArray[0].status) {
      case "complete":
        word = word.bold();
        break;
      case "similar":
        word = word.italics();
        break;
      case "incomplete":
        word = word.bold();
        break;
      case "suggested":
        word = word.italics();
        break;
      default:
        word = word.bold();
    }


    if (wordIndex - 25 > 0){
      summaryStartIndex = item["Summary"].lastIndexOf(".", wordIndex) + 1;
      var maybeEllipses = "";
      if (wordIndex - summaryStartIndex > 75){
        maybeEllipses = "... ";
        summaryStartIndex = item["Summary"].indexOf(" ", wordIndex - 50);
      }
      firstHalf = item["Summary"].slice(summaryStartIndex, wordIndex);
      secondHalf = item["Summary"].slice(wordIndex + wordAllCaps.length, wordIndex + 75);

      return maybeEllipses + firstHalf +  word + secondHalf;
    }
    else{
      firstHalf = item["Summary"].slice(0, wordIndex);
      secondHalf = item["Summary"].slice(wordIndex + wordAllCaps.length, wordIndex + 75);

      return firstHalf + word + secondHalf;
    }
  }

  /**
  * @summary Will bold first and highest scoring matching word in title.
  */
  function highlightMatchingTitle(titleString, matchedWords) {
    var title = titleString;
    $.each(matchedWords, function(i, matchedWord){
      var matchingIndex = titleString.toUpperCase().indexOf(matchedWord.word.toUpperCase());
      if (matchingIndex != -1){
        if (matchedWord.status == "complete" || matchedWord.status == "incomplete"){
          title =  titleString.slice(0, matchingIndex) + titleString.slice(matchingIndex, matchingIndex + matchedWord.word.length).bold() + titleString.slice(matchingIndex + matchedWord.word.length);
          return false;
        } else {
          title =  titleString.slice(0, matchingIndex) + titleString.slice(matchingIndex, matchingIndex + matchedWord.word.length).italics() + titleString.slice(matchingIndex + matchedWord.word.length);
        }
      }
    });
    return title;
  }

  /**
  * @summary Splits the searchString into words and removes superfluous words.
  */
  function splitAndRemoveExtraWords(searchString) {
    var searchArray = searchString.split(" ");

    //i feel like there is a much more efficient way to accomplish this.
    for (var i = 0; i < searchArray.length; i++) {
      if (jSonStop.includes(searchArray[i].toLowerCase()) || searchArray[i] == "") {
        searchArray.splice(i--, 1);
      }
    }

    return searchArray;
  }

  /**
  * @summary Searches through the database, adding a score to matching data entries.
  *
  * @see scoreATerm
  */
  function bigSearchWithoutOrder(searchJSON) {
    searchResults = {};

    var STARTSWITHBONUS = 10;
    var FIRSTTITLEMATCH = 2;
    var NEXTTITLEMATCHES = 1.1;
    var FIRSTSUMMARYMATCH = 0.5;
    var NEXTSUMMARYMATCHES = 0.1;

    $.each(jsonData, function(i, jsonEntry) { //The entire database
      titleKey = jsonEntry["Title"];
      $.each(searchJSON, function(j, term) { //searchJSON = [{score:100, word:"lol"}, {score:150, word:"loller"}, ...]

        var termCopy = jQuery.extend(true, {}, term)
        var scorePayloadTitle = {
          searchTerm: termCopy,
          searchResults: searchResults,
          jsonEntry: jsonEntry,
          jsonEntryKey: "Title",
          titleKey: titleKey,
          FIRSTMATCH: FIRSTTITLEMATCH,
          NEXTMATCHES: NEXTTITLEMATCHES,
          STARTSWITHBONUS: STARTSWITHBONUS,
          score: term["score"]
        };

        var scorePayloadSummary = {
          searchTerm: termCopy,
          searchResults: searchResults,
          jsonEntry: jsonEntry,
          jsonEntryKey: "Summary",
          titleKey: titleKey,
          FIRSTMATCH: FIRSTSUMMARYMATCH,
          NEXTMATCHES: NEXTSUMMARYMATCHES,
          STARTSWITHBONUS: STARTSWITHBONUS,
          score: term["score"]
        };
        scoreATerm(scorePayloadTitle);
        scoreATerm(scorePayloadSummary);
      });
    });
    return searchResults;
  }

  /**
  * @summary Adds score to a data entry based on a given data entry and search term.
  */
  function scoreATerm(payload) {
    //Unpacking the payload for readability later.
    var searchTerm = payload.searchTerm;
    var searchResults = payload.searchResults;
    var jsonEntry = payload.jsonEntry;
    var jsonEntryKey = payload.jsonEntryKey;
    var titleKey = payload.titleKey;
    var FIRSTMATCH = payload.FIRSTMATCH;
    var NEXTMATCHES = payload.NEXTMATCHES;
    var STARTSWITHBONUS = payload.STARTSWITHBONUS;


    if (jsonEntry[jsonEntryKey].toUpperCase().includes(searchTerm.word.toUpperCase())) {

      //Check if the first character is matching, apply a YUGE bonus if so.jsonEntry[jsonEntryKey]
      var isStartingWith = false;
      var isStartingWithRegEx = new RegExp('\\b' + searchTerm.word.toUpperCase(), 'g');
      if (isStartingWithRegEx.test(jsonEntry[jsonEntryKey].toUpperCase())) {
        isStartingWith = true;
      }

      var instances = countInstances(jsonEntry[jsonEntryKey].toUpperCase(), searchTerm.word.toUpperCase());

      //Give the searchResults[titleKey] a score property.
      if (typeof searchResults[titleKey] == "undefined") { //True = entry doesn't exist
        searchResults[titleKey] = {};
        searchResults[titleKey]["Title"] = jsonEntry.Title;
        searchResults[titleKey]["Summary"] = jsonEntry.Summary;
        searchResults[titleKey]["URL"] = jsonEntry.URL;
        searchResults[titleKey]["score"] = 0;
      }


      //Update/create the searchResults[TitleKey]["matchedWords"] array.
      if (typeof searchResults[titleKey]["matchedWords"] == "undefined") { //True = entry doesn't exist
        var matchedWords = [];
        searchTerm["instances"] = instances;
        matchedWords.push(searchTerm);
        searchResults[titleKey]["matchedWords"] = matchedWords;
      } else if (searchResults[titleKey]["matchedWords"].includes(searchTerm)) {
        var searchTermIndex = searchResults[titleKey]["matchedWords"].indexOf(searchTerm);
        var searchTerm = searchResults[titleKey]["matchedWords"][searchTermIndex];
        searchTerm["instances"] = searchTerm["instances"] + instances;
      } else {
        searchTerm["instances"] = instances;
        searchResults[titleKey]["matchedWords"].push(searchTerm);
      }


      if (isStartingWith) {
        searchResults[titleKey]["score"] += searchTerm.score * STARTSWITHBONUS * FIRSTMATCH;
        searchResults[titleKey]["score"] += (searchTerm.score * STARTSWITHBONUS * NEXTMATCHES) * (instances - 1); //lol, like this will ever happen
      } else {
        searchResults[titleKey]["score"] += searchTerm.score * FIRSTMATCH;
        searchResults[titleKey]["score"] += (searchTerm.score * NEXTMATCHES) * (instances - 1); //lol, like this will ever happen
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
