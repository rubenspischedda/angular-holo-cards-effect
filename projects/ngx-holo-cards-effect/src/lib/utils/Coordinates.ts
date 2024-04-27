import { remap } from "./Math";

export const calculateMousePosition: (event: MouseEvent | TouchEvent) => {
  x: number;
  y: number;
} = (event: MouseEvent | TouchEvent) => {
  const e = {
    clientX: 0,
    clientY: 0,
  };

  if (event.type === 'touchmove') {
    e.clientX = (e as unknown as TouchEvent).touches[0].clientX;
    e.clientY = (e as unknown as TouchEvent).touches[0].clientY;
  } else {
    e.clientX = (event as MouseEvent).clientX;
    e.clientY = (event as MouseEvent).clientY;
  }

  const rect = (event.target as HTMLElement).getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / rect.width,
    y: (e.clientY - rect.top) / rect.height
  }
};

export const calculateRotationFromMousePosition: (mousePosition: {x: number, y: number}, maxXRotation: number, maxYRotation: number) => { xAxis: number, yAxis: number } = (mousePosition: {x: number, y: number}, maxXRotation: number, maxYRotation: number) =>{
    return {
        xAxis: remap(mousePosition.x, 0, 1, maxXRotation, -maxXRotation),
        yAxis: remap(mousePosition.y, 0, 1, -maxYRotation, maxYRotation)
    };
}
