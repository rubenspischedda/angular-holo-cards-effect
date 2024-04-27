export const clamp: (value: number, min?: number, max?: number) => number = (
  value,
  min = 0,
  max = 100
) => Math.min(Math.max(value, min), max);

export const adjust: (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
) => number = (value, fromMin, fromMax, toMin, toMax) => {
  return Math.round(
    toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin)
  );
};

export const round: (value: number, precision?: number) => number = (
  value,
  precision = 3
) => parseFloat(value.toFixed(precision));

export const remap: (
  value: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number
) => number = (value, start1, stop1, start2, stop2) =>
  ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

// Definition of the rotation matrix around the x-axis (counterclockwise rotation)
export const getXRotationMatrix: (degrees: number) => number[][] = (
  degrees
) => {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    [1, 0, 0],
    [0, cos, -sin],
    [0, sin, cos],
  ];
};

// Definition of the rotation matrix around the y-axis (counterclockwise rotation)
export const getYRotationMatrix: (degrees: number) => number[][] = (
  degrees
) => {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    [cos, 0, sin],
    [0, 1, 0],
    [-sin, 0, cos],
  ];
};

export const matrixProduct: (
  mat1: number[][],
  mat2: number[][]
) => number[][] = (mat1, mat2) => {
  if (
    mat1.length !== 3 ||
    mat2.length !== 3 ||
    !mat1.every((row) => row.length === 3) ||
    !mat2.every((row) => row.length === 3)
  ) {
    console.error('Both matrices must be 3x3');
  }

  const result: number[][] = [];
  for (let i = 0; i < 3; i++) {
    result[i] = [];
    for (let j = 0; j < 3; j++) {
      result[i][j] = 0;
      for (let k = 0; k < 3; k++) {
        result[i][j] += mat1[i][k] * mat2[k][j];
      }
    }
  }
  return result;
};

// Computes the matrix-vector product of a 3x3 matrix and a 3x1 vector
export const matrixVectorProduct: (
  mat: number[][],
  vec: number[]
) => number[] = (mat, vec) => {
  const result: number[] = [];
  for (let i = 0; i < 3; i++) {
    let sum = 0;
    for (let j = 0; j < 3; j++) {
      sum += mat[i][j] * vec[j];
    }
    result[i] = sum;
  }
  return result;
};

// Determines the face (front or back) facing the fixed viewpoint
export const isFacingFront: (
  rotationXDegrees: number,
  rotationYDegrees: number,
  cameraDirection: number[]
) => boolean = (
  rotationXDegrees = 0,
  rotationYDegrees = 0,
  cameraDirection
) => {
  // Apply rotations around the x and y axes
  const rotationXMatrix = getXRotationMatrix(rotationXDegrees);
  const rotationYMatrix = getYRotationMatrix(rotationYDegrees);
  const combinedRotationMatrix = matrixProduct(
    rotationYMatrix,
    rotationXMatrix
  );

  // Normalize the camera direction
  const cameraDirectionNormalized = cameraDirection.map(
    (coord) => coord / Math.hypot(...cameraDirection)
  );

  // Calculate the normal of the card face (in its original position)
  const normalToFront = [0, 0, 1];

  // Apply the combined rotation matrix to the card face normal
  const rotatedNormal = matrixVectorProduct(
    combinedRotationMatrix,
    normalToFront
  );

  // Calculate the dot product between the normalized camera direction and the rotated normal
  const dotProduct =
    cameraDirectionNormalized[0] * rotatedNormal[0] +
    cameraDirectionNormalized[1] * rotatedNormal[1] +
    cameraDirectionNormalized[2] * rotatedNormal[2];

  // Determine whether the front or back is facing the camera
  if (dotProduct >= 0) {
    return true;
  } else {
    return false;
  }
};

export const getAspectRatio = (image: HTMLImageElement|undefined) => {
  if (!image) return 1;

  const w = image.naturalWidth;
  const h = image.naturalHeight;

  return w / h;
};
