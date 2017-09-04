document.querySelector("#APIWarning").innerHTML = browser.i18n.getMessage("W_APIWarning");

document.querySelector("#OG_currentWindow").innerText = browser.i18n.getMessage("OG_currentWindow");
document.querySelector("#O_cur_win_name").innerText = browser.i18n.getMessage("O_windowName");
document.querySelector("#O_cur_win_pattern").innerText = browser.i18n.getMessage("O_titlePattern");
document.querySelector("#O_cur_preview").innerText = browser.i18n.getMessage("O_preview");

document.querySelector("#OG_existingWindows").innerText = browser.i18n.getMessage("OG_existingWindows");
document.querySelector("#apply-to-older").value = browser.i18n.getMessage("B_applyPatternToExisting");

document.querySelector("#OG_defaultWindows").innerText = browser.i18n.getMessage("OG_defaultWindows");

document.querySelector("#O_def_win_name").innerText = browser.i18n.getMessage("O_windowName");
document.querySelector("#O_def_win_pattern").innerText = browser.i18n.getMessage("O_titlePattern");
document.querySelector("#O_useCurrentPattern").innerText = browser.i18n.getMessage("O_useCurrentPattern");
document.querySelector("#O_def_preview").innerText = browser.i18n.getMessage("O_preview");

document.querySelector("#OG_separator").innerText = browser.i18n.getMessage("OG_separator");
document.querySelector("#O_separator").innerText = browser.i18n.getMessage("O_separator");

document.querySelector("#save-button").value = browser.i18n.getMessage("B_saveChanges");
document.querySelector("#apply-to-older").value = browser.i18n.getMessage("B_applyPatternToExisting");
document.querySelector("a#more-info").href = browser.extension.getURL("doc/help.html");
document.querySelector("a#more-info").innerText = browser.i18n.getMessage("B_moreinfo");
