'use client';

type SoundType = 'bell' | 'victory' | 'defeat';

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (typeof window !== 'undefined' && !audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

export const playSound = (type: SoundType) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.1;

    switch (type) {
        case 'bell':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
            gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
            break;

        case 'victory':
            oscillator.type = 'sawtooth';
            // Simple ascending arpeggio C-E-G
            const now = ctx.currentTime;
            oscillator.frequency.setValueAtTime(261.63, now); // C4
            oscillator.frequency.setValueAtTime(329.63, now + 0.1); // E4
            oscillator.frequency.setValueAtTime(392.00, now + 0.2); // G4
            oscillator.frequency.setValueAtTime(523.25, now + 0.3); // C5
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
            break;
        
        case 'defeat':
             oscillator.type = 'square';
             // Descending
             const nowDefeat = ctx.currentTime;
             oscillator.frequency.setValueAtTime(200, nowDefeat);
             oscillator.frequency.exponentialRampToValueAtTime(50, nowDefeat + 0.5);
             gainNode.gain.exponentialRampToValueAtTime(0.0001, nowDefeat + 0.5);
             break;
    }

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 1);
};
