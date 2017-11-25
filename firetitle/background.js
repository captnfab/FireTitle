/* setTitleOfWinofTab
 * Takes a shitload of parameters, one of them being the current tab
 * Computes the new title for the window containing the current tab
 * set the new title to the window
 * Returns a promise that the title has been updated
 */
function setTitleOfWinofTab(localStor, browserInfo, currentTab, currentWin, currentWinTabs, sessionWinName, sessionWinPattern)
{
  separator             = localStor.separator !==undefined?localStor.separator:default_options["sep"];
  let currentWinName    = sessionWinName    !==undefined?sessionWinName   :(localStor.def_win_name    !==undefined?localStor.def_win_name   :default_options["win_name"]);
  let currentWinPattern = sessionWinPattern !==undefined?sessionWinPattern:(localStor.def_win_pattern !==undefined?localStor.def_win_pattern:default_options["win_patt"]);
  newtitle = computeTitle(currentWinPattern, separator, currentWinName, currentTab.title, currentWinTabs.length, browserInfo);
  // XXX: Workarround for Webextension poor API
  newtitle += separator;
  var win_prop = {
    titlePreface: newtitle
  };
  debugInfo(0, "Computed title(p="+currentWinPattern+", s="+separator+", n="+currentWinName+", t="+currentTab.title+") = " + newtitle + " (Wid=" + currentTab.windowId + ")");
  return browser.windows.update(currentTab.windowId, win_prop);
}

/* actionOnMessageReceived
 * Takes a message and a sender
 * update window's title accordingly
 */
function actionOnMessageReceived(msg, sender)
{
  if(msg.message=="update")
  {
    refreshWinTitleOfTab(sender.tab.id);
  }
  else if(msg.message=="update-tab")
  {
    onError(msg.tabId);
    refreshWinTitleOfTab(msg.tabId);
  }
}

/* actionOnNewWindow
 * Takes a new window as argument
 * Set default name and pattern as sessions values
 * Update window's title
 * Returns a promise that the action is done
 */
function actionOnNewWindow(win)
{
  let pLocalStor      = browser.storage.local.get();
  let pCurrentWinTabs = browser.tabs.query({windowId: win.id, active: true});
  let pSaved          = pLocalStor.then((localStor) => { saveWindowOptionsToSession(win.id, localStor.def_win_name, localStor.def_win_pattern); });
  let pDone           = Promise.all([pCurrentWinTabs,pSaved]).then((currentWinTabs) => { refreshWinTitleOfTab(currentWinTabs[0].id) });
  return pDone;
}

/* actionOnTabChanged
 * Takes a tab id, a change object and a tab status
 * Update window's title
 */
function actionOnTabChanged(id, change, tab)
{
  function propagate(tabs)
  {
    for(let tab of tabs)
      refreshWinTitleOfTab(tab.id)
  }
  if(tab.active)
    refreshWinTitleOfTab(tab.id)
  else
    browser.tabs.query({ active: true, windowId: tab.windowId}).then(propagate,onError);
}

/* actionOnTabActivated
 * Takes an active tab info
 * Updates window's title
 */
function actionOnTabActivated(activeinfo)
{
  refreshWinTitleOfTab(activeinfo.tabId);
}

browser.runtime.onMessage.addListener(actionOnMessageReceived);
browser.windows.onCreated.addListener(actionOnNewWindow);
browser.tabs.onUpdated.addListener(actionOnTabChanged);
browser.tabs.onActivated.addListener(actionOnTabActivated);

/* TODO: close any existing options page before */
//browser.browserAction.onClicked.addListener(() => { browser.runtime.openOptionsPage() });
