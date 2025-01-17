import { NiseCode } from "./nise-code.ts";
import * as utils from "./utils.ts";

const game_map = `
################
###CCCCCCC######
##CCCCCCCCC#####
#CCCCCCCCCCCCC##
#CCCCCCCCCCCCCC#
################
`;

// const directions = "61610412668960813737340970790699";
// const directions = "6161049266896089373734097079069950";
const directions = "61610492668960893737340970790699";

class TreasureHunterInitial {
  // map[y][x]
  map: string[][];
  // directions: [dx, dy]
  directions: [number, number][];
  // pos: [x, y]
  pos: [number, number];
  break_point: number;

  classrooms: classroom[][];
  constructor(
    pos: [number, number],
    dir: string = directions,
    map: string = game_map,
  ) {
    this.map = map.trim().split("\n").map((x) => x.split("")).reverse();
    this.directions = dir.split(/(\d{2})/g).filter((x) => x).map(
      (x) => [parseInt(x[0]), parseInt(x[1])],
    );
    this.pos = [pos[0], pos[1]];
    this.break_point = -1;
    this.classrooms = [];
  }
  is_wall(pos = this.pos): boolean {
    return (this.map[pos[1]]?.[pos[0]] ?? "#") === "#";
  }
  run(): boolean {
    if (this.map[this.pos[1]][this.pos[0]] !== "C") {
      // console.log("Start from a wrong place!", this.pos, this.map[this.pos[1]][this.pos[0]]);
      return false;
    }
    for (let i = 0; i < this.directions.length; i++) {
      this.map[this.pos[1]][this.pos[0]] = i.toString();
      this.move_x(this.dir(this.directions[i][0]));
      this.move_y(this.dir(this.directions[i][1]));
      if (this.map[this.pos[1]][this.pos[0]] !== "C") {
        this.break_point = i;
        // console.log("Go to a same place again!", i, this.pos);
        // console.log('direction', this.directions[i], 'to', this.map[this.pos[1]][this.pos[0]]);
        return false;
      }
    }
    this.map[this.pos[1]][this.pos[0]] = "X";
    return true;
  }
  map_str(): string {
    return this.map.reverse().map((x) => x.map((y) => y.padStart(3)).join(""))
      .join("\n");
  }
  // 1-4: 1-4
  // 6-9: -4 - -1
  // 0,5: 0
  private dir(code: number): number {
    if (code > 4) {
      return code - 10;
    }
    return code;
  }
  // move to the next position, if meet the wall, go to round
  private move_x(dx: number) {
    if (dx === 0) {
      return;
    }
    const d = dx > 0 ? 1 : -1;
    while (dx !== 0) {
      this.pos[0] += d;
      dx -= d;
      if (this.map[this.pos[1]][this.pos[0]] === "#") {
        while (this.map[this.pos[1]][this.pos[0] - d] !== "#") {
          this.pos[0] -= d;
        }
      }
    }
  }
  private move_y(dy: number) {
    if (dy === 0) {
      return;
    }
    const d = dy > 0 ? 1 : -1;
    while (dy !== 0) {
      this.pos[1] += d;
      dy -= d;
      if (this.map[this.pos[1]][this.pos[0]] === "#") {
        while (this.map[this.pos[1] - d][this.pos[0]] !== "#") {
          this.pos[1] -= d;
        }
      }
    }
  }
  gen_classrooms() {
    const text_gen = new utils.RandomGenerator(
      utils.EnSource.Mathematica,
      utils.ZhSource.ZhuZiqing,
    );
    const used_names = new Set<string>();
    const name_prefix = ["七年", "八年", "九年", "高一", "高二", "高三"];
    const name_suffix = "123456789".split("").map((x) => "(" + x + ")班");
    this.classrooms = this.map.map((row) =>
      row.filter((s) => s !== "#").map((s) => {
        let front_gate = Math.random() > 0.6;
        let back_gate = Math.random() > 0.6;
        if (!front_gate && !back_gate && s !== "C") {
          if (Math.random() > 0.5) {
            front_gate = true;
          } else {
            back_gate = true;
          }
        }
        let name;
        do {
          name = name_prefix[Math.floor(Math.random() * name_prefix.length)] +
            name_suffix[Math.floor(Math.random() * name_suffix.length)];
        } while (used_names.has(name));
        used_names.add(name);
        let blackboard = text_gen.random_paragraph_mix();
        if (s !== "C") {
          const num = parseInt(s);
          blackboard += this.directions[num].join("") +
            text_gen.random_paragraph_mix();
        }
        return {
          front_gate,
          back_gate,
          blackboard,
          name,
        };
      })
    );
  }
}

