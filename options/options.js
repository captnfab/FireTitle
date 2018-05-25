/* Update form dynamically on change */
document.addEventListener("input", updatePreview);
document.addEventListener("input", saveDefaultOptions);
document.addEventListener("input", updateAllWindowsTitles);

/* Fill form */
document.addEventListener("DOMContentLoaded", fillFormWithDefaultOptions);

/* Form actions */
document.getElementById("apply-default-pattern-to-others").addEventListener("click", setDefPatternForOthers);
