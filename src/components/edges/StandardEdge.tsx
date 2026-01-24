import { getBezierPath, BaseEdge, EdgeLabelRenderer, Position } from '@xyflow/react';
import { Bezier } from 'bezier-js';
import { Chip } from '@mui/material';
import { getControlPoint } from './edgeUtils';

interface StandardEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  isSelected: boolean;
  isSimNodeEdge: boolean;
  linkCount: number;
  onDoubleClick: (e: React.MouseEvent) => void;
}

export default function StandardEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  isSelected,
  isSimNodeEdge,
  linkCount,
  onDoubleClick,
}: StandardEdgeProps) {
  let edgePath: string;
  let edgeMidpoint: { x: number; y: number };

  if (sourcePosition === targetPosition) {
    const distance = Math.sqrt((targetX - sourceX) ** 2 + (targetY - sourceY) ** 2);
    const curvature = Math.max(50, distance * 0.5);
    const c1 = getControlPoint(sourceX, sourceY, sourcePosition, curvature);
    const c2 = getControlPoint(targetX, targetY, targetPosition, curvature);

    const bezier = new Bezier(
      sourceX, sourceY,
      c1.x, c1.y,
      c2.x, c2.y,
      targetX, targetY
    );
    edgePath = bezier.toSVG();
    const mid = bezier.get(0.5);
    edgeMidpoint = { x: mid.x, y: mid.y };
  } else {
    const [path, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });
    edgePath = path;
    edgeMidpoint = { x: labelX, y: labelY };
  }

  return (
    <>
      <g onDoubleClick={onDoubleClick}>
        <BaseEdge
          id={id}
          path={edgePath}
          className={isSimNodeEdge ? 'sim-edge' : ''}
          interactionWidth={20}
          style={{
            stroke: isSelected ? 'var(--color-link-stroke-selected)' : 'var(--color-link-stroke)',
            strokeWidth: 1,
            ...(isSimNodeEdge && { strokeDasharray: '5 5' }),
          }}
        />
      </g>
      {linkCount > 1 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${edgeMidpoint.x}px, ${edgeMidpoint.y}px)`,
              pointerEvents: 'all',
            }}
            onDoubleClick={onDoubleClick}
          >
            <Chip
              label={linkCount}
              size="small"
              title={`${linkCount} links - double-click to expand`}
              sx={{
                height: '14px',
                minWidth: '14px',
                fontSize: '8px',
                fontWeight: 400,
                bgcolor: 'var(--color-node-bg)',
                color: 'var(--color-node-text)',
                border: '1px solid var(--color-link-stroke)',
                cursor: 'pointer',
                '& .MuiChip-label': { px: '3px' },
              }}
            />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
