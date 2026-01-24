import { Position } from '@xyflow/react';
import { Bezier } from 'bezier-js';

export function getControlPoint(x: number, y: number, position: Position, offset: number): { x: number; y: number } {
  switch (position) {
    case Position.Top:
      return { x, y: y - offset };
    case Position.Bottom:
      return { x, y: y + offset };
    case Position.Left:
      return { x: x - offset, y };
    case Position.Right:
      return { x: x + offset, y };
    default:
      return { x, y: y - offset };
  }
}

export function getPerpendicularOffset(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  offset: number
): { x: number; y: number } {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return { x: 0, y: offset };
  const px = -dy / length;
  const py = dx / length;
  return { x: px * offset, y: py * offset };
}

export function calculateLinkOffsets(linkCount: number, spacing: number = 8): number[] {
  if (linkCount <= 1) return [0];
  const offsets: number[] = [];
  const totalWidth = (linkCount - 1) * spacing;
  const startOffset = -totalWidth / 2;
  for (let i = 0; i < linkCount; i++) {
    offsets.push(startOffset + i * spacing);
  }
  return offsets;
}

export function createFannedBezierPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position,
  offset: number
): { path: string; midpoint: { x: number; y: number } } {
  const perp = getPerpendicularOffset(sourceX, sourceY, targetX, targetY, offset);

  const distance = Math.sqrt((targetX - sourceX) ** 2 + (targetY - sourceY) ** 2);
  const curvature = sourcePosition === targetPosition
    ? Math.max(50, distance * 0.5)
    : Math.max(50, distance * 0.3);

  const c1Base = getControlPoint(sourceX, sourceY, sourcePosition, curvature);
  const c2Base = getControlPoint(targetX, targetY, targetPosition, curvature);

  const c1 = { x: c1Base.x + perp.x * 2, y: c1Base.y + perp.y * 2 };
  const c2 = { x: c2Base.x + perp.x * 2, y: c2Base.y + perp.y * 2 };

  const bezier = new Bezier(
    sourceX, sourceY,
    c1.x, c1.y,
    c2.x, c2.y,
    targetX, targetY
  );

  const mid = bezier.get(0.5);
  return { path: bezier.toSVG(), midpoint: { x: mid.x, y: mid.y } };
}

export function parseHandlePosition(handle: string | null | undefined): Position {
  const handleStr = String(handle || '');
  if (handleStr.startsWith('top')) return Position.Top;
  if (handleStr.startsWith('bottom')) return Position.Bottom;
  if (handleStr.startsWith('left')) return Position.Left;
  if (handleStr.startsWith('right')) return Position.Right;
  return Position.Bottom;
}

export function getHandleCoordinates(
  node: { position: { x: number; y: number }; measured?: { width?: number; height?: number } },
  handle: string | null | undefined
): { x: number; y: number; position: Position } {
  const width = node.measured?.width || 150;
  const height = node.measured?.height || 50;
  const position = parseHandlePosition(handle);

  let x = node.position.x + width / 2;
  let y = node.position.y + height / 2;

  switch (position) {
    case Position.Top:
      x = node.position.x + width / 2;
      y = node.position.y;
      break;
    case Position.Bottom:
      x = node.position.x + width / 2;
      y = node.position.y + height;
      break;
    case Position.Left:
      x = node.position.x;
      y = node.position.y + height / 2;
      break;
    case Position.Right:
      x = node.position.x + width;
      y = node.position.y + height / 2;
      break;
  }

  return { x, y, position };
}
