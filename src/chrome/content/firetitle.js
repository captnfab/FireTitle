/*
 * Copyright 2011-2012 Fabien Givors (fabien.givors@chezlefab.net)
 * Copyright 2008 Jonathan Nowitz (jonathannowitz@gmail.com)
 * Copyright 2005 Jonathan Nowitz (jonathannowitz@gmail.com) and Google, Inc.
 * Contributors:
 *    Mozilla.org
 *    Pierre Chanial
 *    Ryan Bloomfield
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
  // Session object that stores name in session manager
  var sessionStore = Components.classes["@mozilla.org/browser/sessionstore;1"]
    .getService(Components.interfaces.nsISessionStore);

  var observerService = Components.classes["@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(this, "firetitle.sync-to-pattern", false);

  // Handle plugin configuration
  var prefs = Components.classes["@mozilla.org/preferences;1"]
    .getService(Components.interfaces.nsIPrefBranch);


  // Set default Name to preferences
  this.setDefaultName = function(name)
  {
    prefs.setCharPref("firetitle.name.default", name);
  };
  // Get default Name from preferences
  this.getDefaultName = function()
  {
    var defaultName;
    if (prefs.prefHasUserValue("firetitle.name.default"))
    {
      defaultName = prefs.getCharPref("firetitle.name.default");
    }
    else
    {
      defaultName = "";
    }
    return defaultName;
  };

  // Set default Pattern to preferences
  this.setDefaultPattern = function(pattern)
  {
    if (!prefs)
    {
      alert("null preferences object");
      return;
    }
    prefs.setCharPref("firetitle.pattern.default", pattern);
  };
  // Get default Pattern from preferences
  this.getDefaultPattern = function()
  {
    var defaultPattern;
    if (prefs.prefHasUserValue("firetitle.pattern.default"))
    {
      defaultPattern = prefs.getCharPref("firetitle.pattern.default");
    }
    else
    {
      defaultPattern = "ntm";
    }
    return defaultPattern;
  };


  // Set Name to window's session if not null
  this.setName = function(name)
  {
    sessionStore.setWindowValue(window, "ftlWinName", name);
  };
  // Get Name from window's session (or default to getDefaultName())
  this.getName = function()
  {
    var name;
    name = sessionStore.getWindowValue(window, "ftlWinName");

    if(!name)
    {
      name = this.getDefaultName();
    }
    return name;
  };

  // Get Document Title from content
  this.getDocumentTitle = function(content)
  {
    return content.contentDocument.title;
  };

  // Get Modifier from content
  this.getModifier = function(content)
  {
    return content.ownerDocument.documentElement.getAttribute("titlemodifier");
  }

  // Set Pattern to window's session
  this.setPattern = function(pattern)
  {
    sessionStore.setWindowValue(window, "ftlWinPatt", pattern);
  };
  // Get Pattern from window's session (or default getDefaultPattern())
  this.getPattern = function()
  {
    var pattern;
    pattern = sessionStore.getWindowValue(window, "ftlWinPatt");

    if(!pattern)
    {
      pattern = this.getDefaultPattern();
    }
    return pattern;

  };



  this.computeTitleFromPattern = function(pattern, name, content)
  {
    var title = "";
    var separator = " - ";//FireTitleManager.getSeparator(content);


    for (var i = 0; i < pattern.length; i++)
    {
      var match = null;
      // If an integer prefix is found, the next string is truncated in length
      // at this value.
      var limiter = 0;
      switch(pattern.charAt(i))
      {
        case 'n':
          // Name
          match = name;
          break;
        case 't':
          // Title
          match = this.getDocumentTitle(content);
          break;
        case 'm':
          // Modifier
          match = this.getModifier(content);
          break;
          // Text inside [ ] is copied. ] is escaped with ]]
        case '[':
          var i0 = ++i;
          var i1 = 0;
          while(i < pattern.length && !i1)
          {
            if(pattern.charAt(i) == ']')
            {
              if(pattern.length >= i && pattern.charAt(i+1) == ']')
                i++
              else
                i1 = --i;
            }
            i++;
          }
          if(!i1) i1 = i -1;
          match = pattern.substr(i0, (i1-i0+1))
          break;
        default:
          match = "";
      }
      while((i + 1 < pattern.length) && (pattern.charAt(i+1) >= '0') && (pattern.charAt(i+1) <= '9'))
      {
        limiter = 10 * limiter + (pattern.charAt(i+1) - '0');
        i++;
      }
      if(limiter)
      {
        match = match.substr(0, limiter);
      }
      title = title ? title + separator + match : match
    }
    return title;
  };

  this.computeTitle = function(content)
  {
    return this.computeTitleFromPattern(this.getPattern(), this.getName(), content);
  };

  this.update = function(name, pattern, makeDefaultName, makeDefaultPattern, globalPattern)
  {
    this.setPattern(pattern);
    this.setName(name);

    if (makeDefaultName)
    {
      this.setDefaultName(name);
    }
    if (makeDefaultPattern)
    {
      this.setDefaultPattern(pattern);
    }
    if (globalPattern)
    {
      observerService.notifyObservers(null, "firetitle.sync-to-pattern", pattern);
    }
    FireTitleManager_setTitle();
  };

  // Listen to topic "firetitle.sync-to-pattern" for global changes
  this.observe = function(subject, topic, data)
  {
    if (topic == "firetitle.sync-to-pattern")
    {
      this.setPattern(data);
      FireTitleManager_setTitle();
    }
  }

  var ftm = this;

  document.getElementById("content").updateTitlebar =
    function()
    {
      document.title = ftm.computeTitle(this);
    };

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


// vim:set nospell tw=80 foldmethod=marker foldmarker={,}:
