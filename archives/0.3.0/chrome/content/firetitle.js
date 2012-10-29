/*
 * Copyright 2005 Jonathan Nowitz (jonathannowitz@gmail.com) and Google, Inc.
 * Portions of this code are Copyright mozilla.org and/or Pierre Chanial
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

function FireTitleManager() {
  this.opened = new Date();
  if (window.opener != null) {
    this.setNameClobberDefault(window.opener.FIRETITLE_manager.nameMyChild());
    this.defaultName = this.getName();
  }

  this.observerService = Components.classes[
      "@mozilla.org/observer-service;1"]
  .getService(Components.interfaces.nsIObserverService);
  this.observerService.addObserver(this, "firetitle.sync-to-pattern", false);

  this.prefs = Components.classes["@mozilla.org/preferences;1"]
               .getService(Components.interfaces.nsIPrefBranch);
  if(this.prefs == null) {
    alert("null preferences object");
    return;
  }
  
  this.setPattern("ntm");
  if (this.prefs.prefHasUserValue("firetitle.pattern.default")) {
    this.setPattern(this.prefs.getCharPref("firetitle.pattern.default"));
  }
  document.getElementById("content").updateTitlebar = function() {
    document.title = FIRETITLE_manager.computeTitle(this);
  };

  // 'a' changes potentially every minute
  window.setInterval(FireTitleManager_setTitle,
                     FireTitleManager.ONE_MINUTE);

//   var myPrefs = this.prefs;

  if (!this.prefs.prefHasUserValue("firetitle.options.compatibilityMode") ||
      !this.prefs.getBoolPref("firetitle.options.compatibilityMode")) {
    BookmarksMenu.loadBookmarkFireTitleOrig = BookmarksMenu.loadBookmark;
    BookmarksMenu.loadBookmark = function(aEvent, aTarget, aDS) {
//     if (myPrefs.prefHasUserValue("firetitle.options.compatibilityMode") &&
//         myPrefs.getBoolPref("firetitle.options.compatibilityMode")) {
//       return this.loadBookmarkFireTitleOrig(aEvent, aTarget, aDS);
//     }
      if (aTarget.getAttribute("class") == "openintabs-menuitem") {
        aTarget = aTarget.parentNode.parentNode;
        var name = aTarget.getAttribute("label");
//       if (myPrefs.prefHasUserValue("firetitle.options.compatibilityMode") &&
//           myPrefs.getBoolPref("firetitle.options.compatibilityMode")) {
//         window.setTimeout(function() {
//           this.FIRETITLE_manager.updateName(name);
//         }, 100);
//       } else {
        window.open(null, "FireTitle" + name);
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);
        var newWindow = wm.getMostRecentWindow("navigator:browser");
        newWindow.setTimeout(function() {
          this.FIRETITLE_manager.updateName(name);
        }, 100);
//       }
      }
      this.loadBookmarkFireTitleOrig(aEvent, aTarget, aDS);
    }
  }

  BookmarksMenu.validOpenInTabsMenuItem = function (aTarget) {
    var rParent = RDF.GetResource(aTarget.parentNode.id)
    var type = BookmarksUtils.resolveType(rParent);
    if (type != "Folder" && type != "PersonalToolbarFolder")
      return false;
    if (!aTarget.hasChildNodes())
      return false;
    var curr = aTarget.firstChild;
    do {
      type = BookmarksUtils.resolveType(curr.id);
      if (type == "Bookmark")
        return true;
      curr = curr.nextSibling;
    } while (curr);
    return false;
  };

  // startup weirdness
  window.setTimeout(FireTitleManager_setTitle, 100);
}

FireTitleManager.ONE_MINUTE = 60 * 1000;
FireTitleManager.ONE_HOUR = 60 * FireTitleManager.ONE_MINUTE;
FireTitleManager.ONE_DAY = 24 * FireTitleManager.ONE_HOUR;

FireTitleManager.prototype.name = null;
FireTitleManager.prototype.prefs = null;

FireTitleManager.prototype.observe = function(subject, topic, data) {
  if (topic == "firetitle.sync-to-pattern") {
    if (this.pattern != data) {
      this.pattern = data;
      FireTitleManager_setTitle();
    }
  }
}

FireTitleManager.prototype.setPattern = function(pattern) {
  this.pattern = pattern;
  this.patternComponents = null;
}

FireTitleManager.prototype.nameMyChild = function() {
  if (!this.prefs.prefHasUserValue("firetitle.options.defaultNameType")) {
    return null;
  }
  var defaultLevel = this.prefs.getIntPref("firetitle.options.defaultNameType")
  if (defaultLevel == 0) {
    return null;
  }
    
  if (this.defaultName) {
    return this.defaultName + "+";
  }
  var elt = document.getElementById("content");
  var name = this.getName();
  if (defaultLevel == 1) {
    return "* " + (name ? name : "UNNAMED");
  }
  return "* " + (name ? name + " > " : "") +
         FireTitleManager.getDocumentTitle(elt);
}

FireTitleManager.prototype.computeTitle = function(content) {
  return this.computeTitleFromPattern(this.pattern, this.getName(), content);
}

FireTitleManager.prototype.computeTitleFromPattern =
                                     function(pattern, name, content, optOpt) {
  if (!pattern) {
    return "UNTITLED";
  }
  if (!optOpt) {
    optOpt = {};
  }

  var title = "";
  var first = true;
  var separator = FireTitleManager.getSeparator(content);
  for (var i = 0; i < pattern.length; ++i) {
    var match = null;
    var defValue = null;
    var bang = false;
    var limit = 0;
    switch(pattern.charAt(i)) {
      case 'n':
        match = name;
        defValue = "UNNAMED";
        break;
      case 't':
        match = FireTitleManager.getDocumentTitle(content);
        defValue = "(Untitled)";
        break;
      case 'm':
        defValue = "NO MODIFIER";
        match = FireTitleManager.getModifier(content);
        break;
      case 'a':
      case 'w':
        var now = new Date();
        var nowMillis = now.valueOf();
        var then = FIRETITLE_manager.opened;
        var thenMillis = then.valueOf();
        if (pattern.charAt(i) == 'w') {
          if (nowMillis - thenMillis > FireTitleManager.ONE_DAY) {
            match = then.toDateString();
          } else {
            match = then.toTimeString();
          }
        } else {
          match = FireTitleManager.age(nowMillis, thenMillis);
          defValue = "0 minutes";
        }
        break;
      case '[':
        var where = i;
        var string = "";
        var c;
        ++i;
        do {
          while ((c = pattern.charAt(i)) != ']' && i < pattern.length) {
            string += c;
            i++;
          }
          if (i == pattern.length) {  // ran off the end
            FireTitleManager.addError(optOpt,
                                      "unterminated '[' at char " + where);
          }
          if (i+1 < pattern.length && pattern.charAt(i+1) == ']') {
            // ']]' is a literal ']'
            string += ']';
            i += 2;
          } else {
            break;
          }
        } while (true);
        match = string;
        break;
      default:
        FireTitleManager.addError(optOpt,
                                  "Could not parse '" + pattern.charAt(i) +
                                  "' at character " + i);
        break;
    }
    
    // consume any modifiers
    var modifiersDone = false;
    while (i+1 < pattern.length && !modifiersDone) {
      switch (pattern.charAt(i+1)) {
        case '!':
          i++;
          bang = true;
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          if (!pattern.charAt(i).match(/\d/) && limit > 0) {
            FireTitleManager.addError(optOpt,
                                      "Multiple number modifiers at char" +
                                      (i+1));
          }
          ++i;
          var beginNumber = i;
          while (i+1 < pattern.length && pattern.charAt(i+1).match(/\d/)) {
            i++;
          }
          limit = parseInt(pattern.substring(beginNumber, i+1));
          break;
        default:
          modifiersDone = true;
          break;
      }
    }

    if (bang && !match) {
      match = defValue;
    }
    if (match) {
      if (!first) {
        title += separator;
      } else {
        first = false;
      }
      if (limit > 0 && match != null) {
        match = match.substring(0, limit);
      }
      title += match;
    }
  }
  return title;
}

FireTitleManager.addError = function(optOpt, msg) {
  if (!optOpt) {
    return;
  }
  
  if (!optOpt.errors) {
    optOpt.errors = [];
  }

  optOpt.errors.push(msg);
}

FireTitleManager.age = function(nowMillis, thenMillis) {
  var diff = nowMillis - thenMillis;
  var days = Math.floor(diff / FireTitleManager.ONE_DAY);
  if (days > 0) {
    return "" + days + " day" + (days > 1 ? "s" : "");
  }
  var hours = Math.floor(diff / FireTitleManager.ONE_HOUR);
  if (hours > 0) {
    return "" + hours + " hour" + (hours > 1 ? "s" : "");
  }
  var minutes = Math.floor(diff / FireTitleManager.ONE_MINUTE);
  if (minutes > 0) {
    return "" + minutes + " minute" + (minutes > 1 ? "s" : "");
  }
  return null;
}

FireTitleManager.prototype.updatePattern = function(pattern, makeDefault, global) {
  if (!pattern || pattern == "") {
    return;
  }
  if (this.pattern != pattern) {
    this.pattern = pattern;
    FireTitleManager_setTitle();
  }
  if (makeDefault) {
    this.setDefaultPattern(pattern);
  }
  if (global) {
    this.observerService.notifyObservers(null, "firetitle.sync-to-pattern", pattern);
  }
}

FireTitleManager.prototype.setDefaultPattern = function(pattern) {
  if (!this.prefs) {
    alert("null preferences object");
    return;
  }
  
  this.prefs.setCharPref("firetitle.pattern.default", pattern);
}

FireTitleManager.prototype.getDefaultPattern = function() {
  if (!this.prefs) {
    alert("null preferences object");
    return null;
  }
  
  var defaultPattern = "ntm";
  if (this.prefs.prefHasUserValue("firetitle.pattern.default")) {
    defaultPattern = this.prefs.getCharPref("firetitle.pattern.default");
  }

  return defaultPattern;
}


FireTitleManager.prototype.getPattern = function() {
  return this.pattern;
}

FireTitleManager.getModifier = function(content) {
  return content.ownerDocument.documentElement.getAttribute("titlemodifier");
}

FireTitleManager.getWindowDocumentTitle = function(win) {
  FireTitleManager.getDocumentTitle(win.document.getElementById("content"));
}


FireTitleManager.getDocumentTitle = function(content) {
  var docTitle;
  if (content.contentDocument) {
    docTitle = content.contentDocument.title;
  }
  if (!docTitle && content.ownerDocument) {
    docTitle = content.ownerDocument.documentElement.getAttribute("titledefault");
  }
  return docTitle;
}

FireTitleManager.getSeparator = function(content) {
  return content.ownerDocument.documentElement.getAttribute("titlemenuseparator");
}

FireTitleManager.prototype.getName = function() {
  return this.name;
}

FireTitleManager.prototype.setNameClobberDefault = function(name) {
  this.name = name;
  this.defaultName = null;
}

FireTitleManager.prototype.updateName = function(name) {
  if (this.name == name) {
    return;
  }
  this.setNameClobberDefault(name);
  FireTitleManager_setTitle();
}

function FireTitleManager_setTitle() {
  document.getElementById("content").updateTitlebar();
}

function FireTitleManager_onLoad(event) {
  document.getElementById("content").addEventListener("DOMTitleChanged", FireTitleManager_setTitle, false);
}

function FireTitleManager_onUnload(event) {
  var ftm = FIRETITLE_manager;
  ftm.observerService.removeObserver(ftm, "firetitle.sync-to-pattern");
}

function FireTitleRename_show() {
  window.openDialog("chrome://firetitle/content/rename.xul",
                    "FireTitleRename",
                    "modal,centerscreen,chrome,resizable=no");
}
