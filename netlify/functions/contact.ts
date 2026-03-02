import { Handler } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, version } = JSON.parse(event.body || "{}");

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email is required" }) };
    }

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "lakkmrinal@gmail.com",
      subject: `Portfolio Contact: ${email}`,
      html: `<strong>New message from:</strong> ${email}<br/><strong>Version:</strong> ${version}`,
    });

    if (error) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: error.name, message: error.message }) 
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", message: err.message }),
    };
  }
};