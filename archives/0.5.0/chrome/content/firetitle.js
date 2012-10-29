/*
 * Copyright 2011-2012 Fabien Givors (fabien.givors@chezlefab.net)
 * Copyright 2008 Jonathan Nowitz (jonathannowitz@gmail.com)
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

function FireTitleManager()
{
  this.opened = new Date();

  // Session object that stores name in session manager
  this.sessionStore = Components.classes["@mozilla.org/browser/sessionstore;1"]
    .getService(Components.interfaces.nsISessionStore);

  this.observerService = Components.classes[
    "@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService);
  this.observerService.addObserver(this, "firetitle.sync-to-pattern", false);

  // Handle plugin configuration
  this.prefs = Components.classes["@mozilla.org/preferences;1"]
    .getService(Components.interfaces.nsIPrefBranch);
  if(this.prefs == null)
  {
    alert("null preferences object");
    return;
  }

  document.getElementById("content").updateTitlebar =
    function()
    {
      document.title = FIRETITLE_manager.computeTitle(this);
    };


  // 'a' changes potentially every minute
  window.setInterval(FireTitleManager_setTitle, FireTitleManager.ONE_MINUTE);
  // startup weirdness
  window.setTimeout(FireTitleManager_setTitle, 100);
}



// Time constants (in ms)
FireTitleManager.ONE_MINUTE = 60 * 1000;
FireTitleManager.ONE_HOUR = 60 * FireTitleManager.ONE_MINUTE;
FireTitleManager.ONE_DAY = 24 * FireTitleManager.ONE_HOUR;

FireTitleManager.addError = function(optOpt, msg)
{
  if (!optOpt)
  {
    return;
  }

  if (!optOpt.errors)
  {
    optOpt.errors = [];
  }

  optOpt.errors.push(msg);
}

FireTitleManager.age = function(nowMillis, thenMillis)
{
  var diff = nowMillis - thenMillis;
  var days = Math.floor(diff / FireTitleManager.ONE_DAY);
  if (days > 0)
  {
    return "" + days + " day" + (days > 1 ? "s" : "");
  }
  var hours = Math.floor(diff / FireTitleManager.ONE_HOUR);
  if (hours > 0)
  {
    return "" + hours + " hour" + (hours > 1 ? "s" : "");
  }
  var minutes = Math.floor(diff / FireTitleManager.ONE_MINUTE);
  if (minutes > 0)
  {
    return "" + minutes + " minute" + (minutes > 1 ? "s" : "");
  }
  return null;
}

FireTitleManager.getModifier = function(content)
{
  return content.ownerDocument.documentElement.getAttribute("titlemodifier");
}

FireTitleManager.getWindowDocumentTitle = function(win)
{
  getDocumentTitle(win.document.getElementById("content"));
}

FireTitleManager.getDocumentTitle = function(content)
{
  var docTitle;
  if (content.contentDocument)
  {
    docTitle = content.contentDocument.title;
  }
  if (!docTitle && content.ownerDocument)
  {
    docTitle = content.ownerDocument.documentElement.getAttribute("titledefault");
  }
  return docTitle;
}

FireTitleManager.getWindowName = function()
{
  var wname = this.sessionStore.getWindowValue(window, "ftlWinName");
  if(!wname)
  {
    wname = "(untitled)";
  }

  return wname;
}

FireTitleManager.getSeparator = function(content)
{
  return content.ownerDocument.documentElement.getAttribute("titlemenuseparator");
}

/*********************************************************************************
 * Public API & Helpers
 */

function FireTitleManager_setTitle()
{
  document.getElementById("content").updateTitlebar();
}

function FireTitleManager_onLoad(event)
{
  document.getElementById("content").addEventListener("DOMTitleChanged", FireTitleManager_setTitle, false);
}

function FireTitleManager_onUnload(event)
{
  var ftm = FIRETITLE_manager;
  ftm.observerService.removeObserver(ftm, "firetitle.sync-to-pattern");
}

function FireTitleRename_show()
{
  window.openDialog("chrome://firetitle/content/rename.xul",
      "FireTitleRename",
      "modal,centerscreen,chrome,resizable=no");
}

/*********************************************************************************
 * FireTitleManager.prototype
 */

FireTitleManager.prototype.name = null;
FireTitleManager.prototype.pattern = null;
FireTitleManager.prototype.prefs = null;

FireTitleManager.prototype.setDefaultPattern = function(pattern)
{
  if (!this.prefs)
  {
    alert("null preferences object");
    return;
  }
  this.prefs.setCharPref("firetitle.pattern.default", pattern);
}

FireTitleManager.prototype.getDefaultPattern = function()
{
  if (!this.prefs)
  {
    alert("null preferences object");
    return null;
  }
  var defaultPattern;
  if (this.prefs.prefHasUserValue("firetitle.pattern.default"))
  {
    defaultPattern = this.prefs.getCharPref("firetitle.pattern.default");
  }
  else
  {
    defaultPattern = "ntm";
  }
  return defaultPattern;
}

FireTitleManager.prototype.setPattern = function(pattern)
{
  this.sessionStore.setWindowValue(window, "ftlWinPatt", pattern);
  this.pattern = pattern;
  this.patternComponents = null;
}

