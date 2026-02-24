type PasswordResetTemplateParams = {
  appName: string;
  resetUrl: string;
  supportEmail?: string;
};

export const passwordResetTemplate = ({
  appName,
  resetUrl,
  supportEmail,
}: PasswordResetTemplateParams) => {
  const contactLine = supportEmail
    ? `Si vous n'êtes pas à l'origine de cette demande, contactez-nous : ${supportEmail}.`
    : `Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`;

  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">Réinitialisation de mot de passe</h2>
      <p style="margin: 0 0 12px;">
        Une demande de réinitialisation a été effectuée pour votre compte ${appName}.
      </p>
      <p style="margin: 0 0 16px;">
        <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 700;">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p style="margin: 0 0 12px; font-size: 13px; color: #475569;">
        Ou copiez-collez ce lien :<br />
        <span style="word-break: break-all;">${resetUrl}</span>
      </p>
      <p style="margin: 18px 0 0; font-size: 13px; color: #475569;">
        ${contactLine}
      </p>
    </div>
  `;
};
