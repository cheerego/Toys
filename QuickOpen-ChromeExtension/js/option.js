

var btn = document.getElementById('btn');
btn.onclick = function() {
  var key = document.getElementById('key').value;
  var val = document.getElementById('value').value;
  localStorage.setItem(key,val);
  alert('success');
};
