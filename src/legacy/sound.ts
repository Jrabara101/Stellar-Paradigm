/** Plays a legacy synthesized sound effect, if the game has booted. */
export function playSound(type: string) {
    window.game?.sound.play(type);
}
