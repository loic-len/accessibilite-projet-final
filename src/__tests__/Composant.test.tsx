import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";

afterEach(cleanup);

describe("Question à l’organisateur", () => {
  it("conserve le sujet et la question après un envoi sans email, puis confirme le bon atelier et le bon sujet après correction", async () => {
    const user = userEvent.setup();
    render(<App />);

    const card = screen.getByRole("article", { name: /Une tasse en céramique/i });
    await user.click(within(card).getByRole("button", { name: /poser une question/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: /sujet/i }),
      "Le matériel à apporter",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: /question/i }),
      "Faut-il apporter un tablier ?",
    );

    await user.click(within(dialog).getByRole("button", { name: /envoyer/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(within(dialog).getAllByText(/Saisissez une adresse électronique/i).length).toBeGreaterThan(0);
    expect(
      (within(dialog).getByRole("combobox", { name: /sujet/i }) as HTMLSelectElement).value,
    ).toBe("materiel");
    expect(
      (within(dialog).getByRole("textbox", { name: /question/i }) as HTMLTextAreaElement).value,
    ).toBe("Faut-il apporter un tablier ?");
    expect(screen.queryByRole("status", { name: /confirmation/i })).not.toHaveTextContent(/transmise|envoyée|enregistrée/i);

    await user.type(
      within(dialog).getByRole("textbox", { name: /^adresse électronique$/i }),
      "etudiant@exemple.fr",
    );
    await user.click(within(dialog).getByRole("button", { name: /envoyer/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const confirmation = screen.getByRole("status", { name: /confirmation/i });
    expect(confirmation).toHaveTextContent(/Une tasse en céramique/i);
    expect(confirmation).toHaveTextContent(/Le matériel à apporter/i);
  });
});
