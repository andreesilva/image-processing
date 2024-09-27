import * as sharp from 'sharp';

export class Sharp {
  fail() {
    return sharp({ failOn: 'none' });
  }

  convertToPng(sharpStream, newNameImageOriginal) {
    const response = sharpStream
      .clone()
      .png({ quality: 85 })
      .toFile('pictures_resized/' + newNameImageOriginal);
    return response;
  }

  convertToJpg(sharpStream, newNameImageOriginal) {
    const response = sharpStream
      .clone()
      .jpeg({ quality: 85 })
      .toFile('pictures_resized/' + newNameImageOriginal);
    return response;
  }

  convertToWebp(sharpStream, newNameImageOriginal) {
    const response = sharpStream
      .clone()
      .webp({ quality: 85 })
      .toFile('pictures_resized/' + newNameImageOriginal);
    return response;
  }

  convertAndRezizeToJpg(
    sharpStream,
    quality,
    grayscale,
    resize,
    referenceImage,
  ) {
    const response = sharpStream
      .clone()
      .jpeg({ quality: quality })
      .grayscale(grayscale)
      .resize(resize)
      .toFile('pictures_resized/' + referenceImage);

    return response;
  }

  convertAndRezizeToPng(
    sharpStream,
    quality,
    grayscale,
    resize,
    referenceImage,
  ) {
    const response = sharpStream
      .clone()
      .png({ quality: quality })
      .grayscale(grayscale)
      .resize(resize)
      .toFile('pictures_resized/' + referenceImage);
    return response;
  }

  convertAndRezizeToWebp(
    sharpStream,
    quality,
    grayscale,
    resize,
    referenceImage,
  ) {
    const response = sharpStream
      .clone()
      .webp({ quality: quality })
      .grayscale(grayscale)
      .resize(resize)
      .toFile('pictures_resized/' + referenceImage);

    return response;
  }
}
