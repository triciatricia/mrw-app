// Tools for preloading things
/* @flow */

import {FileSystem} from 'expo';

import type {ImageUrl} from '../flow/types';

export const preloadGif = async (
  image: ImageUrl,
  gameID: number,
  addToImageCache: (id: number, url: string) => void,
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

  const fileName = `${FileSystem.cacheDirectory}MRW-Gif-${gameID}-${image.id}.${fileExt}`;
  const info = await FileSystem.getInfoAsync(fileName, {md5: false});
  if (info.exists) {
    // Already downloaded
    console.log(`Already downloaded ${image.url}`);
    return fileName;
  }

  console.log(`Downloading ${image.url} as ${fileName}`);

  const downloadResumable = FileSystem.createDownloadResumable(
    image.url,
    fileName,
    {md5: false},
    callback
  );

  processDownloadRef(downloadResumable);

  try {

    const downloadResult = (await downloadResumable.downloadAsync());
    if (downloadResult) {
      addToImageCache(image.id, downloadResult.uri);
      return downloadResult.uri;
    }
    console.log(`Download of ${image.url} was disrupted.`);
    return '';

  } catch (e) {
    console.log(`Error downloading ${image.url}`);
    throw e;
  }
};

/**
 * Delete the folder containing gifs if it exists.
 */
export const deleteGifCache = async (files: Array<string>) => {
  // Don't throw an error if the folder does not exist.
  console.log(`Deleting mp4 gif cache`);
  await Promise.all(files.map((file) => {
    return FileSystem.deleteAsync(file, {idempotent: true});
  }));
};
