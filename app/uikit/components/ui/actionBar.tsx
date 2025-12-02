import map from 'lodash/map';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Button } from './button';

export type Action = {
  icon?: ReactElement,
  action: string,
  text: string,
  variant?: "default" | "destructive" | undefined
}

export type ActionBarProps = {
  actions: Action[]
  onActionClicked: (action: string) => void
}

function ActionBar({
  actions,
  onActionClicked
}: ActionBarProps) {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setIsStuck(!entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-4" aria-hidden />

      <div className={`flex justify-between sticky top-4 border p-2 mb-2 rounded-2xl bg-white ${isStuck ? 'shadow' : ''}`}>
        <div />
        <div />
        <div className="flex gap-x-1">
          {map(actions, (action) => {
            return (
              <Button key={action.action} size={'sm'} onClick={() => onActionClicked(action.action)}>
                {action.icon ? action.icon : null}
                {action.text}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export { ActionBar };
