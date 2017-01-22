function cv() {
  function wordBlock(word) {
    var ret = word.rivil.charAt(0).toUpperCase() + word.rivil.slice(1);
    return ret;
  }
  var seedText = document.form1.textarea1.value;
  var words = rivil.lang.getText(seedText);
  var html = "";
  for(var i = 0; i < words.length; i++) {
    var word = words[i];
    html += wordBlock(word);
  }
  document.getElementById("result1").innerHTML = html;
}
