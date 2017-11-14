// Tools for preloading things
/* @flow */

import {FileSystem} from 'expo';

import type {ImageUrl} from '../flow/types';

export const preloadGif = async (image: ImageUrl): Promise<string> => {
  // Preload a gif or video.
  // Follows https://github.com/expo/expo-sdk/blob/master/src/Asset.js#L118-L126
  if (image.prefetched && image.localUri) {
    return image.localUri;
  }

  const fileExt = image.url.split('.').pop();
  if (fileExt === image.url) {
    // If there is no extension, it will just error.
    throw new Error('Error preloading Gif: No file extension.')
  }

  const fileName = `${FileSystem.cacheDirectory}MRW-Gif-${image.id}.${fileExt}`;
  console.log(`Downloading ${image.url} as ${fileName}`);
  let uri;
  try {
    ({uri} = await FileSystem.downloadAsync(
      image.url,
      fileName,
      {md5: false}
    ));
  } catch (e) {
    console.log(`Error downloading ${image.url}`);
    throw e;
  }
  return uri;
};
