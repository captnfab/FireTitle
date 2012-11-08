/*
 * Copyright 2011-2012 Fabien Givors (fabien.givors@chezlefab.net)
 * Copyright 2008 Jonathan Nowitz (jonathannowitz@gmail.com)
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

function FireTitleRename_onLoad()
{
  if (window.opener.FIRETITLE_manager)
  {
    this.ftOpener = window.opener;
    this.ftManager = window.opener.FIRETITLE_manager;
  }
  else
  {
    try
    {
      var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);
    }
    catch (e)
    {

    }

    if (windowMediator)
    {
      var browser = windowMediator.getMostRecentWindow("navigator:browser");
      if (browser && browser.FIRETITLE_manager)
      {
        this.ftOpener = browser;
        this.ftManager = browser.FIRETITLE_manager;
      }
    }
  }

  var nameBox = document.getElementById("FireTitleRenameName");
  var name = this.ftManager.getName();
  nameBox.value = name;

  var patternBox= document.getElementById("FireTitleOptionsRenamePattern");
  var pattern = this.ftManager.getPattern();
  patternBox.value = pattern;

  FireTitleRename_doPreview(window.ftOpener, window.ftManager);
}

// Compute preview
function FireTitleRename_doPreview(op, man)
{
  var content = op.document.getElementById("content");
  var name = document.getElementById("FireTitleRenameName").value;
  var pattern = document.getElementById("FireTitleOptionsRenamePattern").value;

  var preview = man.computeTitleFromPattern(pattern, name, content);
  document.getElementById("FireTitleNamePreview").value = preview;

}


// Update preview
function FireTitleRename_onKeypress(event)
{
  window.setTimeout(
      function()
      {
        FireTitleRename_doPreview(window.ftOpener, window.ftManager);
      },
      0);
}


// Update window's parameter when clicking on Ok
function FireTitleRename_onAccept()
{
  var name = document.getElementById("FireTitleRenameName").value;
  var pattern = document.getElementById("FireTitleOptionsRenamePattern").value;
  var defname = document.getElementById("FireTitleOptionsRenameDefaultName").checked;
  var defpattern = document.getElementById("FireTitleOptionsRenameDefaultPattern").checked;
  var globalpattern = document.getElementById("FireTitleOptionsRenameGlobalPattern").checked;

  this.ftManager.update(name, pattern, defname, defpattern, globalpattern);
}

function FireTitleRename_onHelp()
{

  this.ftOpener.open("chrome://firetitle/locale/help.html", "FireTitleHelp");
  return true;

}

// vim:set nospell tw=80 foldmethod=marker foldmarker={,}:
