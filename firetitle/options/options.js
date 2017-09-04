var win = null;
browser.windows.getCurrent().then((w) => win = w);

/* Update title for every windows */
function updateAllTitles()
{
  function propagate(tabs)
  {
    for(let tab of tabs)
      browser.runtime.sendMessage({
        message: "update-tab",
        tabId: tab.id
      });
  }
  browser.tabs.query({active: true}).then(propagate, onError);
}

/* Save options to storage and updateAllTitles */
function saveOptions()
{
  document.querySelector("form").preventDefault();
  var prop_set =
    {
      def_win_name: document.querySelector("#def_win_name").value,
      def_win_pattern: document.querySelector("#def_win_pattern").value,
      separator: document.querySelector("#separator").value,
    };
  prop_set["win"+win.id+"_name"] = document.querySelector("#cur_win_name").value;
  prop_set["win"+win.id+"_pattern"] = document.querySelector("#cur_win_pattern").value;
  browser.storage.local.set(prop_set).then(updateAllTitles);
}

/* Set default pattern to all windows, save it, update options and updateAllTitles */
function applyDefaultToAll()
{
  document.querySelector("form").preventDefault();
  function reallyApply(wins)
  {
    var prop_set =
      {
        def_win_name: document.querySelector("#def_win_name").value,
        def_win_pattern: document.querySelector("#def_win_pattern").value,
        separator: document.querySelector("#separator").value,
      };
    for(win of wins)
    {
      prop_set["win"+win.id+"_name"] = document.querySelector("#def_win_name").value;
      prop_set["win"+win.id+"_pattern"] = document.querySelector("#def_win_pattern").value;
    }
    browser.storage.local.set(prop_set).then(() => {
      restoreOptions();
      updateAllTitles();
    });
  }
  var get_wins = browser.windows.getAll({windowTypes: ["normal"]});
  get_wins.then(reallyApply);
}

/* Update previews fields from form data */
function do_previews()
{
  function reallyPreview(info)
  {
    var def_win_name = document.querySelector("#def_win_name");
    var def_win_pattern = document.querySelector("#def_win_pattern");
    var separator = document.querySelector("#separator");
    var cur_win_name = document.querySelector("#cur_win_name");
    var cur_win_pattern = document.querySelector("#cur_win_pattern");
    var preview_cur = computeTitle(cur_win_pattern.value, separator.value, cur_win_name.value, "Hello world!", info);
    var preview_def = computeTitle(def_win_pattern.value, separator.value, def_win_name.value, "Hello world!", info);
    document.querySelector("#cur_win_preview").value=preview_cur;
    document.querySelector("#def_win_preview").value=preview_def;
    document.querySelector("#cur_win_preview").title=preview_cur;
    document.querySelector("#def_win_preview").title=preview_def;
  }

  browser.runtime.getBrowserInfo().then(reallyPreview,onError);
}

/* Update form status (do_previews, copy valies, disable fields) */
function updateForm()
{
  do_previews();
  var use_cur_as_def  = document.querySelector("#cur_win_pattern_as_def");
  var cur_win_name    = document.querySelector("#cur_win_name");
  var cur_win_pattern = document.querySelector("#cur_win_pattern");
  var def_win_name    = document.querySelector("#def_win_name");
  var def_win_pattern = document.querySelector("#def_win_pattern");
  if(use_cur_as_def.checked)
  {
    def_win_name.disabled=true;
    def_win_pattern.disabled=true;
    def_win_name.value=cur_win_name.value;
    def_win_pattern.value=cur_win_pattern.value;
  }
  else
  {
    def_win_name.disabled=false;
    def_win_pattern.disabled=false;
  }
}

/* Get options from storage and fill form accordingly */
function restoreOptions()
{
  function fillForm(result)
  {
    document.querySelector("#def_win_name").value = result.def_win_name || "Blah_name";
    document.querySelector("#def_win_pattern").value = result.def_win_pattern || "ntm";
    document.querySelector("#separator").value = result.separator || " - ";
    document.querySelector("#cur_win_name").value = result["win"+win.id+"_name"] || document.querySelector("#def_win_name").value;
    document.querySelector("#cur_win_pattern").value = result["win"+win.id+"_pattern"] || document.querySelector("#def_win_pattern").value;
    updateForm();
  }

  var getting = browser.storage.local.get();
  getting.then(fillForm, onError);
}

/* Update form dynamically */
document.addEventListener("input", updateForm);

/* Load form at begining */
document.addEventListener("DOMContentLoaded", restoreOptions);

/* Form actions */
document.querySelector("#save-button").addEventListener("click", saveOptions);
document.querySelector("#apply-to-older").addEventListener("click", applyDefaultToAll);

/*
function test()
{
  function propagate(tabs)
  {
    for(let tab of tabs)
    {
      browser.tabs.sendMessage(tab.id, {
        message: "giveTitle"
      });
    }
  }
  browser.tabs.query({active: true}).then(propagate);

}
document.querySelector("#test-button").addEventListener("click", test);
*/
