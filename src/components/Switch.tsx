interface SwitchProps {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}

/** The legacy retro toggle switch (.retro-switch / .retro-slider), as a controlled input. */
export function Switch({ checked, label, onChange }: SwitchProps) {
    return (
        <label className="retro-switch">
            <input type="checkbox" checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)} />
            <span className="retro-slider" />
        </label>
    );
}
