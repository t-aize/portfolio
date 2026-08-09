/**
 * Decrypt-style text scramble: each character resolves at its own random
 * frame instead of sweeping left-to-right, so characters lock in out of
 * order — the "netrunner subtitle" look, not a typewriter reveal.
 */

const NOISE_CHARS = "アイウエオカキクケコサシスセソ!<>-_\\/[]{}=+*^?#0123456789";

interface ScrambleChar {
  from: string;
  to: string;
  start: number;
  end: number;
  glyph?: string;
}

export class TextScramble {
  private el: HTMLElement;
  private chars: string;
  private queue: ScrambleChar[] = [];
  private frame = 0;
  private frameRequest = 0;

  constructor(el: HTMLElement, chars: string = NOISE_CHARS) {
    this.el = el;
    this.chars = chars;
    this.update = this.update.bind(this);
  }

  setText(newText: string): void {
    const oldText = this.el.textContent ?? "";
    const length = Math.max(oldText.length, newText.length);

    this.queue = Array.from({ length }, (_, i) => {
      const start = Math.random() * 22;
      return {
        from: oldText[i] ?? "",
        to: newText[i] ?? "",
        start,
        end: start + Math.random() * 34 + 10,
      };
    });

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
  }

  private update(): void {
    let output = "";
    let settled = 0;

    for (const c of this.queue) {
      if (this.frame >= c.end) {
        settled++;
        output += c.to;
      } else if (this.frame >= c.start) {
        if (!c.glyph || Math.random() < 0.16) {
          c.glyph = this.randomGlyph();
        }
        output += `<span style="color:var(--color-accent)">${c.glyph}</span>`;
      } else {
        output += c.from;
      }
    }

    this.el.innerHTML = output;

    if (settled < this.queue.length) {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  private randomGlyph(): string {
    return this.chars[Math.floor(Math.random() * this.chars.length)] ?? "";
  }
}
