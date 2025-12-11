import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(request: Request) {
  try {
    const { email, projectName, senderName, link } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      console.log("Mock Email Sent:", { email, projectName, link });
      return Response.json({ success: true, mock: true });
    }

    const { data, error } = await resend.emails.send({
      from: 'Loophole <invites@loophole.run>',
      to: [email],
      subject: `${senderName} invited you to view ${projectName}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
            <h2>Project Invitation</h2>
            <p><strong>${senderName}</strong> has shared a Loophole project with you: <strong>${projectName}</strong></p>
            <p>You can access it here:</p>
            <p><a href="${link}" style="color: #10B981; text-decoration: none; font-weight: bold;">View Project</a></p>
            <hr />
            <p style="font-size: 12px; color: #666;">Powered by Loophole</p>
        </div>
      `,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
