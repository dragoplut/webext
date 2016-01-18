/**
 * Created by oleksandr on 13.01.16.
 */

//function clearBase(){
//    if (confirm('Delete previous URL history! Are you sure?')){
//        chrome.storage.local.set({storageData: []});
//        alert('History is deleted!');
//    }
//}

/**
 * Saves data in chrome.storage.local, if it's needed while URL's compare.
 * @param justVisited
 */
function saveData(justVisited){
    loadList(function(result){ // тут завжди прийде масив - або з данними або пустий []
        loadedList = result;
        var found = false;
        for (var i = 0; i < loadedList.length; i++){
            if (loadedList[i].visitedUrl === justVisited){
                loadedList[i].counter = loadedList[i].counter + 1;
                found = true;//"трігер" зупинки перебору по знайденому урлу - так ми сигналізуємо цим що урл було знайдено
                break;
            }
        }
        // якщо урл не було знайдено - додати новий обєкт з нашим урл
        if (found === false) {
            loadedList.push({'visitedUrl': justVisited, 'counter': 1});
        }
        chrome.storage.local.set({storageData: loadedList});
    });
}

/**
 * Synchronizes async function with the rest of code..
 * @param justVisited
 */
function loadBase(justVisited){
    saveData(justVisited);
    loadList(function (result){
        $('#status').html(renderHTML(result));
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
            chrome.storage.local.set({storageData: []});
            done([]); // вертаєм пустий масив - ніби ми ще не відвідували не одного сайту
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
    var renderHeader = '<div><h5 class="pURL"><b>URL - count</b></h5></div>';
    //var renderFooter = '<div><a href="#" onclick="clearBase()">Clear list</a></div>';
    console.log(webHistory, ' webHistory obj');
    for (var i = 0; i < webHistory.length; i++){
        var template = '<div id="id' + i + '"><p class="pURL">' + webHistory[i].visitedUrl + ' - ' + webHistory[i].counter + '</p></div>';
        blocks += template;
    }
    blocks = renderHeader + blocks;
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