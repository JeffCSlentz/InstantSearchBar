# InstantSearchBar
A search bar for testing different visual cues of data matching.
Try it out!
http://kchovercam.com/search-bar/

### Introduction
This experiment's goal is to gauge user response to finding similar words in the search results. User’s responses could be used to inform a good UI design that made it clear what was happening with their search query. 

### Functionality
The search bar differentiates between complete words and incomplete words. For incomplete words, a word is autosuggested.

![Incomplete words have an autosuggested word](http://i.imgur.com/Vw2aeFK.png)

For complete words, exact matches are bolded, and similar matches are in italics. The results dropdown and similar words on the side of the page are updated dynamically.
![Similar and exact matches are highlighted differently](http://i.imgur.com/F7SvCCb.png)

### User testing
User testing can be found at the end of the [Summary Report](Summary-Report.docx)

### Data Schema
![Three objects hold all the information](http://i.imgur.com/e5ZJXDX.png)

### Algorithm
1.	Grab the user’s query.
2.	Split it into words.
    - Discard less useful words according to a list from http://www.stopwords.org
3.	Categorize the words.
    - Every word but the last is trusted as a “complete” word. (Unsafe, to be sure.)
    - The last is either “incomplete” or “complete”, as determined by the results from https://api.datamuse.com/sug?s=word
4.	Generate related words.
    - “similar” words are generated from sending “complete” words to  https://api.datamuse.com//words?ml=word
    - A “suggested” word is generated from sending “incomplete” words to https://api.datamuse.com/sug?s=word
5.	Assign scores to the words, to simulate relevancy.
    - “complete” words are worth the most.
    - “similar” words are worth almost as much as complete words.
    - “incomplete” words are not worth very much.
    - “suggested” words are worth even less.
6.	Each word found in a data entry adds that word’s score to the entry’s cumulative score according to a few rules:
    - The first word found is worth more than the next words.
    - If the first character matches, the entry receives a lot more points. (To reduce the ‘tree is in street’ problem.)
    - Title matches are worth more than summary matches.
7.	Sort the data entries by their score and display them to the user with matching words highlighted.
