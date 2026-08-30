import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const POSILJATELJ = "ChoreTogether <noreply@choretogether.space>";

export async function posaljiEmailZaResetLozinke(email, ime, link) {
  await resend.emails.send({
    from: POSILJATELJ,
    to: email,
    subject: "Resetiranje lozinke - ChoreTogether",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Zdravo, ${ime}!</h2>
        <p>Zatražili ste resetiranje lozinke za svoj ChoreTogether račun.</p>
        <p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#1976d2;color:#fff;text-decoration:none;border-radius:6px;">
            Postavi novu lozinku
          </a>
        </p>
        <p style="color:#888;font-size:13px;">Ova poveznica vrijedi 1 sat. Ako niste vi zatražili reset, slobodno ignorirajte ovaj email.</p>
      </div>
    `,
  });
}
