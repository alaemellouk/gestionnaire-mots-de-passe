export const EMPTY_PASSWORD_FORM = {
  site: "",
  login: "",
  password: "",
  category_id: "",
};

export default function PasswordEntryForm({
  idPrefix,
  heading,
  values,
  onFieldChange,
  onSubmit,
  onCancel,
  categories,
  policyViolations,
  onClearPolicyViolations,
  onGenerate,
  submitting,
  submitLabel,
  submittingLabel,
  passwordRequired = true,
  passwordPlaceholder,
  t,
}) {
  const errorsId = `${idPrefix}-policy-errors`;

  return (
    <form
      className={`create-password-form create-password-form--modern create-password-form--vault-expanded${
        onCancel ? " create-password-form--edit" : ""
      }`}
      onSubmit={onSubmit}
    >
      {heading ? (
        <div className="form-field form-field--full">
          <h3 className="password-form-heading">{heading}</h3>
        </div>
      ) : null}

      <div className="form-field form-field--full">
        <label htmlFor={`${idPrefix}-site`}>{t("passwords.formSite")}</label>
        <input
          id={`${idPrefix}-site`}
          className="form-input"
          placeholder={t("passwords.formSitePh")}
          value={values.site}
          onChange={(e) => onFieldChange("site", e.target.value)}
          required
          autoComplete="off"
        />
      </div>

      <div className="form-field form-field--full">
        <label htmlFor={`${idPrefix}-login`}>{t("passwords.formLogin")}</label>
        <input
          id={`${idPrefix}-login`}
          className="form-input"
          placeholder={t("passwords.formLoginPh")}
          value={values.login}
          onChange={(e) => onFieldChange("login", e.target.value)}
          required
          autoComplete="off"
        />
      </div>

      <div className="form-field form-field--full form-field--password-row">
        <label htmlFor={`${idPrefix}-password`}>{t("passwords.formPassword")}</label>
        <div className="form-inline-row">
          <input
            id={`${idPrefix}-password`}
            className="form-input form-input--grow"
            placeholder={passwordPlaceholder}
            value={values.password}
            onChange={(e) => {
              onClearPolicyViolations();
              onFieldChange("password", e.target.value);
            }}
            required={passwordRequired}
            autoComplete="new-password"
            aria-invalid={policyViolations.length > 0}
            aria-describedby={policyViolations.length > 0 ? errorsId : undefined}
          />
          <button type="button" className="btn-generate-password" onClick={onGenerate}>
            {t("passwords.generate")}
          </button>
        </div>
        {policyViolations.length > 0 && (
          <div id={errorsId} className="password-policy-errors" role="alert">
            <p className="password-policy-errors__title">{t("passwords.policyErrorTitle")}</p>
            <ul>
              {policyViolations.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="form-field form-field--full">
        <label htmlFor={`${idPrefix}-category`}>{t("passwords.formCategory")}</label>
        <select
          id={`${idPrefix}-category`}
          className="form-input form-select"
          value={values.category_id}
          onChange={(e) => onFieldChange("category_id", e.target.value)}
        >
          <option value="">{t("passwords.optional")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nom || category.name}
            </option>
          ))}
        </select>
      </div>

      <div className={`form-actions${onCancel ? " form-actions--split" : ""}`}>
        {onCancel ? (
          <button type="button" className="btn-cancel-password" onClick={onCancel}>
            {t("passwords.cancel")}
          </button>
        ) : null}
        <button type="submit" className="btn-submit-password" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
