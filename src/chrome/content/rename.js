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
  if (window.opener.FireTitle)
  {
    this.ftOpener = window.opener;
    this.ftManager = window.opener.FireTitle;
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
      if (browser && browser.FireTitle)
      {
        this.ftOpener = browser;
        this.ftManager = browser.FireTitle;
      }
    }
  }

  var sepBox = document.getElementById("FireTitleOptMiscSeparator");
  var sep = this.ftManager.getDefaultSeparator();
  sepBox.value = sep;

  var curnameBox = document.getElementById("FireTitleOptWinCurName");
  var curname = this.ftManager.getName();
  curnameBox.value = curname;

  var curpatternBox= document.getElementById("FireTitleOptWinCurPattern");
  var curpattern = this.ftManager.getPattern();
  curpatternBox.value = curpattern;

  var newnameBox = document.getElementById("FireTitleOptWinNewName");
  var newname = this.ftManager.getDefaultName();
  newnameBox.value = newname;

  var newpattern = this.ftManager.getDefaultPattern();
  var newsamepatBox= document.getElementById("FireTitleOptWinNewSamePattern");
  newsamepat = (newpattern == curpattern);
  newsamepatBox.checked = newsamepat;

  var newpatternBox= document.getElementById("FireTitleOptWinNewPattern");
  newpatternBox.value = newpattern;
  newpatternBox.readonly = newsamepat

  var applyglobal = document.getElementById("FireTitleOptApplyGlobalPattern");
  applyglobal.checked = true;
  FireTitleRename_doPreview(window.ftOpener, window.ftManager);
}

// Compute preview
function FireTitleRename_doPreview(op, man)
{
  var sep = document.getElementById("FireTitleOptMiscSeparator").value;

  var curcontent = op.document.getElementById("content");
  var curname = document.getElementById("FireTitleOptWinCurName").value;
  var curpattern = document.getElementById("FireTitleOptWinCurPattern").value;

  var newsamepat = document.getElementById("FireTitleOptWinNewSamePattern").checked;
  if(newsamepat)
  {
    document.getElementById("FireTitleOptWinNewPattern").value = curpattern;
  }
  document.getElementById("FireTitleOptWinNewPattern").readonly = newsamepat;

  var curpreview = man.computeTitleFromPattern(curpattern, curname, curcontent, sep);
  document.getElementById("FireTitlePreWinCur").value = curpreview;

  var newname = document.getElementById("FireTitleOptWinNewName").value;
  var newpattern = document.getElementById("FireTitleOptWinNewPattern").value;

  var newpreview = man.computeTitleFromPattern(newpattern, newname, curcontent, sep);
  document.getElementById("FireTitlePreWinNew").value = newpreview;
//  FireTitleRename_onAccept();
}


// Update preview
function FireTitleRename_onClick(event)
{
  window.setTimeout(
      function()
      {
        FireTitleRename_doPreview(window.ftOpener, window.ftManager);
      },
      0);
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
  var sep = document.getElementById("FireTitleOptMiscSeparator").value;

  var curname = document.getElementById("FireTitleOptWinCurName").value;
  var curpattern = document.getElementById("FireTitleOptWinCurPattern").value;

  var newname = document.getElementById("FireTitleOptWinNewName").value;
  var newpattern = document.getElementById("FireTitleOptWinNewPattern").value;

  var globalpattern = document.getElementById("FireTitleOptApplyGlobalPattern").checked;

  this.ftManager.update(sep, curname, curpattern, newname, newpattern, globalpattern);
}

function FireTitleRename_onHelp()
{

  this.ftOpener.open("chrome://firetitle/locale/help.html", "FireTitleHelp");
  return true;

}

// vim:set nospell tw=80 foldmethod=marker foldmarker={,}:
