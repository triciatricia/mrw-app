// Tools for preloading things
/* @flow */

import {FileSystem} from 'expo';

import type {ImageUrl} from '../flow/types';

export const preloadGif = async (
  image: ImageUrl,
  callback: (
    {totalBytesWritten: number, totalBytesExpectedToWrite: number}
  ) => void,
  processDownloadRef: (downloadResumable: FileSystem.DownloadResumable) => void
): Promise<string> => {
  // Preload a gif or video.
  // The download data can be accessed using the callback.
  // The processDownloadRef callback returns a DownloadResumable so you
  // can pause or resume the download. 
  // https://docs.expo.io/versions/latest/sdk/filesystem.html
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

  const downloadResumable = FileSystem.createDownloadResumable(
    image.url,
    fileName,
    {},
    callback
  );

  processDownloadRef(downloadResumable);

  let uri;
  try {

    const downloadResult = (await downloadResumable.downloadAsync());
    if (downloadResult) {
      uri = downloadResult.uri;
      return uri;
    }
    console.log(`Download of ${image.url} was disrupted.`);
    return '';

  } catch (e) {
    console.log(`Error downloading ${image.url}`);
    throw e;
  }
};
