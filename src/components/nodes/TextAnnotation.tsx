import type { NodeProps } from '@xyflow/react';

interface TextAnnotationData {
  [key: string]: unknown;
  annotationId: string;
  text: string;
  fontSize: number;
  fontColor: string;
}

export default function TextAnnotation({ data, selected }: NodeProps) {
  const d = data as TextAnnotationData;
  const { fontSize, fontColor } = d;

  return (
    <div
      className={`px-2 py-1 rounded cursor-move ${
        selected ? 'outline outline-2 outline-(--color-node-border-selected)' : ''
      }`}
      style={{ fontSize, color: fontColor, minWidth: 40, minHeight: 20 }}
    >
      <span style={{ whiteSpace: 'pre-wrap' }}>
        {d.text || 'Text'}
      </span>
    </div>
  );
}