function test_code(code: string): [number, number][] {
  const res: [number, number][] = [];
  if (code.length % 2 !== 0) {
    console.log("Invalid code length:", code.length);
    return res;
  }
  for (let j = 1; j < 5; j++) {
    for (let i = 1; i < 16; i++) {
      const th = new TreasureHunterInitial([i, j], code);
      if (th.is_wall()) {
        continue;
      }
      const ok = th.run();
      // if (th.break_point < 12) {
      //   continue;
      // }
      // console.log("x:", i, "y:", j, 'break:', th.break_point);
      // console.log(th.map_str());
      if (ok) {
        res.push([i, j]);
        // console.log("|---------- OK ----------|");
        // console.log("|---------- OK ----------|");
      }
    }
  }
  console.log("Testing code:", code, res);
  return res;
}
function test_str(nise: NiseCode, str: string): [number, number][] {
  const code0 = nise.encode_sentence_long(str);
  const res = test_code(code0.replaceAll(/[^0-9]/g, ""));
  if (code0.includes("-")) {
    res.push(
      ...test_code(
        code0.replace(/-(\d)/g, ([_, s]) => (10 - parseInt(s)).toString())
          .replaceAll(/[^0-9]/g, ""),
      ),
    );
  }
  const code1 = nise.encode_sentence_dec(str);
  res.push(...test_code(code1.replaceAll(/[^0-9]/g, "")));
  if (code1.includes("-")) {
    res.push(
      ...test_code(
        code1.replace(/-(\d)/g, ([_, s]) => (10 - parseInt(s)).toString())
          .replaceAll(/[^0-9]/g, ""),
      ),
    );
  }
  return res;
}

interface classroom {
  front_gate: boolean;
  back_gate: boolean;
  blackboard: string;
  name: string;
}
function classroom_str(classrooms: classroom): string {
  return classrooms.front_gate + "|" + classrooms.back_gate + "|" +
    classrooms.name + "|" + classrooms.blackboard + "|";
}

Deno.test("treasure hunter", () => {
  const th = new TreasureHunterInitial([4, 1], "616104126689");
  console.log(th.run());
  console.log(th.map_str());
});

Deno.test("treasure hunter all", () => {
  const nise = new NiseCode();

  // console.log("--------------------");
  // console.log(test_str(nise, "go to room 608 in office block"));
  // console.log(test_str(nise, "to room 608 in office block"));
  // console.log(test_str(nise, "room 608 in office block"));
  // console.log(test_str(nise, "room six zero eight in office block"));
  // console.log(test_str(nise, "room 6 floor 8 in office block"));
  // console.log(test_str(nise, "room six floor eight in office block"));

  // console.log("--------------------");
  // console.log(test_str(nise, "go to room 608 in office building"));
  // console.log(test_str(nise, "to room 608 in office building"));
  // console.log(test_str(nise, "room 608 in office building"));
  // console.log(test_str(nise, "room six zero eight in office building"));
  // console.log(test_str(nise, "room 6 floor 8 in office building"));
  // console.log(test_str(nise, "room six floor eight in office building"));

  // console.log("--------------------");
  // console.log(test_str(nise, "six zero eight room of office building"));
  // console.log(test_str(nise, "six zero eight of office building"));
  // console.log(test_str(nise, "six zero eight room in office building"));
  // console.log(test_str(nise, "six zero eight in office building"));

  console.log("--------------------");
  // console.log(test_str(nise, "office building room six zero eight"));
  // console.log(test_str(nise, "office building six zero eight"));
  console.log(test_str(nise, "office block room six zero eight")); // this is the answer
  // console.log(test_str(nise, "office block six zero eight"));

  console.log("--------------------");
  console.log(
    test_code(nise.encode_sentence_long("office block room six zero eight")),
  );
});

Deno.test("check answer", () => {
  const nise = new NiseCode();
  const sentence = "Office block room six zero eight.";
  const code = nise.encode_sentence_long(sentence);
  const th = new TreasureHunterInitial([7, 4], code);
  console.log("pass", th.run());
  console.log(th.map_str());
  console.log("break", th.break_point);
  console.log("final", th.pos);
  console.log(sentence);
  console.log(code);
  console.log(nise.long(code));
});

Deno.test("generate classrooms", () => {
  const code = "23667651890199435457267945381141213966";
  const th = new TreasureHunterInitial([7, 4], code);
  th.gen_classrooms();
  console.log(
    th.classrooms.map((x) =>
      x.map((y) => classroom_str(y).substring(0, 40)).join("\n")
    ).join("\n\n"),
  );
});
