/* updateAllWindowsTitles
 * Takes no argument
 * Send a message to every active tabs so that they update their respective window
 * Returns a promise that all messages have been sent
 */
function updateAllWindowsTitles()
{
  function propagate(tabs)
  {
    var pAMsg = [];
    for(let tab of tabs)
      pAMsg.push(browser.runtime.sendMessage({
        message: "update-tab",
        tabId: tab.id
      }));
    Promise.all(pAMsg);
  }
  return browser.tabs.query({active: true}).then(propagate);
}

/* saveCurrentWinOptions
 * Takes no argument but read the form
 * Saves windows options to session
 * Returns a promise that the options have been saved
 */
function saveCurrentWinOptions()
{
  const cur_win_name = document.querySelector("#cur_win_name").value;
  const cur_win_pattern = document.querySelector("#cur_win_pattern").value;
  let pWin = browser.windows.getCurrent();
  let pSaveSession = pWin.then((win) => saveWindowOptionsToSession(win.id, cur_win_name, cur_win_pattern));
  let pDone = Promise.all([pWin,pSaveSession]);
  return pDone;
}

/* saveCurrentWinOptionsAndRefresh
 * Takes no argument but read the form
 * Saves windows options to session and refreshWinTitleOfTab for current tab
 * Returns a promise that the options have been saved nd window refreshed
 */
function saveCurrentWinOptionsAndRefresh()
{
  function propagate(tabs)
  {
    var pAMsg = [];
    for(let tab of tabs)
      pAMsg.push(browser.runtime.sendMessage({
        message: "update-tab",
        tabId: tab.id
      }));
    Promise.all(pAMsg);
  }
  let pSaveCurrentWinOptions = saveCurrentWinOptions();
  let pTabs = pSaveCurrentWinOptions.then((win) => browser.tabs.query({active: true, windowId: win.id}));
  let pDone =  pTabs.then(propagate);
  return pDone;
}

/* saveDefaultOptions
 * Takes no argument but read the form
 * Saves default options to storage
 */
function saveDefaultOptions()
{
  const prop_set =
    {
      cur_pro_name: document.querySelector("#cur_pro_name").value,
      def_win_name: document.querySelector("#def_win_name").value,
      def_win_pattern: document.querySelector("#def_win_pattern").value,
      separator: document.querySelector("#separator").value,
    };
  let pSaveOptions = browser.storage.local.set(prop_set);
  return pSaveOptions;
}

/* setCurPatternAsDefault
 * Takes no argument but read the form
 * Saves default options to storage
 */
function setCurPatternAsDefault()
{
  const prop_set =
    {
      def_win_pattern: document.querySelector("#cur_win_pattern").value,
    };
  let pSaveOptions = browser.storage.local.set(prop_set);
  return pSaveOptions;
}


/* saveOptions
 * Takes no argument but read the form
 * Saves default options to storage, windows options to session and updateAllWindowsTitles
 * Returns a promise that the options have been saved
 */
function saveOptions()
{
  let pSaveOptions = saveDefaultOptions();
  let pSaveSession = saveCurrentWinOptions();
  let pDone = Promise.all([pSaveSession,pSaveOptions]).then(updateAllWindowsTitles);
  return pDone;
}

/* setDefPatternForOthers
 * Apply default window's pattern to every other opened windows
 * Returns a promise it has been done
 */
function setDefPatternForOthers()
{
  const def_win_pattern = document.querySelector("#def_win_pattern").value;

  let pWins =  browser.windows.getAll({windowTypes: ["normal"]});
  let pApply = pWins.then((wins) => {
    for(win of wins) saveWindowOptionsToSession(win.id, undefined, def_win_pattern);
  });
  let pDone = pApply.then(updateAllWindowsTitles);
  return pDone;
}

/* setCurPatternForOthers
 * Apply current window's pattern to every other opened windows
 * Returns a promise it has been done
 */
function setCurPatternForOthers()
{
  const cur_win_pattern = document.querySelector("#cur_win_pattern").value;

  let pWins =  browser.windows.getAll({windowTypes: ["normal"]});
  let pApply = pWins.then((wins) => {
    for(win of wins) saveWindowOptionsToSession(win.id, undefined, cur_win_pattern);
  });
  let pDone = pApply.then(updateAllWindowsTitles);
  return pDone;
}

/* Update form status (do_previews, copy valies, disable fields) */
function updatePreview()
{
  let pBrowserInfo = browser.runtime.getBrowserInfo();
  let pDone = pBrowserInfo.then((info) =>
    {
      var cur_pro_name = document.querySelector("#cur_pro_name");
      var def_win_name = document.querySelector("#def_win_name");
      var def_win_pattern = document.querySelector("#def_win_pattern");
      var separator = document.querySelector("#separator");
      var preview_def = computeTitle(def_win_pattern.value, separator.value, def_win_name.value, cur_pro_name.value, "Hello world!", "nbtab", info, 0);
      document.querySelector("#def_win_preview").value=preview_def;
      document.querySelector("#def_win_preview").title=preview_def;
    }
  );
  return pDone;
}

/* fillFormWithCurWinSessionOptions
 * Takes no argument
 * Fill form with current windows sessions options
 * Returns a promise the form has been filled
 */
function fillFormWithCurWinSessionOptions()
{
  let pWin = browser.windows.getCurrent();
  let pLocalStor = browser.storage.local.get();
  let pSessionWin = pWin.then((win) => loadWindowOptionsFromSession(win.id));

  let pFillCurWin = Promise.all([pSessionWin,pLocalStor]).then(([[name,pattern],localStor]) =>
    {
      document.querySelector("#cur_win_name").value = name  !== undefined ? name : (localStor.def_win_name !== undefined ? localStor.def_win_name : default_options["win_name"]);
      document.querySelector("#cur_win_pattern").value = pattern !== undefined ?  pattern : (localStor.def_win_pattern !== undefined ? localStor.def_win_pattern : default_options["win_patt"]);
    });

  return pFillCurWin;
}

/* fillFormWithDefaultOptions
 * Takes no argument
 * Fill form with current windows sessions options
 * Returns a promise the form has been filled
 */
function fillFormWithDefaultOptions()
{
  let pWin = browser.windows.getCurrent();
  let pLocalStor = browser.storage.local.get();
  let pSessionWin = pWin.then((win) => loadWindowOptionsFromSession(win.id));

  let pFillOptions = pLocalStor.then((localStor) =>
    {
      document.querySelector("#cur_pro_name").value = localStor.cur_pro_name || default_options["pro_name"];
      document.querySelector("#def_win_name").value = localStor.def_win_name || default_options["win_name"];
      document.querySelector("#def_win_pattern").value = localStor.def_win_pattern || default_options["win_patt"];
      document.querySelector("#separator").value = localStor.separator || default_options["sep"];
    });

  return pFillOptions.then(updatePreview);
}
