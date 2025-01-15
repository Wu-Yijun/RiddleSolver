import { assertEquals } from "jsr:@std/assert";
import { NiseCode } from "./nise-code.ts";

interface Person {
  /** 1: truth, 2: false, 3: myth */
  personality: number;
  /** 1: red, 2: yellow, 3: blue, 4: green */
  color: number;
  /** 1 - 8 */
  table: number;
}
enum Personality {
  Truth = 1,
  False = 2,
  Myth = 3,
}
enum Color {
  Red = 1,
  Yellow = 2,
  Blue = 3,
  Green = 4,
}
enum PersonName {
  甲 = 1,
  乙 = 2,
  丙 = 3,
  丁 = 4,
  戊 = 5,
  己 = 6,
  庚 = 7,
  辛 = 8,
}
const size = 8;
const names = "甲乙丙丁戊己庚辛";
const names_color = "红黄蓝绿";
const names_personality = "真假谜";
const order_raw = "甲辛丙庚辛丁乙丙辛己戊己丙甲丁庚丁乙戊乙庚己甲戊";
const order = order_raw.split("").map((a) => names.indexOf(a) + 1);

// 1. sum: ((10 * p + c) * t) ** 2 = 121690
// 2. sum: ((10 * p + c) * (t + 10 * i)) ** 2 = 16896910
// 3. sum: (t + 10 * i) * (t ** 2) = 10106
// 4. sum: (t ** 2) * x = 10106

const result1 = 121690;
const result2 = 16896910;
const result3 = 10106;
const result4 = 10106;

const result: Person[] = [
  { personality: 3, color: 3, table: 4 }, // 甲
  { personality: 2, color: 4, table: 8 }, // 乙
  { personality: 1, color: 4, table: 2 }, // 丙
  { personality: 1, color: 3, table: 1 }, // 丁
  { personality: 1, color: 2, table: 6 }, // 戊
  { personality: 2, color: 2, table: 7 }, // 己
  { personality: 3, color: 4, table: 5 }, // 庚
  { personality: 3, color: 1, table: 3 }, // 辛
];

/**
 * find all possible parameters ai that satisfy the equations
 * sum(pc[ai] * t1[i]) = result1
 * sum(pc[ai] * t2[i]) = result2
 * @param t1 weight list 1 of length `size = 8`
 * @param t2 weight list 2 of length `size = 8`
 * @param pc array to use
 * @param r1 result 1
 * @param r2 result 2
 */
function judge_12(
  t1: number[],
  t2: number[],
  pc: number[],
  r1: number = result1,
  r2: number = result2,
): number[][] {
  const n = t1.length;

  // Helper function to calculate all possible combinations of a subset
  function generate_combinations(t1: number[], t2: number[]) {
    const combinations: Map<
      string,
      { indices: number[]; sum1: number; sum2: number }
    > = new Map();
    const combination_num = pc.length ** t1.length;
    for (let i = 0; i < combination_num; i++) {
      let sum1 = 0, sum2 = 0;
      let mask = i;
      for (let j = 0; j < t1.length; j++) {
        const index = mask % pc.length;
        mask = Math.floor(mask / pc.length);
        sum1 += pc[index] * t1[j];
        sum2 += pc[index] * t2[j];
      }
      const key = `${sum1},${sum2}`;
      if (!combinations.has(key)) {
        combinations.set(key, { indices: [i], sum1, sum2 });
      } else {
        combinations.get(key)!.indices.push(i);
      }
    }
    return combinations;
  }
  function to_pcs(mask: number, len: number): number[] {
    const res: number[] = [];
    for (let i = 0; i < len; i++) {
      res.push(pc[mask % pc.length]);
      mask = Math.floor(mask / pc.length);
    }
    return res;
  }

  // Split indices into two halves
  const l = Math.floor(n / 2);
  // Generate all combinations for both halves
  const leftCombinations = generate_combinations(
    t1.slice(0, l),
    t2.slice(0, l),
  );
  const rightCombinations = generate_combinations(t1.slice(l), t2.slice(l));

  // Match combinations between left and right
  const results: number[][] = [];
  for (const [_key, leftCombo] of leftCombinations) {
    const targetSum1 = r1 - leftCombo.sum1;
    const targetSum2 = r2 - leftCombo.sum2;
    const rightKey = `${targetSum1},${targetSum2}`;
    if (rightCombinations.has(rightKey)) {
      const rightCombo = rightCombinations.get(rightKey)!;
      for (const leftIndex of leftCombo.indices) {
        for (const rightIndex of rightCombo.indices) {
          results.push([
            ...to_pcs(leftIndex, l),
            ...to_pcs(rightIndex, n - l),
          ]);
        }
      }
    }
  }

  return results;
}

