import wikipedia
import json

listOfHobbiesPage = wikipedia.page("List of water sports")
index = 0
myList = []
for hobbyString in listOfHobbiesPage.links:
    try:       
        myDict = {'Title': hobbyString, 'Summary': wikipedia.page(hobbyString).summary, 'URL': wikipedia.page(hobbyString).url}
        myList.append(myDict)
    except Exception:
        print(hobbyString + " not found, probably.")
    print(hobbyString)

myJsonData = json.dumps(myList)

with open("Output.txt", "w") as text_file:
    text_file.write(myJsonData)
