// @flow
// Functions for getting user permissions.

import { Permissions, Notifications } from 'expo';

export const registerPushNotificationsAsync = async (): Promise<?string> => {
  // Register for push notifications and/or return a token if permission is granted.
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    console.log('Request to send notifications not granted.');
    return;
  }

  // Get the token that uniquely identifies this device
  let token = await Notifications.getExpoPushTokenAsync();
  console.log('Push token from getExpoPushTokenAsync: ' + token);
  return token;

};