function solve_12(tables: number[][]): Person[][] {
  const pc: number[] = [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34]
    .map((a) => a * a);
  const res: Person[][] = [];
  for (let i = 0; i < tables.length; i++) {
    const table1 = tables[i].map((x) => x * x);
    const table2 = tables[i]
      .map((x, i) => (x + 10 * (i + 1)) * (x + 10 * (i + 1)));
    const pcs = judge_12(table1, table2, pc);
    for (const pc of pcs) {
      const persons: Person[] = [];
      for (let j = 0; j < size; j++) {
        const pc0 = Math.sqrt(pc[j]);
        persons.push({
          personality: Math.floor(pc0 / 10),
          color: pc0 % 10,
          table: tables[i][j],
        });
      }
      res.push(persons);
    }
    console.log(`table ${i + 1}/${tables.length}: ${pcs.length}`);
  }
  return res;
}
function solve_3(): number[][] {
  // 3. sum: (t + 10 * i) * (t ** 2) = 10106
  // solve 3
  const table: boolean[] = Array(size + 1).fill(false);
  const table_index: number[] = Array(size + 1).fill(0); // 1 := size
  const sums: number[] = Array(size + 1).fill(0);
  // const table_index = [1, 2, 3, 4];
  let index = 0;
  // let count = 0;
  const res: number[][] = [];
  while (true) {
    // fill table index
    while (index < size) {
      if (index < 0) {
        return res;
      }
      let i = table_index[index];
      table[i] = false;
      i += 1;
      while (i <= size && table[i]) {
        i += 1;
      }
      if (i > size) {
        index -= 1;
        continue;
      }
      table_index[index] = i;
      table_index[index + 1] = 0;
      table[i] = true;
      sums[index + 1] = sums[index] + (i + 10 * (index + 1)) * i * i;
      index += 1;
    }
    index = size - 1;
    // check 3
    if (sums[size] === result3) {
      res.push(table_index.slice(0, -1));
    }
  }
}
/**
 * solve 3 without considering non-overlapping
 */
function solve_3_all(): number[][] {
  function generate_combinations(n: number, offset: number) {
    const res: Map<number, number[]> = new Map();
    const len = size ** n;
    for (let i = 0; i < len; i++) {
      let mask = i;
      let sum = 0;
      for (let j = 0; j < n; j++) {
        const t = mask % size + 1;
        sum += (t + 10 * (j + offset + 1)) * t * t;
        mask = Math.floor(mask / size);
      }
      if (!res.has(sum)) {
        res.set(sum, [i]);
      } else {
        res.get(sum)!.push(i);
      }
    }
    return res;
  }
  function to_index(mask: number, len: number): number[] {
    const res: number[] = [];
    for (let i = 0; i < len; i++) {
      res.push(mask % size + 1);
      mask = Math.floor(mask / size);
    }
    return res;
  }
  const l = Math.floor(size / 2);
  const leftCombinations = generate_combinations(l, 0);
  const rightCombinations = generate_combinations(size - l, l);
  const res: number[][] = [];
  for (const [sum1, leftIndices] of leftCombinations) {
    const targetSum = result3 - sum1;
    if (rightCombinations.has(targetSum)) {
      for (const leftIndex of leftIndices) {
        for (const rightIndex of rightCombinations.get(targetSum)!) {
          res.push([
            ...to_index(leftIndex, l),
            ...to_index(rightIndex, size - l),
          ]);
        }
      }
    }
  }
  return res;
}

function solve_4(tables: number[][], x_arr: number[]): number[][] {
  const res: number[][] = [];
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    let sum = 0;
    for (let j = 0; j < size; j++) {
      // sum += table[j] * table[j] * x_arr[j];
      sum += table[j] * x_arr[j];
    }
    console.log(sum);
    if (sum === result4) {
      console.log(table);
      res.push(table);
    }
  }
  return res;
}
function calc_4(persons: Person[]) {
  let sum = 0;
  for (let i = 0; i < order.length; i++) {
    const p = persons[order[i] - 1];
    sum += (p.table * p.color + p.personality * 10) * (i + 1);
    sum -= p.table % p.color;
  }
  return sum;
}

