/**
 * Created by oleksandr on 13.01.16.
 */

/**
 * Compare justVisited url with list from loadList. Warning!!! Because of "empty" loadedList arr, is not working.
 * @param justVisited
 * @returns {Array}
 */
function compareList(justVisited){
    var loadedList = loadList();
    console.log(loadedList, ' before if undefined');
    if (loadedList === undefined || loadedList == []){
        chrome.storage.local.set({'visitedUrl': justVisited});
        chrome.storage.local.set({'counter': 1});
        loadedList = loadList();
    }
    var trigger = false;
    console.log(loadedList, ' in compare');
    for (var i = 0; i <= loadedList.length; i++){
        if (loadedList.visitedUrl[i] == justVisited){
            chrome.storage.local.set({'visitedUrl': justVisited});
            chrome.storage.local.set({'counter': loadedList.counter + 1});
            trigger = true;
        } else if (i == loadedList.visitedUrl.length && !trigger){
            chrome.storage.local.set({'visitedUrl': justVisited});
            chrome.storage.local.set({'counter': 1});
            trigger = true;
        }
    }
    return loadList();
}

/**
 * Loads list of visited url's. Warning!!! Problem, it is not returning array loadedList. Didn't solv.
 * @returns {Array}
 */
function loadList(){
    var loadedList = [];
    chrome.storage.local.get(['visitedUrl', 'counter'], function (result) {
        console.log(result.visitedUrl, ' storage status');
        //if (result.visitedUrl && result.visitedUrl != undefined){
            var visited = result.visitedUrl;
            var count = result.counter;
            loadedList = [{'visitedUrl': visited}, {'counter': count}];
            console.log(visited, count, loadedList, ' in load');
        //}
    });
    return loadedList;
}

/**
 * Parse (clean) string url. Depend on input sting returns in format: www.website.com || website.com
 * String have to start with: http:// || https://
 * @param unparsedUrl
 * @returns {string}
 */
function parseUrl(unparsedUrl){
    var unparsed = [];
    var parsedUrl = '';
    for (var i = 0; i < unparsedUrl.length; i++){
        if (unparsed[i] === undefined){
            unparsed[i] = '';
        }
        unparsed[i] += unparsedUrl[i];
    }
    if (unparsed.indexOf('/') == 5){
        unparsed.splice(0,7);
        unparsed = unparsed.slice(0, unparsed.indexOf('/'));
        parsedUrl = unparsed.join('');
    } else if (unparsed.indexOf('/') == 6){
        unparsed.splice(0,8);
        unparsed = unparsed.slice(0, unparsed.indexOf('/'));
        parsedUrl = unparsed.join('');
    } else {
        console.log('Uncorrect url start.');
    }
    return String(parsedUrl);
}

/**
 * Render popup html info. Warning!!! Not finished, because of problem with "loadedList" array.
 * @param webHistory
 * @returns {Array}
 */
function renderHTML(webHistory){
    var blocks = [];
    //console.log(webHistory);
    for (var i = 0; i < webHistory.length; i++){
        var template = '<div id="' + i + '"><p>' + webHistory[i] + ' - ' + webHistory[i] + '</p></div><br>';
        blocks += template;
    }
    return blocks;
}

chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab){
    var justVisited = parseUrl(tab.url);
    $('#status').html(renderHTML(compareList(justVisited)));
    console.log(loadList());
});