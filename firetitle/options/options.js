/* Update form dynamically on change */
document.addEventListener("input", updatePreview);
document.addEventListener("input", saveDefaultOptions);

/* Fill form */
document.addEventListener("DOMContentLoaded", fillFormWithDefaultOptions);

/* Form actions */
document.querySelector("#apply-default-pattern-to-others").addEventListener("click", setDefPatternForOthers);
