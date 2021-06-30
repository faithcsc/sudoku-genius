const {
  WEBCAM_FRAME_LENGTH,
  MNIST_LEN,
  BOARD_LEN,
  NUM_SUDOKU_CELLS,
} = require('./constants');

const colorToGray = (image) => image.mean(2).toInt();

const invertImage = (image) => image.mul(-1).add(255).toInt();

const cvToTensor = (imageCv) => tf
    .tensor(imageCv.data, [imageCv.rows, imageCv.cols]);

const getDistance = (p1, p2) => Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2),
);

const getRandomNumber = (min, max) => Math.random() * max + min;

const getEmptyImage = () => tf.zeros([MNIST_LEN, MNIST_LEN]);

const tensorToCv = async (imageTensor) => {
  let rows; let cols;
  if (imageTensor.shape.length == 3) {
    imageTensor = colorToGray(imageTensor);
  }
  if (imageTensor.shape.length == 2) {
    rows = imageTensor.shape[0];
    cols = imageTensor.shape[1];
  } else if (imageTensor.shape.length == 4) {
    rows = imageTensor.shape[1];
    cols = imageTensor.shape[2];
  }
  const flattenedImageArray = await imageTensor.data();
  const imageCv = cv.matFromArray(rows, cols, cv.CV_8UC1, flattenedImageArray);
  return imageCv;
};

const filterByPercentile = (sortedNumArray, gap) => {
  const percentiles = [0];
  const maxIndex = 100 / gap;
  let j;
  // Index 1, 2, 3, ... 19 = 5th, 10th, 15th, ... 95th percentile
  for (let i = 1; i < maxIndex; i += 1) {
    j = Math.round(sortedNumArray.length * ((i * gap) / 100.0));
    percentiles.push(sortedNumArray[j]);
  }
  return percentiles;
};

const getPercentiles = (numArray) => {
  let sortedNumArray;
  sortedNumArray = numArray.slice(0);
  sortedNumArray = sortedNumArray.sort((a, b) => a - b);
  const percentiles = filterByPercentile(sortedNumArray, 5.0);
  return percentiles;
};

const addBorderToImage = (imageCv) => {
  const src = imageCv;
  const dst = new cv.Mat();
  const backgroundColor = new cv.Scalar(0, 0, 0, 255);

  const originalHeight = imageCv.rows;
  const originalWidth = imageCv.cols;

  const addTop = Math.floor(0.5 * (MNIST_LEN - originalHeight));
  const addBottom = MNIST_LEN - originalHeight - addTop;
  const addLeft = Math.floor(0.5 * (MNIST_LEN - originalWidth));
  const addRight = MNIST_LEN - originalWidth - addLeft;

  cv.copyMakeBorder(
      src,
      dst,
      addTop,
      addBottom,
      addLeft,
      addRight,
      cv.BORDER_CONSTANT,
      backgroundColor,
  );
  src.delete();
  return dst;
};

const reshapeToMnistGray = (cell) => {
  if (cell.shape.length == 3) {
    if (cell.shape[2] == 3) {
      cell = tf.reshape(cell, [MNIST_LEN, MNIST_LEN, 3]);
      cell = colorToGray(cell);
    } else if (cell.shape[2] == 1) {
      cell = tf.reshape(cell, [MNIST_LEN, MNIST_LEN, 1]);
    }
  }
  return cell;
};

const rescaleImage = async (image) => {
  const originalImageShape = image.shape;
  let imageData;
  imageData = await image.data();
  imageData = [...imageData];
  const percentiles = getPercentiles(imageData);
  imageData = imageData.map((item, index) =>
    Math.max(0, item - percentiles[3]),
  );
  imageData = imageData.map(
      (item, index) =>
        Math.floor(Math.min(255, (item / percentiles[17]) * 255.0)),
  );
  image = tf.tensor(imageData);
  image = tf.reshape(image, originalImageShape);
  return image;
};

const cropBorder = (image, cropFraction) => {
  let height; let width;
  if (image.shape.length == 4) {
    height = image.shape[1];
    width = image.shape[2];
  } else if (image.shape.length == 3) {
    if (image.shape[2] == 3) {
      height = image.shape[0];
      width = image.shape[1];
    } else {
      height = image.shape[1];
      width = image.shape[2];
    }
  } else {
    height = image.shape[0];
    width = image.shape[1];
  }
  return cropSingleImage(
      image,
      cropFraction,
      cropFraction,
      1 - cropFraction,
      1 - cropFraction,
      height,
      width,
  );
};