enum Judgement {
  Truth = 1,
  False = 2,
  Myth = 3,
}
function new_judge(...cases: boolean[]): Judgement {
  const count = cases.filter((a) => a).length;
  if (count === cases.length) {
    return Judgement.Truth;
  }
  if (count === 0) {
    return Judgement.False;
  }
  return Judgement.Myth;
}
function judges(judge: Judgement, ...cases: boolean[]): Judgement {
  switch (judge) {
    case Judgement.Truth:
      return cases.includes(false) ? Judgement.Myth : Judgement.Truth;
    case Judgement.False:
      return cases.includes(true) ? Judgement.Myth : Judgement.False;
    case Judgement.Myth:
      return Judgement.Myth;
  }
}
function judger(...judge: Judgement[]): Judgement {
  const judge0 = judge[0];
  for (let i = 1; i < judge.length; i++) {
    if (judge[i] !== judge0) {
      return Judgement.Myth;
    }
  }
  return judge0;
}
interface GameJudge {
  person: number;
  judgement: () => Judgement;
}
class Game {
  persons: Person[];
  judges: GameJudge[];
  index: number;
  person_id: number;
  last_person: number;
  table: number;
  color: Color;
  personality: Personality;
  // [person id - 1][first, second, third]
  claims: Judgement[][];
  leaved: number[];
  constructor(layout: Person[] = result) {
    this.persons = layout;
    this.judges = [
      { person: order[0], judgement: () => this.judge_1() },
      { person: order[1], judgement: () => this.judge_2() },
      { person: order[2], judgement: () => this.judge_3() },
      { person: order[3], judgement: () => this.judge_4() },
      { person: order[4], judgement: () => this.judge_5() },
      { person: order[5], judgement: () => this.judge_6() },
      { person: order[6], judgement: () => this.judge_7() },
      { person: order[7], judgement: () => this.judge_8() },
      { person: order[8], judgement: () => this.judge_9() },
      { person: order[9], judgement: () => this.judge_10() },
      { person: order[10], judgement: () => this.judge_11() },
      { person: order[11], judgement: () => this.judge_12() },
      { person: order[12], judgement: () => this.judge_13() },
      { person: order[13], judgement: () => this.judge_14() },
      { person: order[14], judgement: () => this.judge_15() },
      { person: order[15], judgement: () => this.judge_16() },
      { person: order[16], judgement: () => this.judge_17() },
      { person: order[17], judgement: () => this.judge_18() },
      { person: order[18], judgement: () => this.judge_19() },
      { person: order[19], judgement: () => this.judge_20() },
      { person: order[20], judgement: () => this.judge_21() },
      { person: order[21], judgement: () => this.judge_22() },
      { person: order[22], judgement: () => this.judge_23() },
      { person: order[23], judgement: () => this.judge_24() },
    ];
    this.index = 0;
    this.person_id = 1;
    this.last_person = 1;
    this.table = this.persons[0].table;
    this.color = this.persons[0].color;
    this.personality = this.persons[0].personality;
    this.claims = Array.from({ length: size }, () => []);
    this.leaved = [];
  }
  run(): boolean {
    this.index = 0;
    while (this.index < this.judges.length) {
      const { person, judgement } = this.judges[this.index];
      this.index += 1;
      console.log("Testing", this.index, "person:", names[person - 1]);
      this.last_person = this.person_id;
      this.person_id = person;
      this.personality = this.persons[person - 1].personality;
      this.color = this.persons[person - 1].color;
      this.table = this.persons[person - 1].table;
      const judge = judgement();
      this.claims[person - 1].push(judge);
      if (this.claims[person - 1].length == 3) {
        this.leaved.push(person);
      }
      const next_person = this.judges[this.index]?.person ?? 2;
      const cmp = this.cmp_table(person, next_person);
      switch (this.personality) {
        case Personality.Truth:
          if (judge === Judgement.False || judge === Judgement.Myth) {
            console.log(
              "Judgement failed",
              this.index,
              "Judge should be Truth but got",
              judge,
            );
            return false;
          }
          if (cmp !== -1) {
            console.log(
              "Order failed",
              this.index,
              "Truth Should be this(" + this.persons[person - 1].table +
                ") < next(" + this.persons[next_person - 1].table + ").",
            );
            return false;
          }
          break;
        case Personality.False:
          if (judge === Judgement.Truth || judge === Judgement.Myth) {
            console.log(
              "Judgement failed",
              this.index,
              "Judge should be False but got",
              judge,
            );
            return false;
          }
          if (cmp !== 1) {
            console.log(
              "Order failed",
              this.index,
              "False Should be this(" + this.persons[person - 1].table +
                ") > next(" + this.persons[next_person - 1].table + ").",
            );
            return false;
          }
          break;
        case Personality.Myth:
          if (judge === Judgement.Myth) {
            console.log(
              "Judgement failed",
              this.index,
              "Judge should be True or False but got",
              judge,
            );
            return false;
          } else if (judge === Judgement.False) {
            if (cmp !== -1) {
              console.log(
                "Order failed",
                this.index,
                "With False of Myth, Should be this(" +
                  this.persons[person - 1].table + ") < next(" +
                  this.persons[next_person - 1].table + ").",
              );
              return false;
            }
          } else if (judge === Judgement.Truth) {
            if (cmp !== 1) {
              console.log(
                "Order failed",
                this.index,
                "With Truth of Myth, Should be this(" +
                  this.persons[person - 1].table + ") > next(" +
                  this.persons[next_person - 1].table + ").",
              );
              return false;
            }
          }
          break;
      }
    }
    return true;
  }
  count_color(color: Color): number {
    return this.persons.filter((a) => a.color === color).length;
  }
  count_personality(personality: Personality): number {
    return this.persons.filter((a) => a.personality === personality).length;
  }
  /**
   * @param p1 person id 1
   * @param p2 person id 2
   * @returns 0: p1=p2, 1: p1>p2, -1: p1<p2
   */
  cmp_table(p1: number, p2: number): number {
    if (this.persons[p1 - 1].table < this.persons[p2 - 1].table) {
      return -1;
    } else if (this.persons[p1 - 1].table === this.persons[p2 - 1].table) {
      return 0;
    } else {
      return 1;
    }
  }
  private judge_1(): Judgement {
    return new_judge(this.count_color(this.color) - 1 === 1);
  }
  private judge_2(): Judgement {
    const judge = new_judge(this.personality === Personality.Myth);
    return judges(judge, judge === Judgement.Truth);
  }
  private judge_3(): Judgement {
    const judge = new_judge(this.count_personality(Personality.Truth) === 3);
    return judges(judge, this.personality === Personality.Truth);
  }
  private judge_4(): Judgement {
    const appeared = this.judges.slice(0, this.index).map((a) => a.person);
    const myth =
      this.persons.filter((a, i) =>
        a.personality === Personality.Myth && !appeared.includes(i + 1)
      ).length;
    return new_judge(myth === 0);
  }
  private judge_5(): Judgement {
    return new_judge(
      this.count_color(Color.Red) === 1,
      this.color === Color.Red,
      this.count_color(Color.Blue) === 2,
      this.persons[PersonName.丁 - 1].color === Color.Blue,
    );
  }
  private judge_6(): Judgement {
    return new_judge(this.table === 1);
  }
  private judge_7(): Judgement {
    return new_judge(
      this.personality === Personality.Truth,
      this.personality === this.persons[PersonName.辛 - 1].personality,
      this.color !== this.persons[PersonName.丙 - 1].color,
    );
  }
  private judge_8(): Judgement {
    return new_judge(
      this.color === Color.Green,
      this.persons[this.last_person - 1].color === Color.Green,
      this.persons[this.last_person - 1].personality !==
        this.persons[PersonName.辛 - 1].personality,
    );
  }
  private judge_9(): Judgement {
    return new_judge(this.persons[0].color === Color.Red);
  }
  private judge_10(): Judgement {
    const leaved = this.leaved[this.leaved.length - 1];
    let judge = Judgement.False;
    if (leaved) {
      const [c0, c1, c2] = this.claims[leaved - 1];
      judge = new_judge(judge === c0 && judge === c1 && judge === c2);
    }
    const p1 = this.persons[PersonName.丙 - 1];
    const p2 = this.persons[PersonName.丁 - 1];
    return judges(
      judge,
      p1.personality === Personality.False &&
          p2.personality === Personality.Truth ||
        p1.personality === Personality.Truth &&
          p2.personality === Personality.False,
      p1.table + p2.table === 12,
    );
  }
  private judge_11(): Judgement {
    return new_judge(
      this.persons[this.last_person - 1].personality === Personality.False,
      this.color === this.persons[this.last_person - 1].color,
    );
  }
  private judge_12(): Judgement {
    return new_judge(
      this.personality === Personality.Myth,
      this.persons[PersonName.丙 - 1].personality === Personality.Myth,
    );
  }
  private judge_13(): Judgement {
    return new_judge(
      this.claims[this.last_person - 1].includes(Judgement.False),
      this.persons[PersonName.庚 - 1].personality === Personality.Myth,
      this.persons[PersonName.丁 - 1].color === Color.Blue,
    );
  }
  private judge_14(): Judgement {
    const myth = this.persons.filter((p) => p.personality === Personality.Myth)
      .map((p) => p.table).sort();
    const statement1 = myth[myth.length - 1] - myth[0] === myth.length - 1;
    const leaved = this.persons.filter((_, i) => this.leaved.includes(i + 1))
      .map((p) => p.table).sort();
    const statement2 =
      leaved[leaved.length - 1] - leaved[0] === leaved.length - 1;
    const fake = this.persons.filter((p) => p.personality === Personality.False)
      .map((p) => p.table).sort();
    const statement3 = fake[fake.length - 1] - fake[0] === fake.length - 1;
    return new_judge(
      (statement1 ? 0 : 1) + (statement2 ? 0 : 1) <= 1,
      statement3,
    );
  }
  private judge_15(): Judgement {
    const blues = this.persons.filter((p) =>
      p.color === Color.Blue && p.personality !== Personality.Truth
    );
    let judge = new_judge(blues.length > 0);
    const leaved = this.persons
      .filter((_, i) => !this.leaved.includes(i + 1))
      .sort((a, b) =>
        (a.color - b.color) + (a.personality - b.personality) * 0.1
      );
    judge = judges(
      judge,
      leaved[0].color === leaved[1].color,
      leaved[1].color !== leaved[2].color,
      leaved[2].color === leaved[3].color,
      leaved[3].color !== leaved[4].color,
      leaved[4].color === leaved[5].color,
    );
    const p1 = leaved[0].personality + "," + leaved[1].personality;
    const p2 = leaved[2].personality + "," + leaved[3].personality;
    const p3 = leaved[4].personality + "," + leaved[5].personality;
    // console.log("Not assert yet the symmetry of the table");
    return judges(judge, p1 !== p2, p1 !== p3, p2 !== p3);
  }
  private judge_16(): Judgement {
    return new_judge(
      this.persons[PersonName.甲 - 1].table < this.table,
      this.persons[PersonName.戊 - 1].table > this.table,
      this.persons[PersonName.丁 - 1].color === Color.Blue,
    );
  }
  private judge_17(): Judgement {
    // console.log(this.claims);
    const orders = this.judges.slice(0, this.index).map((a) => a.person);
    const num5 = this.persons.findIndex((p) => p.table === 5) + 1;
    const len = orders.lastIndexOf(num5);
    const each_num = Array.from({ length: size }, (_) => 0);
    for (let i = 0; i < len; i++) {
      each_num[orders[i] - 1] += 1;
    }
    const tested = [0, 0, 0, 0, 0, 0];
    // check is each num 1 is respectively True, False, Myth
    for (let i = 0; i < size; i++) {
      if (each_num[i] === 1) {
        tested[this.persons[i].personality - 1] += 1;
      }
      if (each_num[i] === 2) {
        tested[this.persons[i].personality - 1 + 3] += 1;
      }
    }
    const judge1 = new_judge(tested.join("") === "111111");
    for (let i = len; i < orders.length; i++) {
      each_num[orders[i] - 1] += 1;
    }
    const tables1 = each_num.map((v, i) => v === 1 ? this.persons[i].table : 0)
      .filter((x) => x != 0);
    const judge2 = new_judge(tables1.every((x) => x % 2 === 0));
    const tables2 = each_num.map((v, i) => v === 2 ? this.persons[i].table : 0)
      .filter((x) => x != 0);
    const judge3 = new_judge(
      tables1.reduce((acc, v) => acc + v, 0) + 2 ===
        tables2.reduce((acc, v) => acc + v, 0),
    );
    let left_g = 0;
    let left_y = 0;
    for (let i = this.index; i < this.judges.length; i++) {
      const p = this.persons[this.judges[i].person - 1];
      // console.log(p.color);
      if (p.color === Color.Green) {
        left_g += 1;
      }
      if (p.color === Color.Yellow) {
        left_y += 1;
      }
    }
    // console.log(left_g, left_y)
    const judge4 = new_judge(left_g === left_y);
    return judger(judge1, judge2, judge3, judge4);
  }
  private judge_18(): Judgement {
    const tfm = [0, 0, 0];
    const color = [0, 0, 0];
    for (let i = this.index; i < this.judges.length; i++) {
      const p = this.persons[this.judges[i].person - 1];
      tfm[p.personality - 1] += 1;
      if (p.color != Color.Red) {
        color[p.color - 2] += 1;
      }
    }
    const sum = tfm[0] + tfm[1] + tfm[2];
    const prod = color[0] * color[1] * color[2];
    // console.log(tfm, color);
    return new_judge(
      (Math.max(...tfm) + Math.min(...tfm)) * 3 === sum * 2 &&
        (Math.max(...color) * Math.min(...color)) ** 3 === prod ** 2,
    );
  }
  private judge_19(): Judgement {
    let sums = [0, 0, 0];
    for (let i = 0; i < size; i++) {
      const p = this.persons[i];
      const l = p.personality * 10 + p.color;
      sums[0] += (l * p.table) ** 2;
      sums[1] += (l * (p.table + (i + 1) * 10)) ** 2;
      sums[2] += (p.table ** 2) * (p.table + (i + 1) * 10);
    }
    // console.log(sums);
    return new_judge(
      sums[0] === 121690,
      sums[1] === 16896910,
      sums[2] === 10106,
    );
  }
  private judge_20(): Judgement {
    let colors = [0, 0, 0];
    for (let i = this.index; i < this.judges.length; i++) {
      const p = this.persons[this.judges[i].person - 1];
      if (colors[p.personality - 1] === 0) {
        colors[p.personality - 1] = p.color;
      } else if (colors[p.personality - 1] !== p.color) {
        colors[p.personality - 1] = -p.personality;
      }
    }
    // console.log(colors);
    return new_judge(colors[0] !== colors[1], colors[2] > 0);
  }
  private judge_21(): Judgement {
    return new_judge(
      this.table === 2 || this.table === 3,
      this.persons[PersonName.己 - 1].table === this.table + 4,
      this.persons[PersonName.己 - 1].color === Color.Red,
    );
  }
  private judge_22(): Judgement {
    const colors = [0, 0, 0, 0];
    for (let i = 0; i < size; i++) {
      const color = i !== (PersonName.甲 - 1)
        ? this.persons[i].color
        : Color.Red;
      colors[color - 1] += 1;
    }
    // console.log(colors);
    const color_set: Set<number> = new Set(colors);
    return new_judge(
      this.persons[PersonName.甲 - 1].color === Color.Green,
      color_set.size === 4,
    );
  }
  private judge_23(): Judgement {
    return new_judge(this.table === 5);
  }
  private judge_24(): Judgement {
    let sum = 0;
    for (let i = 0; i < this.judges.length; i++) {
      const p = this.persons[this.judges[i].person - 1];
      sum += (p.table * p.color + p.personality * 10) * (i + 1) -
        p.table % p.color;
    }
    return new_judge(sum === 10106);
  }
}

