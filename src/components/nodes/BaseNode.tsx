import { useEffect, useState, useRef, type ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { TextField } from '@mui/material';
import { useTopologyStore } from '../../lib/store';

export interface BaseNodeProps {
  selected: boolean;
  name: string;
  icon?: ReactNode;
  onNameChange: (newName: string) => void;
  onNameBlur: () => void;
  className?: string;
}

export default function BaseNode({
  selected,
  name,
  icon,
  onNameChange,
  onNameBlur,
  className = '',
}: BaseNodeProps) {
  const darkMode = useTopologyStore((state) => state.darkMode);
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current && selected) {
      setIsEditing(true);
    }
    isFirstRender.current = false;
  }, [selected]);

  useEffect(() => {
    setLocalName(name);
  }, [name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [isEditing]);

  const handleClassName = "!w-2.5 !h-2.5 !bg-(--color-handle-bg) !border !border-solid !border-(--color-node-border)";

  return (
    <div
      className={`w-20 h-20 bg-(--color-node-bg) border rounded-lg flex flex-col items-center justify-center gap-0.5 ${
        selected ? 'border-(--color-node-border-selected)' : 'border-(--color-node-border)'
      } ${darkMode ? 'dark' : ''} ${className || 'border-solid'}`}
      onDoubleClick={() => setIsEditing(true)}
    >
      <Handle type="source" position={Position.Top} id="top" className={handleClassName} />
      <Handle type="target" position={Position.Top} id="top-target" className={handleClassName} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClassName} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className={handleClassName} />
      <Handle type="source" position={Position.Left} id="left" className={handleClassName} />
      <Handle type="target" position={Position.Left} id="left-target" className={handleClassName} />
      <Handle type="source" position={Position.Right} id="right" className={handleClassName} />
      <Handle type="target" position={Position.Right} id="right-target" className={handleClassName} />

      {icon}

      {isEditing ? (
        <TextField
          inputRef={inputRef}
          size="small"
          variant="standard"
          value={localName}
          onChange={(e) => {
            setLocalName(e.target.value);
            onNameChange(e.target.value);
          }}
          onBlur={() => {
            setIsEditing(false);
            onNameBlur();
          }}
          onKeyDown={(e) => e.key === 'Enter' && (setIsEditing(false), onNameBlur())}
          sx={{
            width: 70,
            '& .MuiInputBase-input': {
              padding: '2px 0',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              color: 'var(--color-node-text)',
              textAlign: 'center',
            },
          }}
        />
      ) : (
        <div className="w-17.5 text-xs font-bold text-(--color-node-text) text-center cursor-text overflow-hidden text-ellipsis whitespace-nowrap">
          {localName}
        </div>
      )}
    </div>
  );
}