const cropSingleImage = (image, y1, x1, y2, x2, height, width) => {
  if (image.shape.length == 2) {
    image = tf.reshape(image, [1, image.shape[0], image.shape[1], 1]);
  } else if (image.shape.length == 3) {
    image = tf.reshape(image, [
      1,
      image.shape[0],
      image.shape[1],
      image.shape[2],
    ]);
  }
  return tf.image.cropAndResize(
      image,
      [[y1, x1, y2, x2]],
      [0],
      [height, width],
  );
};

const processCell = async (cellImage) => {
  cellImage = reshapeToMnistGray(cellImage);
  cellImage = cellImage.toInt();
  cellImage = await rescaleImage(cellImage);
  cellImage = cropBorder(cellImage, getRandomNumber(0.05, 0.1));
  cellImage = await cropUsingContours(cellImage);
  cellImage = cropBorder(cellImage, getRandomNumber(0.05, 0.1));
  cellImage = await cropUsingContours(cellImage);
  cellImage = tf.reshape(cellImage, [1, 28, 28, 1]);
  cellImage = cellImage.toInt();
  cellImage = await cellImage.data();
  return cellImage;
};

const cropCells = async (img) => {
  let y1; let x1; let y2; let x2; let cell;
  const cellHeight = Math.floor(img.shape[0] / BOARD_LEN);
  const cellWidth = Math.floor(img.shape[1] / BOARD_LEN);
  const height = img.shape[0];
  const width = img.shape[1];
  let sudokuImages = [];

  img = invertImage(img);

  // Reshape to 4D grayscale tensor
  if (img.shape.len == 2) {
    img = tf.reshape(img, [1, img.shape[0], img.shape[1], 1]);
  } else if (img.shape.len == 3) {
    if (img.shape[2] == 3) {
      img = colorToGray(img);
    }
    img = tf.reshape(img, [1, img.shape[0], img.shape[1], 1]);
  }

  for (let row = 0; row < BOARD_LEN; row += 1) {
    for (let col = 0; col < BOARD_LEN; col += 1) {
      y1 = (row * cellHeight) / height;
      x1 = (col * cellWidth) / width;
      y2 = Math.min((row + 1) * cellHeight, height) / height;
      x2 = Math.min((col + 1) * cellWidth, width) / width;
      // Extract the cell from the main image
      cell = cropSingleImage(img, y1, x1, y2, x2, MNIST_LEN, MNIST_LEN);
      cell = processCell(cell);
      sudokuImages.push(cell);
    }
  }
  await Promise.all(sudokuImages).then((data) => {
    sudokuImages = tf.tensor(data);
    sudokuImages = sudokuImages.reshape([
      NUM_SUDOKU_CELLS,
      MNIST_LEN,
      MNIST_LEN,
      1,
    ]);
  });
  return sudokuImages;
};

// POINTS, BOXES, CONTOURS

const getFourPoints = (contourMatdata32S, minAreaRect) => {
  // Given an array of numbers derived from calling contourMat.data32S,
  // Return the four points that represent the four corners of the shape.

  // Input array is a series of numbers representing points in the order
  // x1, y1, x2, y2, x3, y3, ... x100, y100, ....
  // So collect each point in a dictionary and place it in a list.

  let topLeft;
  let topRight;
  let bottomLeft;
  let bottomRight;

  const points = [];
  for (let i = 0; i < contourMatdata32S.length; i += 2) {
    points.push({
      x: contourMatdata32S[i],
      y: contourMatdata32S[i + 1],
    });
  }

  const vertices = cv.RotatedRect.points(minAreaRect);
  vertices.sort((a, b) => a.x - b.x);
  [topLeft, topRight, bottomLeft, bottomRight] = vertices;
  if (topLeft.y > topRight.y) {
    [topLeft, topRight] = [topRight, topLeft];
  }
  if (bottomLeft.y > bottomRight.y) {
    [bottomLeft, bottomRight] = [bottomRight, bottomLeft];
  }

  // For each point, calculate its distance to each of the corners.
  for (let i = 0; i < points.length; i += 1) {
    points[i].topLeftDist = getDistance(topLeft, points[i]);
    points[i].topRightDist = getDistance(topRight, points[i]);
    points[i].bottomLeftDist = getDistance(bottomLeft, points[i]);
    points[i].bottomRightDist = getDistance(bottomRight, points[i]);
  }

  points.sort((a, b) => a.topLeftDist - b.topLeftDist);
  topLeft = points[0];

  points.sort((a, b) => a.topRightDist - b.topRightDist);
  topRight = points[0];

  points.sort((a, b) => a.bottomLeftDist - b.bottomLeftDist);
  bottomLeft = points[0];

  points.sort((a, b) => a.bottomRightDist - b.bottomRightDist);
  bottomRight = points[0];

  return [
    topLeft.x,
    topLeft.y,
    topRight.x,
    topRight.y,
    bottomRight.x,
    bottomRight.y,
    bottomLeft.x,
    bottomLeft.y,
  ];
};

