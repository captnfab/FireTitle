/*
 * Copyright 2005 Jonathan Nowitz (jonathannowitz@gmail.com) and Google, Inc.
 * 
 * This file is part of FireTitle.
 * 
 * FireTitle is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * FireTitle is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with FireTitle; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

function FireTitleRename_onLoad() {
  if (window.opener.FIRETITLE_manager) {
    this.ftOpener = window.opener;
    this.ftManager = window.opener.FIRETITLE_manager;
    var desc = document.getElementById("FireTitleRenameAlsoDesc");
    if (desc) {
      desc.hidden=true;
    }
  } else {
    try {
      var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
    } catch (e) {

    }

    if (windowMediator) {
      var browser = windowMediator.getMostRecentWindow("navigator:browser");
      if (browser && browser.FIRETITLE_manager) {
        this.ftOpener = browser;
        this.ftManager = browser.FIRETITLE_manager;
      }
    }
  }

  var tabPref = "firetitle.options.selectedTab";
  var prefs = this.ftManager.prefs;
  var tabs = document.getElementById("FireTitleRenameTabs");
  tabs.onselect = function(event) {
    prefs.setIntPref(tabPref, this.selectedIndex);
  };

  var tab = 0;
  if (prefs.prefHasUserValue(tabPref)) {
    tab = prefs.getIntPref(tabPref);
  }
  tabs.selectedIndex = tab;

  var defPref = "firetitle.options.useDefaultName";
  var useDefName = false;
  if (prefs.prefHasUserValue(defPref)) {
    useDefName = prefs.getBoolPref(defPref);
  }
  var checkbox = null;
  if (useDefName) {
    checkbox = document.getElementById("FireTitleRenameUseDefaultName");
    if (checkbox) {
      checkbox.checked = true;
    }
  }
  
  var textbox = document.getElementById("FireTitleRenameName");
  if (!textbox) {
    alert("textbox is null");
    return;
  }
  var value = this.ftManager.getName();
  if (value) {
    textbox.value = value;
  }

  textbox = document.getElementById("FireTitleRenamePattern");
  if (!textbox) {
    alert("textbox is null");
    return;
  }
  textbox.value = this.ftManager.pattern;

  // the "make pattern default" and "apply to open windows" checkboxes should
  // be on iff this window's pattern is the default pattern
  value = this.ftManager.getPattern();
  var def = this.ftManager.getDefaultPattern();
  if (value == def) {
    checkbox = document.getElementById("FireTitleRenameDefault");
    checkbox.checked = true;
    checkbox = document.getElementById("FireTitleRenameGlobal");
    checkbox.checked = true;
  }

  FireTitleRename_doPreview(this.ftOpener, this.ftManager);
}

function FireTitleRename_doPreview(op, man) {
  var opt = {};
  var content = op.document.getElementById("content");

  var textbox = document.getElementById("FireTitleRenameName");
  if (!textbox) {
    alert("textbox is null");
    return;
  }
  var name = textbox.value;

  textbox = document.getElementById("FireTitleRenamePattern");
  if (!textbox) {
    alert("textbox is null");
    return;
  }
  var preview = man.computeTitleFromPattern(textbox.value, name, content, opt);
  
  textbox = document.getElementById("FireTitlePreview");
  if (!textbox) {
    alert("textbox is null");
    return;
  }
  textbox.value = preview;

  textbox = document.getElementById("FireTitlePreviewErrors");
  if (!textbox) {
    alert("textbox is null");
    return;
  }

  textbox.value = opt.errors ? opt.errors.join("\n") : "";
}

function FireTitleRename_onKeypress(event) {
  window.setTimeout(function() {
    FireTitleRename_doPreview(window.ftOpener, window.ftManager);
  }, 0);
}

function FireTitleRename_onAccept() {
  var textbox = document.getElementById("FireTitleRenameName");
  if (!textbox) {
    alert("textbox is null");
    return;
  }
  this.ftManager.updateName(textbox.value);

  textbox = document.getElementById("FireTitleRenamePattern");
  if (!textbox) {
    alert("textbox is null");
    return;
  }

  var checkbox = document.getElementById("FireTitleRenameDefault");
  var def = checkbox.checked;
  checkbox = document.getElementById("FireTitleRenameGlobal");
  var global = checkbox.checked;
  
  this.ftManager.updatePattern(textbox.value, def, global);

  checkbox = document.getElementById("FireTitleRenameUseDefaultName");
  var defPref = "firetitle.options.useDefaultName";
  this.ftManager.prefs.setBoolPref(defPref, checkbox.checked);
}
