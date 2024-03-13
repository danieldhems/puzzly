export default async function loadAssets(
  assets: Array<HTMLImageElement | HTMLAudioElement>
) {
  let promises = [];
  for (let i = 0, l = assets.length; i < l; i++) {
    promises.push(
      this.loadAsset(assets[i]).then(
        (assetData: HTMLImageElement | HTMLAudioElement) =>
          this.loadedAssets.push(assetData)
      )
    );
  }

  return Promise.all(promises);
}