const getBiggestRectangle = async (image) => {
  const src = await tensorToCv(image);

  // Get contours from the current image
  cv.adaptiveThreshold(
      src,
      src,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      9,
      15,
  );
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(
      src,
      contours,
      hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE,
  );
  const cnt = contours.get(0);

  // If there are contours, calculate metadata
  if (typeof cnt !== 'undefined') {
    let biggest;

    // Calculate the area of each contour and store it in a dictionary
    const contoursAndAreas = [];
    for (let i = 0; i < contours.size(); i += 1) {
      const currentContourArea = cv.contourArea(contours.get(i), false);
      if (currentContourArea > 500) {
        contoursAndAreas.push({
          contourMat: contours.get(i),
          area: currentContourArea,
        });
      }
    }

    // Sort dictionary by largest area first
    contoursAndAreas.sort((a, b) => b.area - a.area);

    biggest = contoursAndAreas[0];
    if (contoursAndAreas.length >= 2 &&
        contoursAndAreas[1].area > 1600) {
      biggest = contoursAndAreas[1];
    }

    const minAreaRect = cv.minAreaRect(biggest.contourMat);
    const boxPoints = getFourPoints(biggest.contourMat.data32S, minAreaRect);
    const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, boxPoints);
    const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0,
      0,
      0,
      WEBCAM_FRAME_LENGTH,
      WEBCAM_FRAME_LENGTH,
      WEBCAM_FRAME_LENGTH,
      WEBCAM_FRAME_LENGTH,
      0,
    ]);
    const warpedImage = await warpImage(image, srcTri, dstTri);

    const imageTensor = cvToTensor(warpedImage);
    // Clean up OpenCV objects if they exist
    try {
      src.delete();
      contours.delete();
      cnt.delete();
      hierarchy.delete();
      contoursAndAreas.delete();
      biggest.delete();
      srcTri.delete();
      dstTri.delete();
      minAreaRect.delete();
    } catch (err) {}
    return imageTensor;
  } else {
    // Clean up OpenCV objects if they exist
    try {
      src.delete();
      contours.delete();
      cnt.delete();
      hierarchy.delete();
    } catch (err) {}
    return null;
  }
};

// WARP IMAGE

const cropUsingContours = async (image) => {
  let imageTensor;
  let dst;
  let rect;
  let biggestContour;

  const imageCv = await tensorToCv(image);
  const imageCvClone = imageCv.clone();

  cv.adaptiveThreshold(
      imageCv,
      imageCv,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      3,
      15,
  );
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(
      imageCv,
      contours,
      hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE,
  );
  const cnt = contours.get(0);

  // There are contours, else return an empty image
  if (typeof cnt !== 'undefined') {
    const contoursAndAreas = [];
    for (let i = 0; i < contours.size(); i += 1) {
      const currentContourArea = cv.contourArea(contours.get(i), false);
      if (currentContourArea > 150) {
        contoursAndAreas.push({
          contourMat: contours.get(i),
          area: currentContourArea,
        });
      }
    }

    // Sort dictionary by largest area first
    contoursAndAreas.sort((a, b) => b.area - a.area);

    biggestContour = contoursAndAreas[0].contourMat;

    rect = cv.boundingRect(biggestContour);
    dst = cv.Mat.zeros(imageCv.rows, imageCv.cols, cv.CV_8UC1);
    dst = imageCvClone.roi(rect);
    dst = addBorderToImage(dst);
    imageTensor = cvToTensor(dst);

    cnt.delete();
    biggestContour.delete();
    dst.delete();
  } else {
    imageTensor = getEmptyImage();
  }

  imageCv.delete();
  contours.delete();
  hierarchy.delete();

  return imageTensor;
};

const warpImage = async (image, originalShape, targetShape) => {
  const src = await tensorToCv(image);
  const dst = new cv.Mat();
  const dsize = new cv.Size(src.rows, src.cols);
  const M = cv.getPerspectiveTransform(originalShape, targetShape);
  cv.warpPerspective(
      src,
      dst,
      M,
      dsize,
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar(),
  );
  src.delete();
  M.delete();
  originalShape.delete();
  targetShape.delete();
  return dst;
};

module.exports = {cropCells, getBiggestRectangle};
