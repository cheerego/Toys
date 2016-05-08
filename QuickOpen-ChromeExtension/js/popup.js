
var localStorageCount = localStorage.length;
var ul = document.getElementsByTagName('ul')[0];
for (var i = 0; i < localStorageCount; i++) {
  var key = localStorage.key(i);
  var val = localStorage.getItem(key);
  var li = document.createElement('li');
  var button = document.createElement('button');
  button.setAttribute('href',val);
  button.innerHTML = key;
  li.appendChild(button);
  ul.appendChild(li);
}
if (ul.childElementCount == 0) {
  ul.innerHTML="右键->选项  添加链接！"
}


var btns = document.getElementsByTagName('button');
var length = btns.length;
for (var i = 0; i < length; i++) {
  btns[i].onclick = function(ev) {
    chrome.tabs.create({
      url: this.getAttribute('href')
    }, function(tab) {});
  }
}
