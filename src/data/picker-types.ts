/** A node of a picker card's preview, mirroring the legacy markup. */
export type PreviewNode =
    | { x: string }
    | { t: string; s?: string; c?: string; src?: string; alt?: string; k?: PreviewNode[] };

export interface PickerItem {
    id: string;
    name: string;
    preview: PreviewNode;
}

export interface EffectToggle {
    key: string;
    title: string;
    description: string;
}
