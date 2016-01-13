/**
 * Created by oleksandr on 13.01.16.
 */

function jsonLoad(history){
    $.ajax({
        dataType: 'json',
        url: '/history.json',
        success: function(result){
            history(result.webData);
        }
    });
}

function renderHTML(webHistory, url){
    var blocks = [];
    for (var i = 0; i < webHistory.length; i++){
        var template = '<div id="' + webHistory.id + '"><h5>' + url + '</h5><h5>' + webHistory.domen + '</h5><h5>' + webHistory.counter + '</h5></div><br>';
        blocks += template;
    }
    return blocks;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo){
    var webHistory = jsonLoad(history);
    var url = changeInfo.url;
    $('#status').html(renderHTML(webHistory, url));
});