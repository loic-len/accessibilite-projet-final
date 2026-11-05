import { useEffect, useId, useRef, useState } from "react";
import { readRequest, requestOptions, type RequestDialogProps, type RequestErrors } from "../requests";

export default function QuestionDialog({ workshop, onClose, onSubmit }: RequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<RequestErrors>({});

  const baseId = useId();
  const titleId = `${baseId}-title`;
  const choiceId = `${baseId}-choice`;
  const contactId = `${baseId}-contact`;
  const contactHelpId = `${baseId}-contact-help`;
  const messageId = `${baseId}-message`;
  const errorId = (field: "choice" | "contact" | "message") => `${baseId}-${field}-error`;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = () => onClose();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { values, errors: nextErrors } = readRequest(event.currentTarget, "question", workshop.id);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    setErrors({});
    onSubmit(values);
  };

  const describedBy = (field: "choice" | "contact" | "message", ...extra: string[]) => {
    const ids = [...extra];
    if (errors[field]) ids.push(errorId(field));
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  const errorEntries = (["choice", "contact", "message"] as const)
    .filter(field => errors[field])
    .map(field => ({ field, message: errors[field]!, target: { choice: choiceId, contact: contactId, message: messageId }[field] }));

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} onClose={handleClose} className="question-dialog">
      <div className="dialog-heading">
        <h2 id={titleId}>Poser une question</h2>
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Fermer la fenêtre">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <p className="dialog-context">À propos de l’atelier « {workshop.title} »</p>

      {errorEntries.length > 0 && (
        <div className="error-summary" ref={errorSummaryRef} tabIndex={-1} role="group" aria-labelledby={`${baseId}-error-title`}>
          <h3 id={`${baseId}-error-title`}>Votre demande n’a pas pu être envoyée</h3>
          <ul>
            {errorEntries.map(entry => (
              <li key={entry.field}>
                <a href={`#${entry.target}`}>{entry.message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={choiceId}>Sujet de votre question</label>
          <select
            id={choiceId}
            name="choice"
            defaultValue=""
            required
            aria-invalid={errors.choice ? true : undefined}
            aria-describedby={describedBy("choice")}
          >
            <option value="" disabled>Choisissez un sujet</option>
            {requestOptions.question.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.choice && <p className="field-error" id={errorId("choice")}>{errors.choice}</p>}
        </div>

        <div className="field">
          <label htmlFor={contactId}>Adresse électronique</label>
          <p className="field-help" id={contactHelpId}>Format attendu : nom@exemple.fr. Utilisez une adresse fictive.</p>
          <input
            id={contactId}
            name="contact"
            type="email"
            required
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={describedBy("contact", contactHelpId)}
          />
          {errors.contact && <p className="field-error" id={errorId("contact")}>{errors.contact}</p>}
        </div>

        <div className="field">
          <label htmlFor={messageId}>Votre question</label>
          <textarea
            id={messageId}
            name="message"
            required
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy("message")}
          />
          {errors.message && <p className="field-error" id={errorId("message")}>{errors.message}</p>}
        </div>

        <div className="dialog-actions">
          <button type="submit" className="reserve-button">Envoyer la question</button>
          <button type="button" className="ghost-button" onClick={onClose}>Annuler</button>
        </div>
      </form>
    </dialog>
  );
}