class Encoder {
  persons: Person[];
  color_max: number;
  color_min: number;
  personality_max: number;
  personality_min: number;
  to_num: Map<string, string>;
  zeros: string[];
  nines: string[];
  empties: string[];
  digits: string[];
  nise: NiseCode;
  constructor(persons: Person[] = result) {
    this.persons = persons;
    this.zeros = [];
    this.nines = [];
    this.empties = [];
    this.digits = [];
    this.to_num = new Map();
    this.nise = new NiseCode();
    const color_num = [0, 0, 0, 0];
    const personality_num = [0, 0, 0];
    for (let i = 0; i < size; i++) {
      const p = persons[i];
      color_num[p.color - 1] += 1;
      personality_num[p.personality - 1] += 1;
      this.to_num.set(names[i], p.table.toString());
      this.digits[p.table - 1] = names[i];
    }
    this.color_max = Math.max(...color_num);
    this.color_min = Math.min(...color_num);
    for (let i = 0; i < color_num.length; i++) {
      if (color_num[i] === this.color_max) {
        this.to_num.set(names_color[i], "9");
        this.nines.push(names_color[i]);
      } else if (color_num[i] === this.color_min) {
        this.to_num.set(names_color[i], "0");
        this.zeros.push(names_color[i]);
      } else {
        this.to_num.set(names_color[i], "");
        this.empties.push(names_color[i]);
      }
    }
    this.personality_max = Math.max(...personality_num);
    this.personality_min = Math.min(...personality_num);
    for (let i = 0; i < personality_num.length; i++) {
      if (personality_num[i] === this.personality_max) {
        this.to_num.set(names_personality[i], "9");
        this.nines.push(names_personality[i]);
      } else if (personality_num[i] === this.personality_min) {
        this.to_num.set(names_personality[i], "0");
        this.zeros.push(names_personality[i]);
      } else {
        this.to_num.set(names_personality[i], "");
        this.empties.push(names_personality[i]);
      }
    }
  }
  sentence_to_nise(sentence: string): string {
    let res = "";
    for (const c of sentence) {
      res += this.to_num.get(c) ?? c;
    }
    return res;
  }
  sentence(sentence: string): string {
    return this.sentence_to_nise(sentence).replaceAll(
      /-?\d+/g,
      (s) => this.nise.long(s),
    );
  }
  encode_nise(nise: string): string {
    return nise.replaceAll(
      /\d/g,
      (s) => {
        const n = parseInt(s);
        // let res = "";
        let res = Math.random() > 0.1
          ? ""
          : this.empties[Math.floor(Math.random() * this.empties.length)];
        if (0 < n && n < 9) {
          res += this.digits[n - 1];
        } else if (n === 0) {
          res += this.zeros[Math.floor(Math.random() * this.zeros.length)];
        } else {
          res += this.nines[Math.floor(Math.random() * this.nines.length)];
        }
        return res;
      },
    );
  }
}

