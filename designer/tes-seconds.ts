import { NiseCode } from "./nise-code.ts";

enum BeepType {
  Di = "di",
  Dah = "da",
}

// [type, length, sleep]
type Beep = [BeepType, number, number];
const DiLength = 2;
const DahLength = 5;
const DiDahSleep = 2;
const CharSleep = 4;
const WordSleep = 7;

class DiDah {
  static Di(): Beep {
    return [BeepType.Di, DiLength, DiDahSleep];
  }
  static Dah(): Beep {
    return [BeepType.Dah, DahLength, DiDahSleep];
  }
  private nise: NiseCode = new NiseCode();
  constructor() {
  }

  static beep_number(num: number): Beep[] {
    const beep: Beep[] = [];
    const num_str = num.toString();
    for (let i = 0; i < num_str.length; i++) {
      if (num_str[i] === "0") {
        beep.push(DiDah.Dah());
      } else {
        for (let j = 0; j < parseInt(num_str[i]); j++) {
          beep.push(DiDah.Di());
        }
        beep[beep.length - 1][2] = CharSleep;
      }
    }
    beep[beep.length - 1][2] = WordSleep;
    return beep;
  }
  static beep_start(): Beep[] {
    return [DiDah.Di(), DiDah.Dah(), DiDah.Di(), [
      BeepType.Dah,
      DahLength,
      WordSleep,
    ]];
  }
  static beep_end(): Beep[] {
    return [DiDah.Dah(), DiDah.Di(), DiDah.Dah(), [
      BeepType.Di,
      DiLength,
      WordSleep,
    ]];
  }
  encode(text: string): Beep[] {
    const beep: Beep[] = [];
    const lines = text.trim().toUpperCase().split(/[\n\t.]/g)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    lines.forEach((line) => {
      beep.push(...DiDah.beep_start());
      const regex = /([A-Z]+)|([0-9]+)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match[1]) {
          const chars = match[1];
          for (const char of chars) {
            const code = this.nise.encode_char(char);
            for (const c of code) {
              if (c === "0") {
                beep.push(DiDah.Di());
              } else {
                beep.push(DiDah.Dah());
              }
            }
            beep[beep.length - 1][2] = CharSleep;
          }
          beep[beep.length - 1][2] = WordSleep;
        } else if (match[2]) {
          beep.push(...DiDah.beep_number(parseInt(match[2])));
        }
      }
      beep.push(...DiDah.beep_end());
    });
    return beep;
  }

  static beep_length(beep: Beep[]): number {
    return beep.reduce((acc, cur) => acc + cur[1] + cur[2], 0);
  }
}

function encode_riddle(
  text: string = "Behind post board near fallen stone",
): Beep[] {
  const engine = new DiDah();
  const beep = engine.encode(text);
  beep[beep.length - 1][2] = 1; // make it exactly 100 seconds
  console.log("length:", DiDah.beep_length(beep) / 8);
  return beep;
}

Deno.test("beep_number", () => {
  const engine = new DiDah();
  const res = engine.encode("Nise Code");
  console.log(DiDah.beep_length(res) / 8, res);
  const res2 = engine.encode("behind post board near fallen stone");
  console.log(DiDah.beep_length(res2) / 8, res2.slice(40));
});


Deno.test("test_beep_len", () => {
  const beep = encode_riddle();
  const control = beep.reduce((acc, cur) => acc + '.'.repeat(cur[1]) + "-".repeat(cur[2]), "");
  console.log(control);
});
