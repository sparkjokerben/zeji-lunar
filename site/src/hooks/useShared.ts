/**
 * 懒加载 @zeji/shared 计算模块（lunar-typescript 体积较大，避免拖慢首屏）。
 * 同一模块只加载一次，所有页面共享。
 */
import { useEffect, useState } from 'react';

type Shared = typeof import('@zeji/shared');

let cache: Promise<Shared> | null = null;

function load(): Promise<Shared> {
  if (!cache) cache = import('@zeji/shared');
  return cache;
}

export function useShared(): Shared | null {
  const [shared, setShared] = useState<Shared | null>(null);

  useEffect(() => {
    let cancelled = false;
    load().then((m) => {
      if (!cancelled) setShared(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return shared;
}
