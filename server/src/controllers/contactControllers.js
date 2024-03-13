const sendEmail = require("../config/nodemailer");

// Send an email to the admin
async function sendToAdminEmail (req, res) {
    try {
        const { userEmail, userMessage, userName, subject } = req.body;

        // Check if required fields are missing in the request
        if (!userName || !userEmail || !userMessage || !subject) {
            return res.status(400).json({
                successful: false,
                message: "Bad request. Name, email, subject, and message are required.",
            });
        }

        // Define email options
        const emailOptions = {
            from: `"E-commerce App" <${process.env.OAUTH_USER}>`,
            to: process.env.OAUTH_USER,
            subject: subject,
            html: `
        <h1 style="text-align: center; color: #fc9707; padding-bottom: 20px;">
          ${subject}
        </h1>

        <h2 style="color: #272727; margin: 5px 0;">Sender:</h2>
        <div>
          <p style="text-transform: capitalize; margin: 0; font-size: 16px;">
            <b style="color: #fcba1c;">Name: </b>${userName}
          </p>
          <p style="margin: 0; font-size: 16px;">
            <b style="color: #fcba1c;">Email: </b>${userEmail}
          </p>
        </div>

        <h2 style="color: #272727; margin: 5px 0;">Message:</h2>
        <div style="padding: 5px 15px; background: #00000005">
          <p style="font-size: 16px;">${userMessage}</p>
        </div>
      `,
        };

        // Send the email
        await sendEmail(emailOptions);

        // Return a success response
        return res.status(200).json({
            successful: true,
            message: "The message has been sent successfully",
        });
    } catch (err) {
        console.error(err);

        // Handle errors and return a 500 status code if something goes wrong
        return res
            .status(500)
            .json({ successful: false, message: "Something went wrong" });
    }
};


module.exports = { sendToAdminEmail };