Deno.test("solve", () => {
  const tables = solve_3();
  // console.log(tables.map((a) => a.join("")).join("\n"));
  console.log(tables.length);
  const persons = solve_12(tables);
  console.log(persons);
});

Deno.test("solve_all", () => {
  const tables = solve_3_all();
  // console.log(tables.map((a) => a.join("")).sort().slice(200,300).join("\n"));
  // console.log(tables.length);
  console.log(tables.length);
  const persons = solve_12(tables);
  console.log(persons);
  console.log(persons.length);
});

Deno.test("judge", () => {
  const table = [4, 8, 2, 1, 6, 7, 5, 3];
  const table1 = table.map((x) => x * x);
  const table2 = table
    .map((x, i) => (x + 10 * (i + 1)) * (x + 10 * (i + 1)));
  const pc: number[] = [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34]
    .map((a) => a * a);
  const res = judge_12(table1, table2, pc)
    .map((a) => a.map((b) => Math.sqrt(b)));
  console.log(res);
});

Deno.test("compare-solves-4", () => {
  const tables: Person[][] = [
    [
      { personality: 2, color: 4, table: 1 }, // 甲
      { personality: 3, color: 2, table: 8 }, // 乙
      { personality: 3, color: 2, table: 3 }, // 丙
      { personality: 1, color: 1, table: 7 }, // 丁
      { personality: 2, color: 3, table: 5 }, // 戊
      { personality: 3, color: 3, table: 2 }, // 己
      { personality: 1, color: 1, table: 6 }, // 庚
      { personality: 3, color: 4, table: 4 }, // 辛
    ],
    [
      { personality: 3, color: 3, table: 4 }, // 甲
      { personality: 2, color: 4, table: 8 }, // 乙
      { personality: 1, color: 4, table: 2 }, // 丙
      { personality: 1, color: 3, table: 1 }, // 丁
      { personality: 1, color: 2, table: 6 }, // 戊
      { personality: 2, color: 2, table: 7 }, // 己
      { personality: 3, color: 4, table: 5 }, // 庚
      { personality: 3, color: 1, table: 3 }, // 辛
    ],
    [
      { personality: 3, color: 3, table: 6 },
      { personality: 1, color: 4, table: 2 },
      { personality: 3, color: 1, table: 3 },
      { personality: 1, color: 1, table: 8 },
      { personality: 2, color: 2, table: 7 },
      { personality: 1, color: 2, table: 1 },
      { personality: 3, color: 1, table: 5 },
      { personality: 3, color: 3, table: 4 },
    ],
    [
      { personality: 2, color: 4, table: 8 },
      { personality: 2, color: 1, table: 5 },
      { personality: 2, color: 1, table: 2 },
      { personality: 1, color: 2, table: 1 },
      { personality: 2, color: 4, table: 4 },
      { personality: 1, color: 2, table: 6 },
      { personality: 3, color: 4, table: 3 },
      { personality: 3, color: 1, table: 7 },
    ],
  ];
  console.log(tables.map(calc_4).join("\n"));
});
Deno.test("compare-solves", () => {
  const tables: Person[][] = [
    [
      { personality: 2, color: 4, table: 8 },
      { personality: 2, color: 1, table: 5 },
      { personality: 2, color: 1, table: 2 },
      { personality: 1, color: 2, table: 1 },
      { personality: 2, color: 4, table: 4 },
      { personality: 1, color: 2, table: 6 },
      { personality: 3, color: 4, table: 3 },
      { personality: 3, color: 1, table: 7 },
    ],
    [
      { personality: 3, color: 3, table: 4 },
      { personality: 2, color: 4, table: 8 },
      { personality: 1, color: 4, table: 2 },
      { personality: 1, color: 3, table: 1 },
      { personality: 1, color: 2, table: 6 },
      { personality: 2, color: 2, table: 7 },
      { personality: 3, color: 4, table: 5 },
      { personality: 3, color: 1, table: 3 },
    ],
    [
      { personality: 2, color: 4, table: 4 },
      { personality: 2, color: 1, table: 6 },
      { personality: 3, color: 2, table: 3 },
      { personality: 3, color: 3, table: 1 },
      { personality: 2, color: 1, table: 2 },
      { personality: 2, color: 4, table: 7 },
      { personality: 3, color: 1, table: 7 },
      { personality: 2, color: 4, table: 4 },
    ],
    [
      { personality: 1, color: 4, table: 5 },
      { personality: 3, color: 2, table: 2 },
      { personality: 3, color: 3, table: 3 },
      { personality: 2, color: 3, table: 5 },
      { personality: 3, color: 2, table: 7 },
      { personality: 3, color: 2, table: 3 },
      { personality: 2, color: 1, table: 6 },
      { personality: 2, color: 4, table: 5 },
    ],
    [
      { personality: 2, color: 1, table: 7 },
      { personality: 1, color: 3, table: 2 },
      { personality: 2, color: 1, table: 4 },
      { personality: 1, color: 1, table: 1 },
      { personality: 3, color: 2, table: 6 },
      { personality: 2, color: 3, table: 2 },
      { personality: 2, color: 4, table: 8 },
      { personality: 3, color: 2, table: 4 },
    ],
    [
      { personality: 2, color: 4, table: 2 },
      { personality: 3, color: 1, table: 8 },
      { personality: 1, color: 3, table: 2 },
      { personality: 3, color: 3, table: 2 },
      { personality: 3, color: 1, table: 3 },
      { personality: 2, color: 2, table: 6 },
      { personality: 1, color: 3, table: 7 },
      { personality: 3, color: 4, table: 4 },
    ],
    [
      { personality: 3, color: 1, table: 4 },
      { personality: 3, color: 4, table: 2 },
      { personality: 2, color: 2, table: 5 },
      { personality: 2, color: 4, table: 5 },
      { personality: 3, color: 2, table: 4 },
      { personality: 3, color: 3, table: 1 },
      { personality: 3, color: 3, table: 7 },
      { personality: 1, color: 1, table: 6 },
    ],
    [
      { personality: 2, color: 4, table: 4 },
      { personality: 3, color: 4, table: 5 },
      { personality: 3, color: 3, table: 4 },
      { personality: 1, color: 2, table: 2 },
      { personality: 3, color: 2, table: 1 },
      { personality: 3, color: 1, table: 5 },
      { personality: 1, color: 1, table: 7 },
      { personality: 3, color: 1, table: 6 },
    ],
    [
      { personality: 2, color: 4, table: 1 },
      { personality: 3, color: 2, table: 8 },
      { personality: 3, color: 2, table: 3 },
      { personality: 1, color: 1, table: 7 },
      { personality: 2, color: 3, table: 5 },
      { personality: 3, color: 3, table: 2 },
      { personality: 1, color: 1, table: 6 },
      { personality: 3, color: 4, table: 4 },
    ],
    [
      { personality: 2, color: 1, table: 6 },
      { personality: 2, color: 4, table: 8 },
      { personality: 2, color: 4, table: 8 },
      { personality: 2, color: 4, table: 2 },
      { personality: 2, color: 4, table: 1 },
      { personality: 3, color: 3, table: 3 },
      { personality: 1, color: 4, table: 7 },
      { personality: 3, color: 3, table: 3 },
    ],
    [
      { personality: 1, color: 3, table: 8 },
      { personality: 1, color: 3, table: 6 },
      { personality: 2, color: 2, table: 3 },
      { personality: 1, color: 3, table: 3 },
      { personality: 1, color: 2, table: 1 },
      { personality: 3, color: 4, table: 7 },
      { personality: 3, color: 4, table: 5 },
      { personality: 2, color: 3, table: 5 },
    ],
    [
      { personality: 1, color: 1, table: 8 },
      { personality: 3, color: 3, table: 6 },
      { personality: 2, color: 2, table: 3 },
      { personality: 1, color: 4, table: 3 },
      { personality: 2, color: 3, table: 5 },
      { personality: 2, color: 4, table: 1 },
      { personality: 2, color: 3, table: 7 },
      { personality: 3, color: 4, table: 5 },
    ],
    [
      { personality: 3, color: 3, table: 3 },
      { personality: 1, color: 4, table: 4 },
      { personality: 2, color: 4, table: 3 },
      { personality: 1, color: 2, table: 4 },
      { personality: 2, color: 3, table: 7 },
      { personality: 3, color: 2, table: 7 },
      { personality: 3, color: 3, table: 4 },
      { personality: 2, color: 2, table: 4 },
    ],
    [
      { personality: 2, color: 2, table: 6 },
      { personality: 3, color: 3, table: 5 },
      { personality: 2, color: 1, table: 3 },
      { personality: 3, color: 2, table: 4 },
      { personality: 1, color: 4, table: 2 },
      { personality: 2, color: 2, table: 6 },
      { personality: 2, color: 3, table: 8 },
      { personality: 3, color: 4, table: 2 },
    ],
    [
      { personality: 2, color: 4, table: 6 },
      { personality: 2, color: 4, table: 4 },
      { personality: 2, color: 1, table: 4 },
      { personality: 1, color: 2, table: 8 },
      { personality: 2, color: 4, table: 1 },
      { personality: 3, color: 3, table: 5 },
      { personality: 3, color: 1, table: 7 },
      { personality: 2, color: 4, table: 1 },
    ],
    [
      { personality: 1, color: 4, table: 7 },
      { personality: 2, color: 2, table: 4 },
      { personality: 2, color: 3, table: 4 },
      { personality: 1, color: 1, table: 5 },
      { personality: 2, color: 2, table: 1 },
      { personality: 3, color: 4, table: 8 },
      { personality: 2, color: 2, table: 6 },
      { personality: 3, color: 1, table: 1 },
    ],
    [
      { personality: 2, color: 4, table: 5 },
      { personality: 3, color: 2, table: 5 },
      { personality: 1, color: 3, table: 6 },
      { personality: 2, color: 3, table: 8 },
      { personality: 1, color: 3, table: 1 },
      { personality: 2, color: 2, table: 7 },
      { personality: 3, color: 2, table: 3 },
      { personality: 3, color: 1, table: 3 },
    ],
    [
      { personality: 3, color: 3, table: 6 },
      { personality: 1, color: 4, table: 2 },
      { personality: 3, color: 1, table: 3 },
      { personality: 1, color: 1, table: 8 },
      { personality: 2, color: 2, table: 7 },
      { personality: 1, color: 2, table: 1 },
      { personality: 3, color: 1, table: 5 },
      { personality: 3, color: 3, table: 4 },
    ],
  ];
  console.log(tables.map(calc_4).join("\n"));
});

Deno.test("GameJudge", () => {
  const game = new Game();
  console.log(game.run());
});

Deno.test("TF&M Engine", () => {
  const engine = new Encoder();
  const lines = [
    "己丁丁丁甲丁甲假己辛蓝乙假庚甲甲庚乙戊甲真甲",
    "乙丙红甲丁丙黄辛戊庚庚庚乙甲丁乙假辛庚丙",
    "-戊庚乙辛丁己绿蓝辛蓝乙丁己甲黄丁谜真乙丙甲黄己丁庚辛",
    "甲乙己庚黄丁庚假辛绿甲辛辛辛丁庚谜乙乙甲戊",
    "丙甲丁丁甲戊丁丙乙己戊庚蓝辛红丙甲",
  ];
  // console.log(engine.sentence_to_nise(lines.join("\n")));
  console.log(engine.sentence(lines.join("\n")));
});
