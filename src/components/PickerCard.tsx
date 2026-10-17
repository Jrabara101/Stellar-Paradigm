import { createElement, type CSSProperties, type ReactNode } from 'react';
import type { PickerItem, PreviewNode } from '../data/picker-types';

const styleCache = new Map<string, CSSProperties>();

/** Converts a legacy inline style string ("a: b; c: d") into a React style object. */
export function cssToStyle(css: string): CSSProperties {
    const cached = styleCache.get(css);
    if (cached) return cached;
    const style: Record<string, string> = {};
    let depth = 0;
    let start = 0;
    const decls: string[] = [];
    for (let i = 0; i < css.length; i++) {
        const ch = css[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === ';' && depth === 0) {
            decls.push(css.slice(start, i));
            start = i + 1;
        }
    }
    decls.push(css.slice(start));
    for (const decl of decls) {
        const colon = decl.indexOf(':');
        if (colon < 0) continue;
        const prop = decl.slice(0, colon).trim();
        const value = decl.slice(colon + 1).trim();
        if (!prop || !value) continue;
        const key = prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        style[key] = value;
    }
    styleCache.set(css, style as CSSProperties);
    return style as CSSProperties;
}

function renderNode(node: PreviewNode, key: number | string, extraClass?: string): ReactNode {
    if ('x' in node) return node.x;
    const className = [node.c, extraClass].filter(Boolean).join(' ') || undefined;
    const props: Record<string, unknown> = { key, className, style: node.s ? cssToStyle(node.s) : undefined };
    if (node.t === 'img') {
        // Modals only mount while open, so loading the preview now is the same
        // "load on first open" behaviour the legacy data-src swap gave.
        return createElement('img', { ...props, src: node.src, alt: node.alt ?? '', loading: 'lazy', decoding: 'async' });
    }
    return createElement(node.t, props, node.k?.map((child, i) => renderNode(child, i)));
}

interface PickerCardProps {
    item: PickerItem;
    current: boolean;
    locked?: boolean;
    onPick: (id: string) => void;
}

/** One card of a theme / chip / font / tile-effect grid (legacy .theme-card styling). */
export function PickerCard({ item, current, locked = false, onPick }: PickerCardProps) {
    const preview = item.preview;
    const lockIcon = locked ? <span className="font-lock material-symbols-outlined">lock</span> : null;
    return (
        <button
            type="button"
            className={`theme-card rx-card${current ? ' current' : ''}${locked ? ' locked' : ''}`}
            id={`rx-card-${item.id}`}
            aria-pressed={current}
            aria-label={`${item.name}${locked ? ' (locked)' : ''}${current ? ' (current)' : ''}`}
            onClick={() => onPick(item.id)}
        >
            {'x' in preview
                ? null
                : preview.t === 'img'
                    ? renderNode(preview, 'p', 'theme-preview')
                    : createElement(
                          preview.t,
                          { className: ['theme-preview', preview.c].filter(Boolean).join(' '), style: preview.s ? cssToStyle(preview.s) : undefined },
                          preview.k?.map((child, i) => renderNode(child, i)),
                          lockIcon,
                      )}
            <span className="theme-name">{item.name}{locked ? ' 🔒' : ''}</span>
        </button>
    );
}
