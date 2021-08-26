import NES from './nes';
import option from '../sfx/1.ogg';

// @ts-ignore
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

// ['nothing', 'option', 'screen', 'shift', 'tetris', 'rotate', 'levelup', 'lock', 'chirp?', 'clear', 'complete']

const clips = [option].map((clipView: Uint8Array) => {
    const clip: {
        playing: boolean,
        play: () => void,
        source?: AudioBufferSourceNode,
    } = {
        playing: false,
        play: () => {
            if (!clip.playing && clip.source) {
                clip.playing = true;
                clip.source.start();
            }
        },
    };

    const createClip = (callback?: () => void) => {
        context.decodeAudioData(clipView.buffer.slice(0))
            .then(buffer => {
                callback?.();
                const source = context.createBufferSource();
                source.buffer = buffer;
                source.connect(context.destination);
                clip.source = source;
                source.addEventListener('ended', () => {
                    createClip(() => {
                        clip.playing = false;
                    });
                });
            })
            .catch(console.error);
    };

    createClip();

    return clip;
});

export function playSFX(nes: NES) {
    if (nes.bus.sfx.size) {
        for (const index of nes.bus.sfx) {
            clips[index].play();
        }
        nes.bus.sfx.clear();
    }
}