FireTitleManager.prototype.getPattern = function()
{
  if (!this.pattern)
  {
    this.setPattern(this.sessionStore.getWindowValue(window, "ftlWinPatt"));

    if(!this.pattern)
    {
      if(window.opener)
      {
        this.setPattern(window.opener.FIRETITLE_manager.getPattern());
      }
      else
      {
        this.setPattern("ntm");
      }
    }
  }
  return this.pattern;
}

FireTitleManager.prototype.updatePattern = function(pattern, makeDefault, global)
{
  if (!pattern || pattern == "")
  {
    return;
  }
  if (this.pattern != pattern)
  {
    this.setPattern(pattern);
    FireTitleManager_setTitle();
  }
  if (makeDefault)
  {
    this.setDefaultPattern(pattern);
  }
  if (global)
  {
    this.observerService.notifyObservers(null, "firetitle.sync-to-pattern", pattern);
  }
}

FireTitleManager.prototype.setName = function(name)
{
  this.sessionStore.setWindowValue(window, "ftlWinName", name);
  this.name = name;
}

FireTitleManager.prototype.getName = function()
{
  if(!this.name)
  {
    this.setName(this.sessionStore.getWindowValue(window, "ftlWinName"));

    if(!this.name)
    {
      if(window.opener)
      {
        var title = window.opener.document.getElementById("content").contentDocument.title;
        this.setName(window.opener.FIRETITLE_manager.getName() + " > " + title);
      }
      else
      {
        this.setName("(untitled)");
      }
    }
  }
  return this.name;
}

FireTitleManager.prototype.updateName = function(name)
{
  if (this.sessionStore.getWindowValue(window, "ftlWinName") != name)
  {
    this.setName(name);
    FireTitleManager_setTitle();
  }
}

  // Listen to topic "firetitle.sync-to-pattern" for global changes
FireTitleManager.prototype.observe = function(subject, topic, data)
{
  if (topic == "firetitle.sync-to-pattern")
  {
    if (this.getPattern() != data)
    {
      this.setPattern(data);
      FireTitleManager_setTitle();
    }
  }
}


FireTitleManager.prototype.nameMyChild = function() // ???
{
  // TODO: fixme
  return "";
  if (!this.prefs.prefHasUserValue("firetitle.options.defaultNameType"))
  {
    return null;
  }
  var defaultLevel = this.prefs.getIntPref("firetitle.options.defaultNameType");
  if (defaultLevel == 0)
  {
    return null;
  }

  var elt = document.getElementById("content");
  var name = this.getName();
  if (defaultLevel == 1)
  {
    return "* " + (name ? name : "UNNAMED");
  }
  return "* " + (name ? name + " > " : "") +
    FireTitleManager.getDocumentTitle(elt);
}

  // Public method called on titlebar changes
FireTitleManager.prototype.computeTitle = function(content)
{
  return this.computeTitleFromPattern(this.getPattern(), this.getName(), content);
}

FireTitleManager.prototype.computeTitleFromPattern = function(pattern, name, content, optOpt)
{
  if (!pattern)
  {
    return "NOPATTERN";
  }

  if (!optOpt)
  {
    optOpt = {};
  }

  var title = "";
  var first = true;
  var separator = FireTitleManager.getSeparator(content);
  for (var i = 0; i < pattern.length; ++i)
  {
    var match = null;
    var defValue = null;
    var bang = false;
    var limit = 0;
    switch(pattern.charAt(i))
    {
      case 'n':
        match = name;
        defValue = "UNNAMED";
        break;
      case 't':
        match = FireTitleManager.getDocumentTitle(content);
        defValue = "(Untitled)";
        break;
      case 'm':
        defValue = "NOMODIFIER";
        match = FireTitleManager.getModifier(content);
        break;
      case 'a':
      case 'w':
        var now = new Date();
        var nowMillis = now.valueOf();
        var then = FIRETITLE_manager.opened;
        var thenMillis = then.valueOf();
        if (pattern.charAt(i) == 'w')
        {
          if (nowMillis - thenMillis > FireTitleManager.ONE_DAY)
          {
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
        do
        {
          while ((c = pattern.charAt(i)) != ']' && i < pattern.length)
          {
            string += c;
            i++;
          }
          if (i == pattern.length)
          {  // ran off the end
            FireTitleManager.addError(optOpt,
                "unterminated '[' at char " + where);
          }
          if (i+1 < pattern.length && pattern.charAt(i+1) == ']')
          {
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
    while (i+1 < pattern.length && !modifiersDone)
    {
      switch (pattern.charAt(i+1))
      {
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
          if (!pattern.charAt(i).match(/\d/) && limit > 0)
          {
            FireTitleManager.addError(optOpt,
                "Multiple number modifiers at char" +
                (i+1));
          }
          ++i;
          var beginNumber = i;
          while (i+1 < pattern.length && pattern.charAt(i+1).match(/\d/))
          {
            i++;
          }
          limit = parseInt(pattern.substring(beginNumber, i+1));
          break;
        default:
          modifiersDone = true;
          break;
      }
    }

    if (bang && !match)
    {
      match = defValue;
    }
    if (match)
    {
      if (!first)
      {
        title += separator;
      } else {
        first = false;
      }
      if (limit > 0 && match != null)
      {
        match = match.substring(0, limit);
      }
      title += match;
    }
  }
  return title;
}
