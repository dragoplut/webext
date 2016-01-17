/**
 * Created by oleksandr on 13.01.16.
 */

/**
 * Compare justVisited url with list from loadList. Warning!!! Because of "empty" loadedList arr, is not working.
 * @param justVisited
 * @returns {Array}
 */
function compareList(loadedList, justVisited){
    console.log(loadedList, ' 3 before if undefined');
    if (loadedList === undefined || loadedList == []){
        chrome.storage.local.set({'visitedUrl': justVisited});
        chrome.storage.local.set({'counter': 1});
    }
    var trigger = false;
    console.log(loadedList, ' 4 in compare');
    loadList(function(result){
        loadedList = result;
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
    });
}


function loadBase(justVisited){
    var loadedList = [];
    loadList(function(result){
        loadedList = result;
        compareList(loadedList, justVisited);
        loadList(function (result){
            $('#status').html(renderHTML(result));
        });
    });
}

/**
 * Loads list of visited url's. Warning!!! Problem, it is not returning array loadedList. Didn't solv.
 * @returns {Array}
 */
function loadList(done){
    var loadedList = {};
    chrome.storage.local.get(['visitedUrl', 'counter'], function (result) {
        console.log(result.visitedUrl, ' 1 storage status');
        if (result.visitedUrl && result.visitedUrl != undefined){
            var visited = result.visitedUrl;
            var count = result.counter;
            loadedList.visitedUrl = visited;
            loadedList.counter = count;
            console.log(visited, count, loadedList, ' 2 in load');
        done(loadedList);
        }
    });
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
    console.log(webHistory, ' webHistory obj');
    for (var i = 0; i < webHistory.visitedUrl.length; i++){
        var template = '<div id="' + i + '"><p>' + webHistory.visitedUrl + ' - ' + webHistory.counter + '</p></div><br>';
        blocks += template;
    }
    return blocks;
}


chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab){
    var justVisited = parseUrl(tab.url);
    loadBase(justVisited);
});

document.addEventListener('DOMContentLoaded', function(){
    console.log('pic click listener');
});