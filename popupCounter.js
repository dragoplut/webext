/**
 * Created by oleksandr on 13.01.16.
 */


/**
 * Saves data in chrome.storage.local, if it's needed while URL's compare.
 * @param justVisited
 */
function saveData(justVisited, done){ // додамо колбек ф-цію done - в неї ми будемо вертати нашу історію
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
        // тут в нас loadedList містить всю історію з останніми змінами що ми зробили - я маю на увазі justVisited
        // передаєм нашу історію в колбек ф-цію
        done(loadedList);
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
 * Parse (clean) string url.
 * String have to start with: http:// || https://
 * Depend on input sting returns in format: www.website.com || website.com
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
    var renderClearButton = '<div><button id="clearList">Clear list</button></div>';
    console.log(webHistory, ' webHistory obj');
    for (var i = 0; i < webHistory.length; i++){
        var template = '<div id="id' + i + '"><p class="pURL">' + webHistory[i].visitedUrl + ' - ' + webHistory[i].counter + '</p></div>';
        blocks += template;
    }
    blocks = renderHeader + renderClearButton + blocks;
    return blocks;
}

// Цей Listener взагалі ніколи не спрацьовує.
chrome.tabs.onCreated.addListener(function(tab){
    console.log('onCreated');
    saveData(parseUrl(tab.url), /* тут ми маємо передати ф-цію яка отримає loadedList - done*/ function(loadedList) {
        $('#status').html(renderHTML(loadedList));
    });
});

/**
 * On tab Update Listener
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    console.log(changeInfo.status, 'onUpdated');
    if (changeInfo.status === 'loading'){   /* Додав перевірку на статус loading і відсік подвійне потрійне спрацьовування.*/
        saveData(parseUrl(tab.url), /* тут ми маємо передати ф-цію яка отримає loadedList - done*/ function(loadedList) {
            $('#status').html(renderHTML(loadedList));
        });
    }
});

/**
 * Extention icon onClick Listener.
 * Render actual list from chrome.storage.local
 */
document.addEventListener('DOMContentLoaded', function(){
    /*1*/  loadList(function (result){
        // тут ми вставляємо кнопку
        /*3*/ $('#status').html(renderHTML(result));

        // тут потрібна кнопка вже точно буде
        /*4*/$('#clearList').on('click', function(){
            /*5*/if (confirm('Delete previous URL history! Are you sure?')){
                console.log('button click');
                /*6*/chrome.storage.local.set({storageData: []});
                /*7*/alert('History is deleted!');
                 // кстаті після видалення мабуть що потрібно знову викликати renderHTML бо історія буде показуватись поки не вікриеєм новий сайт чи не оновим сторінку
            }
        });
    });
    /*2*/ console.log('pic click listener');
});