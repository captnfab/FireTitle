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

var FireTitle =
{
  // Handle plugin configuration
  prefs: null,
  // Handle per-window prefs
  sessionStore: null,
  // Handle pattern-sync
  observerService: null,

  startup: function()
  {
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
      .getService(Components.interfaces.nsIPrefService)
      .getBranch("extensions.firetitle.");
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    this.prefs.addObserver("", this, false);

    this.sessionStore = Components.classes["@mozilla.org/browser/sessionstore;1"]
      .getService(Components.interfaces.nsISessionStore);

    this.observerService = Components.classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
    this.observerService.addObserver(this, "extensions.firetitle.sync-to-pattern", false);

    document.getElementById("content").updateTitlebar =
      function()
      {
        document.title = window.FireTitle.computeTitle(document.getElementById("content"));
      };

    document.getElementById("content").addEventListener("DOMTitleChanged", window.FireTitle.settitle(), false);
  },
  shutdown: function()
  {
    this.prefs.removeObserver("", this);
    this.observerService.removeObserver(this, "extensions.firetitle.sync-to-pattern");
  },

  settitle: function()
  {
    document.getElementById("content").updateTitlebar();
  },
  settitle2: function()
  {
    alert("hop");
  },

  // Set default Name to preferences
  setDefaultName: function(name)
  {
    this.prefs.setCharPref("extensions.firetitle.name.default", name);
  },
  // Get default Name from preferences
  getDefaultName: function()
  {
    var defaultName;
    if (this.prefs.prefHasUserValue("extensions.firetitle.name.default"))
    {
      defaultName = this.prefs.getCharPref("extensions.firetitle.name.default");
    }
    else
    {
      defaultName = "";
    }
    return defaultName;
  },

  // Set default Pattern to preferences
  setDefaultPattern: function(pattern)
  {
    if (!this.prefs)
    {
      alert("null preferences object");
      return;
    }
    this.prefs.setCharPref("extensions.firetitle.pattern.default", pattern);
  },
  // Get default Pattern from preferences
  getDefaultPattern: function()
  {
    var defaultPattern;
    if (this.prefs.prefHasUserValue("extensions.firetitle.pattern.default"))
    {
      defaultPattern = this.prefs.getCharPref("extensions.firetitle.pattern.default");
    }
    else
    {
      defaultPattern = "ntm";
    }
    return defaultPattern;
  },

  // Set default Separator to preferences
  setDefaultSeparator: function(separator)
  {
    if (!this.prefs)
    {
      alert("null preferences object");
      return;
    }
    this.prefs.setCharPref("extensions.firetitle.separator.default", separator);
  },
  // Get default Separator from preferences
  getDefaultSeparator: function()
  {
    var defaultSeparator;
    if (this.prefs.prefHasUserValue("extensions.firetitle.separator.default"))
    {
      defaultSeparator = this.prefs.getCharPref("extensions.firetitle.separator.default");
    }
    else
    {
      defaultSeparator = " | ";
    }
    return defaultSeparator;
  },

  // Set Name to window's session if not null
  setName: function(name)
  {
    this.sessionStore.setWindowValue(window, "ftlWinName", name);
  },
  // Get Name from window's session (or default to getDefaultName())
  getName: function()
  {
    var name = null;
    try
    {
      name = this.sessionStore.getWindowValue(window, "ftlWinName");
    }
    catch(e)
    {
      name = null;
    }

    if(!name)
    {
      name = this.getDefaultName();
    }
    return name;
  },

  // Get Document Title from content
  getDocumentTitle: function(content)
  {
    return content.contentDocument.title;
  },

  // Get active TabGroup's name
  getActiveGroupName: function()
  {
    var groupName = null;

    if(!window.TabView._window)
    {
      try
      {
        groupName = this.sessionStore.getWindowValue(window, "ftlWinLGrpN");
      }
      catch(e)
      {
        groupName = "";
      }
    }
    else
    {
      groupName = window.TabView._window.GroupItems._activeGroupItem.getTitle();
      this.sessionStore.setWindowValue(window, "ftlWinLGrpN", groupName);
    }

    return groupName;
  },

  // Get Modifier from content
  getModifier: function(content)
  {
    return content.ownerDocument.documentElement.getAttribute("titlemodifier");
  },

  // Set Pattern to window's session
  setPattern: function(pattern)
  {
    this.sessionStore.setWindowValue(window, "ftlWinPatt", pattern);
  },
  // Get Pattern from window's session (or default getDefaultPattern())
  getPattern: function()
  {
    var pattern = null;
    try
    {
      pattern = this.sessionStore.getWindowValue(window, "ftlWinPatt");
    }
    catch(e)
    {
      pattern = null;
    }

    if(!pattern)
    {
      pattern = this.getDefaultPattern();
    }
    return pattern;

  },


  computeTitleFromPattern: function(pattern, name, content, separator)
  {
    var title = "";


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
/*
        case 'T':
          // Number of tabs
          match = content."TODO";
          break;
*/
        case 'g':
          // Group name
          match = this.getActiveGroupName();
          if(!match) continue;
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
  },

  computeTitle: function(content)
  {
    return this.computeTitleFromPattern(this.getPattern(), this.getName(), content, this.getDefaultSeparator());
  },

  update: function(sep, name, pattern, defname, defpat)
  {
    this.setDefaultSeparator(sep);

    this.setName(name);
    this.setPattern(pattern);

    this.setDefaultName(defname);
    this.setDefaultPattern(defpat);

    this.settitle();
  },

  // Listen to topic "firetitle.sync-to-pattern" for global changes
  observe: function(subject, topic, data)
  {
    if (topic == "extensions.firetitle.sync-to-pattern")
    {
      this.setPattern(data);
      this.settitle();
    }
    else if (topic == "nsPref:changed" || topic == "extensions.firetitle.update")
    {
      this.settitle();
    }
  },

  showPrefs: function()
  {
    window.openDialog("chrome://firetitle/content/rename.xul",
        "FireTitleRename",
        "modal,centerscreen,chrome,resizable=no");
  },
}

window.addEventListener("load", function(e) { FireTitle.startup(); }, false);
window.addEventListener("unload", function(e) { FireTitle.shutdown(); }, false);


// vim:set nospell tw=80 foldmethod=marker foldmarker={,}:
