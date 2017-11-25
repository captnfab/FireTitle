/* Update title dynamically on change */
document.addEventListener("input", saveCurrentWinOptionsAndRefresh);

/* Fill form */
document.addEventListener("DOMContentLoaded", fillFormWithCurWinSessionOptions);

/* Form actions */
document.querySelector("#set-pattern-as-default").addEventListener("click", setCurPatternAsDefault);
document.querySelector("#apply-pattern-to-others").addEventListener("click", setCurPatternForOthers);
