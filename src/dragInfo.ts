import { Vector } from './types';

export function getDragInfo(element: HTMLElement) {
  let startPoint: Vector | null = null;
  let displacement: Vector = { x: 0, y: 0 };
  let direction: 'x' | 'y' | null = null;

  element?.addEventListener('mousedown', (event) => {
    startPoint = {
      x: event.offsetX,
      y: event.offsetY,
    };
  });

  element?.addEventListener('mousemove', (event) => {
    if (startPoint) {
      const x = event.offsetX - startPoint.x;
      const y = event.offsetY - startPoint.y;

      const distance = Math.sqrt(x ** 2 + y ** 2);
      if (direction === null && distance > 1) {
        direction = Math.abs(x) - Math.abs(y) < 0 ? 'y' : 'x';
      }
      displacement = {
        x: direction === 'x' ? x : 0,
        y: direction === 'y' ? y : 0,
      };
    }
  });

  element?.addEventListener('mouseup', () => {
    startPoint = null;
    direction = null;
    displacement = { x: 0, y: 0 };
  });

  element?.addEventListener('mouseleave', () => {
    startPoint = null;
    direction = null;
    displacement = { x: 0, y: 0 };
  });

  return {
    get startPoint() {
      return { ...startPoint };
    },
    get displacement() {
      return { ...displacement };
    },
  };
}

export type DragInfo = ReturnType<typeof getDragInfo>;
