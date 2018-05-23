document.querySelector("#APIWarning span").innerText = browser.i18n.getMessage("W_APIWarning");
document.querySelector("#APIWarning a").innerText = browser.i18n.getMessage("W_APIWarningURL");

document.querySelector("#OG_defaultWindows").innerText = browser.i18n.getMessage("OG_defaultWindows");
document.querySelector("#O_def_win_name").innerText = browser.i18n.getMessage("O_windowName");
document.querySelector("#O_def_win_pattern").innerText = browser.i18n.getMessage("O_titlePattern");
document.querySelector("#O_def_preview").innerText = browser.i18n.getMessage("O_preview");

document.querySelector("#OG_currentProfile").innerText = browser.i18n.getMessage("OG_currentProfile");
document.querySelector("#O_cur_pro_name").innerText = browser.i18n.getMessage("O_profileName");

document.querySelector("#OG_separator").innerText = browser.i18n.getMessage("OG_separator");
document.querySelector("#O_separator").innerText = browser.i18n.getMessage("O_separator");

document.querySelector("#OG_existingWindows").innerText = browser.i18n.getMessage("OG_existingWindows");
document.querySelector("#apply-default-pattern-to-others").value = browser.i18n.getMessage("B_applyDefPatternToExisting");


document.querySelector("a#more-info").href = browser.extension.getURL("doc/help.html");
document.querySelector("a#more-info").innerText = browser.i18n.getMessage("B_moreinfo");
