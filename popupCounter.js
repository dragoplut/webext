/**
 * Created by oleksandr on 13.01.16.
 */

/**
 *  Compare justVisited url with list from loadedList.
 * @param loadedList
 * @param justVisited
 */
function compareList(loadedList, justVisited){
    console.log(loadedList, ' 3 before if undefined');
    var newData = [];
    if (loadedList[0].visitedUrl === undefined || loadedList === []){
        newData = [{visitedUrl: justVisited, counter: 1}];
        chrome.storage.local.set({storageData: newData});
    } else {
        loadList(function(result){
            loadedList = result;
            console.log(loadedList[0].visitedUrl, ' 4 in compare');
            for (var i = 0; i < loadedList.length; i++){
                if (loadedList[i].visitedUrl === justVisited){
                    newData = [{'visitedUrl': justVisited, 'counter': loadedList[i].counter + 1}];
                    chrome.storage.local.set({storageData: newData});
                } else if (i === loadedList.length && loadedList[i].visitedUrl != justVisited) {
                    newData = loadedList.push({'visitedUrl': justVisited, 'counter': 1});
                    chrome.storage.local.set({storageData: newData});
                }
            }
        });
    }
}

/**
 * Synchronizes async function with the rest of code..
 * @param justVisited
 */
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
 * Loads list of visited url's. Warning!!! Asynchronous function!!!
 * @param done
 */
function loadList(done){
    var loadedData = [];
    chrome.storage.local.get('storageData', function (result) {
        console.log(result.storageData, ' 1 storage status');
        if (result.storageData && result.storageData != undefined){
            loadedData = result.storageData;
            console.log(loadedData, ' 2 in load');
        done(loadedData);
        } else if (result.storageData === undefined){
            var newData = [{visitedUrl: undefined, counter: undefined}];
            chrome.storage.local.set({storageData: newData});
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
 * Render popup html info.
 * @param webHistory
 * @returns {Array}
 */
function renderHTML(webHistory){
    var blocks = [];
    console.log(webHistory, ' webHistory obj');
    for (var i = 0; i < webHistory.length; i++){
        var template = '<div id="' + i + '"><p>' + webHistory[i].visitedUrl + ' - ' + webHistory[i].counter + '</p></div><br>';
        blocks += template;
    }
    return blocks;
}

/**
 * On tab Update, makes compare and changes in chrome.storage.local
 */
chrome.tabs.onUpdated.addListener(function( tabId, changeInfo, tab){
    loadBase(parseUrl(tab.url));
});

/**
 * Extention icon onClick Listener.
 * Render actual list from chrome.storage.local
 */
document.addEventListener('DOMContentLoaded', function(){
    loadList(function (result){
        $('#status').html(renderHTML(result));
    });
    console.log('pic click listener');
});