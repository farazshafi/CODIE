/**
 * Plays a pleasant double-tone bell chime sound using the browser's Web Audio API.
 * Does not require external audio files or dependencies.
 */
export const playBellSound = () => {
    try {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => { });
        }

        const now = ctx.currentTime;

        // Tone 1: E5 (659.25 Hz) bell fundamental tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(659.25, now);
        osc1.frequency.exponentialRampToValueAtTime(329.63, now + 0.6);

        gain1.gain.setValueAtTime(0.35, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        // Tone 2: B5 (987.77 Hz) bell accent tone (slightly delayed)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(987.77, now + 0.08);
        osc2.frequency.exponentialRampToValueAtTime(493.88, now + 0.8);

        gain2.gain.setValueAtTime(0.3, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        // Tone 3: High shimmer harmonic E6 (1318.51 Hz)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = "sine";
        osc3.frequency.setValueAtTime(1318.51, now + 0.08);

        gain3.gain.setValueAtTime(0.15, now + 0.08);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc3.connect(gain3);
        gain3.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.6);

        osc2.start(now + 0.08);
        osc2.stop(now + 0.8);

        osc3.start(now + 0.08);
        osc3.stop(now + 0.7);
    } catch (error) {
        console.warn("Could not play bell notification sound:", error);
    }
};
