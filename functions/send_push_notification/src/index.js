const sdk = require('node-appwrite');

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

  // Appwrite credentials from environment variables
  const {
    EXPO_PUBLIC_APPWRITE_ENDPOINT,
    EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    EXPO_PUBLIC_APPWRITE_PUSH_TOKENS_COLLECTION_ID,
    EXPO_PUBLIC_APPWRITE_FUNCTION_API_KEY,
  } = process.env;

  // Validate required environment variables
  if (!EXPO_PUBLIC_APPWRITE_FUNCTION_API_KEY) {
    console.error('API Key is missing');
    return res.json(
      {
        success: false,
        message: 'API Key configuration error',
      },
      500
    );
  }

  client
    .setEndpoint(EXPO_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(EXPO_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(EXPO_PUBLIC_APPWRITE_FUNCTION_API_KEY);

  try {
    const { userIds, title, body } = JSON.parse(req.payload);

    if (!userIds || !title || !body) {
      return res.json(
        {
          success: false,
          message: 'Missing required parameters',
        },
        400
      );
    }

    // Get tokens from push_tokens collection
    const tokens = await database.listDocuments(
      EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      EXPO_PUBLIC_APPWRITE_PUSH_TOKENS_COLLECTION_ID,
      [sdk.Query.equal('userId', userIds)]
    );

    if (tokens.documents.length === 0) {
      return res.json({
        success: false,
        message: 'No tokens found for users',
      });
    }

    // Send notifications
    const notificationResults = await Promise.all(
      tokens.documents.map(async (doc) => {
        try {
          const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Accept-encoding': 'gzip, deflate',
            },
            body: JSON.stringify({
              to: doc.token,
              sound: 'default',
              title,
              body,
              data: {
                type: 'appointment',
                userId: doc.userId,
              },
              priority: 'high',
              channelId: 'default',
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Push notification sent successfully:', {
            token: doc.token,
            userId: doc.userId,
            result,
          });
          return { success: true, token: doc.token };
        } catch (error) {
          console.error('Push notification failed:', {
            token: doc.token,
            error: error.message,
          });
          return { success: false, token: doc.token, error: error.message };
        }
      })
    );

    const successCount = notificationResults.filter((r) => r.success).length;
    const failureCount = notificationResults.filter((r) => !r.success).length;

    return res.json({
      success: true,
      message: `Notifications sent: ${successCount} successful, ${failureCount} failed`,
      results: notificationResults,
    });
  } catch (error) {
    console.error('Function error:', {
      message: error.message,
      stack: error.stack,
    });

    return res.json(
      {
        success: false,
        message: error.message || 'An unknown error occurred',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      500
    );
  }
};
