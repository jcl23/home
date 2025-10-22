export type Point = { x: number; y: number };
type BorderPointsData = {
  leftBlock: Point[];
  rightBlock: Point[];
}

export function generateHilbertCurve(iteration: number = 2, width: number = 200): Point[] {
  const n = Math.pow(2, iteration); // Grid is 2^iteration x 2^iteration
  const totalPoints = n * n;
  const scale = width / (n - 1);

  const points: Point[] = [];

  for (let i = 0; i < totalPoints; i++) {
    const { x, y } = d2xy(n, i);
    points.push({ x: x * scale, y: y * scale });
  }
  
  return points.map(({x, y}) => ({x: y, y: x})); 
}


export function generateSnakeCurve(pointWidth: number, pointHeight: number, width: number, height: number) {
 // Should snake acrss the whole thing, entering from the top right and exiting from the bottom right.
 // The pointHeight should always be even

  const dx = width / (pointWidth - 1);
  const dy = height / (pointHeight - 1);
  const points: Point[] = [];
  for (let i = 0; i < pointHeight; i += 2){
    for (let j = 0; j < pointWidth; j++) {
      points.push({ x: j * dx, y: i * dy });
    }
    for (let j = pointWidth - 1; j >= 0; j--) {
      points.push({ x: j * dx, y: (i + 1) * dy });
    }
  }
  return points;
}

export function generateSnakeBorder(height = 100, width = 0, iteration = 3, stackHeight = 1): Point[] {
  
  const pointWidth = 8;
  const pointHeight = stackHeight * pointWidth;

  const snakePoints = generateSnakeCurve(pointWidth, pointHeight, height, height);
  return generateBorderFromBlock(snakePoints, height, width, stackHeight);
}

export function generateBorderFromBlock(block: Point[], height: number, width: number, stackHeight: number): Point[] {
  const spacing = height / ((2 ** 3) - 1);
  const minX = Math.min(...block.map(p => p.x));
  const minY = Math.min(...block.map(p => p.y));
  const maxX = Math.max(...block.map(p => p.x));
  const maxY = Math.max(...block.map(p => p.y));
  console.log(`minX: ${minX}, minY: ${minY}, maxX: ${maxX}, maxY: ${maxY}`);
  const invertAndShifted = block.map(p => ({ x: height + width  - p.x, y: height - p.y }));
  // shift block 1 heights worth left.
  block.forEach((p, i, arr) => { arr[i].x += height; });
  return [...block, ...invertAndShifted];
}
  // const leftBoxPoints = block.map(p => ({ x: height - p.y, y: p.x }));
export function generateHilbertBorder(height = 100, width = 0, iteration = 3, stackHeight = 1): Point[] {
    
    const squarePoints = generateHilbertCurve(iteration, height);
    const stack = Array(stackHeight).fill(0).map((_, i) => {
        const offset = i * (height + height / ((2 ** iteration) - 1))
        return squarePoints.map(p => ({ x: p.x, y: p.y + offset }));
    }
    ).flat(1);
    return generateBorderFromBlock(stack, height, width, stackHeight);
    const spacing = height / ((2 ** iteration) - 1);
    const minX = Math.min(...squarePoints.map(p => p.x));
    const minY = Math.min(...squarePoints.map(p => p.y));
    const maxX = Math.max(...squarePoints.map(p => p.x));
    const maxY = Math.max(...squarePoints.map(p => p.y));
    const innerWidth = (width % spacing == 0) ? width
        : Math.floor(width / spacing) * spacing;
    console.log(`minX: ${minX}, minY: ${minY}, maxX: ${maxX}, maxY: ${maxY}`);
    const leftBoxPoints = squarePoints.map(p => ({ x: height - p.y, y: p.x }));

// now we make the rest in the column
    const leftStack = Array(stackHeight).fill(0).map((_, i) => {
        const offset = i * (height + spacing)
        return leftBoxPoints.map(p => ({ x: p.x, y: p.y + offset }));
    }).flat(1);

    const rightBoxPoints = squarePoints.map(p => ({ x: height + innerWidth + p.y, y: height - p.x }));
    const rightStack = Array(stackHeight).fill(0).map((_, i) => {
        const offset = i * (height + spacing)
        return rightBoxPoints.map(p => ({ x: p.x, y: p.y + offset }));
    }
    ).reverse().flat(1);


    // const widthBetweenEachPoint = height / 9;
    // const numPointsOnTop = Math.floor(width / widthBetweenEachPoint);
    // const topBorderPoints = Array(numPointsOnTop).fill(0).map((_, i) => ({ x: width + height - i * widthBetweenEachPoint, y: 0 }));
    const firstPoint = rightBoxPoints[0];
    // firstPoint.y -= 12.5;
    // const lastPoint = leftBox[leftBox.length - 1];
    // lastPoint.y -= 12.5;
    return [...rightStack, ...leftStack, firstPoint]
}

export function generateHilbertEdge(iteration: number = 2, c: number, width: number = 500): Point[] {
    const points =  Array(c).fill(0).map((_, i) => generateHilbertCurve(iteration, width).map(p => ({ y: p.y, x: p.x + i * width }))).flat(1);
    const firstPoint = points[0];
    firstPoint.y -= 12.5;
    const lastPoint = points[points.length - 1];
    lastPoint.y -= 12.5;
    return points;
}

// Converts a distance 'd' along Hilbert curve to x, y coordinates
function d2xy(n: number, d: number): { x: number; y: number } {
  let x = 0, y = 0;
  let t = d;
  for (let s = 1; s < n; s *= 2) {
    const rx = 1 & (t >> 1);
    const ry = 1 & (t ^ rx);
    const [nx, ny] = rot(s, x, y, rx, ry);
    x = nx + s * rx;
    y = ny + s * ry;
    t >>= 2;
  }
  return { x, y };
}

// Rotate/flip a quadrant appropriately
function rot(n: number, x: number, y: number, rx: number, ry: number): [number, number] {
  if (ry === 0) {
    if (rx === 1) {
      x = n - 1 - x;
      y = n - 1 - y;
    }
    // Swap x and y
    return [y, x];
  }
  return [x, y];
}

export function pointsToSvgPolyline(points: Point[]): string {
    return points.map(p => `${p.x},${p.y}`).join(" ");
}

export function pointsToCompleteSvgPath(points: Point[]): string {
    // should be able to be put directly into a path element in svg
    return "M" + points.map(p => `${p.x},${p.y}`).join(" L ");
}