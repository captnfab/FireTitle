function update()
{
  browser.runtime.sendMessage({message: "update" });
}

document.addEventListener("DOMContentLoaded", update);
var ttag = document.querySelector("title");
if (ttag) ttag.addEventListener("change",update);
//document.getElementById("content").addEventListener("DOMTitleChanged", window.FireTitle.settitle(), false);
