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

  var prefs = this.ftManager.prefs;

  var defPref = "firetitle.options.defaultNameType";
  var useDefName = 0;
  if (prefs.prefHasUserValue(defPref)) {
    useDefName = prefs.getIntPref(defPref);
  }
  var menulist = null;
  if (useDefName) {
    menulist = document.getElementById("FireTitleRenameUseDefaultName");
    if (menulist) {
      menulist.selectedIndex = useDefName;
    }
  }

  var textbox = document.getElementById("FireTitleRenameName");
  if (!textbox) {
    alert("textbox is null 0");
    return;
  }
  var value = this.ftManager.getName();
  if (value) {
    textbox.value = value;
  }

  textbox = document.getElementById("FireTitleOptionsRenamePattern");
  if (!textbox) {
    alert("textbox is null 1");
    return;
  }
  textbox.value = this.ftManager.pattern;


  // the "make pattern default" and "apply to open windows" checkboxes should
  // be on iff this window's pattern is the default pattern
  value = this.ftManager.getPattern();
  var def = this.ftManager.getDefaultPattern();
  if (value == def) {
    var checkbox = document.getElementById("FireTitleOptionsRenameDefault");
    checkbox.checked = true;
    checkbox = document.getElementById("FireTitleOptionsRenameGlobal");
    checkbox.checked = true;
  }

  var compatibility = "firetitle.options.compatibilityMode";
  if (this.ftManager.prefs.prefHasUserValue(compatibility)) {
    var cbox = document.getElementById("FireTitleOptionsCompatibilityMode");
    cbox.checked = this.ftManager.prefs.getBoolPref(compatibility);
  }

  FireTitleRename_doPreview(this.ftOpener, this.ftManager);
}

function FireTitleRename_doPreview(op, man) {
  var opt = {};
  var content = op.document.getElementById("content");

  var textbox = document.getElementById("FireTitleRenameName");
  if (!textbox) {
    alert("textbox is null 2");
    return;
  }
  var name = textbox.value;

  textbox = document.getElementById("FireTitleOptionsRenamePattern");
  if (!textbox) {
    alert("textbox is null 3");
    return;
  }
  var preview = man.computeTitleFromPattern(textbox.value, name, content, opt);

  textbox = document.getElementById("FireTitleNamePreview");
  if (!textbox) {
    alert("textbox is null 4");
    return;
  }
  textbox.value = preview;

  textbox = document.getElementById("FireTitleNamePreviewErrors");
  if (!textbox) {
    alert("textbox is null 5");
    return;
  }

  textbox.value = opt.errors ? opt.errors.join("\n") : "";
}

function FireTitleRename_onKeypress(event) {
  window.setTimeout(function() {
    FireTitleRename_doPreview(window.ftOpener, window.ftManager);
  }, 0);
}

var FIRETITLE_IGNORE_PATTERN_OPTIONS = true;

function FireTitleRename_onAccept() {
  var textbox = document.getElementById("FireTitleRenameName");
  if (!textbox) {
    alert("textbox is null 6");
    return;
  }
  this.ftManager.updateName(textbox.value);

  textbox = document.getElementById("FireTitleOptionsRenamePattern");
  if (!textbox) {
    alert("textbox is null 7");
    return;
  }

  var checkbox = document.getElementById("FireTitleOptionsRenameDefault");
  var def = checkbox.checked;
  checkbox = document.getElementById("FireTitleOptionsRenameGlobal");
  var global = checkbox.checked;

  this.ftManager.updatePattern(textbox.value,
                               FIRETITLE_IGNORE_PATTERN_OPTIONS || def,
                               FIRETITLE_IGNORE_PATTERN_OPTIONS || global);

  var menulist = document.getElementById("FireTitleRenameUseDefaultName");
  var defPref = "firetitle.options.defaultNameType";
  this.ftManager.prefs.setIntPref(defPref, menulist.selectedIndex);

  checkbox = document.getElementById("FireTitleOptionsCompatibilityMode");
  var compatibility = false;
  var compatibilityOption = "firetitle.options.compatibilityMode";
  if (this.ftManager.prefs.prefHasUserValue(compatibilityOption)) {
    compatibility = this.ftManager.prefs.getBoolPref(compatibilityOption);
  }

  if ((compatibility && !checkbox.checked) ||
      (!compatibility && checkbox.checked)) {
    // user turned compatibility on or off
    alert("Changes to compatibility mode will take effect the next time you start Firefox");
  }
  this.ftManager.prefs.setBoolPref(compatibilityOption,
                                   checkbox.checked);
}

function FireTitleRename_onHelp() {
  this.ftOpener.open("chrome://firetitle/locale/help.html", "FireTitleHelp");
  return true;
}

function FireTitleRename_onCompatibilityHelp() {
  this.ftOpener.open("chrome://firetitle/locale/help.html#CompatibilityMode", "FireTitleHelp");
  return true;
}
