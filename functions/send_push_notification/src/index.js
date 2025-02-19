const sdk = require("node-appwrite");

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200
  
  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function (req, res) {
  const client = new sdk.Client();
  const database = new sdk.Databases(client);

  // Appwrite credentials
  client
    .setEndpoint(req.variables["APPWRITE_FUNCTION_ENDPOINT"])
    .setProject(req.variables["APPWRITE_FUNCTION_PROJECT_ID"])
    .setKey(req.variables["APPWRITE_FUNCTION_API_KEY"]);

  try {
    const { userIds, title, body } = JSON.parse(req.payload);

    // Get tokens for users
    const tokens = await database.listDocuments(
      req.variables["APPWRITE_FUNCTION_DATABASE_ID"],
      "push_tokens",
      [sdk.Query.equal("userId", userIds)]
    );

    if (tokens.documents.length === 0) {
      return res.json({
        success: false,
        message: "No tokens found for users",
      });
    }

    // Send notifications
    const promises = tokens.documents.map(async (doc) => {
      try {
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: doc.token,
            sound: "default",
            title,
            body,
            data: { type: "appointment" },
          }),
        });
      } catch (error) {
        console.error(
          `Failed to send notification to token: ${doc.token}`,
          error
        );
      }
    });

    await Promise.all(promises);

    return res.json({
      success: true,
      message: "Notifications sent successfully",
    });
  } catch (error) {
    return res.json(
      {
        success: false,
        message: error.message,
      },
      500
    );
  }
};
