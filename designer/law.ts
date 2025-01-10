const law_path = "./designer/assets/民法典.txt";

const kanji_neg = "负";
const kanji_units = ["", "十", "百", "千", "万"];
const kanji_number = [
  "零",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
];
const kanji_number_str = kanji_units.join() + kanji_number.join();
const chinese_marks =
  "。？！，、；：“”‘’『』「」（）[]〔〕【】─…·—-～·《》〈〉_/";

function to_kanji(item: number): string {
  let res = "";
  item = Math.round(item);
  const is_neg = item < 0;
  if (is_neg) {
    item = -item;
  }
  if (item === 0) {
    return kanji_number[0];
  } else if (item === 10) {
    res = kanji_units[1];
  } else if (item > 10 && item < 20) {
    res = kanji_units[1] + kanji_number[item - 10];
  } else if (item >= 1E5) {
    res = item.toString();
  } else {
    let i = 0;
    let last_zero = true;
    while (item > 0) {
      const n = item % 10;
      item = (item - n) / 10;
      if (n === 0) {
        if (!last_zero) {
          res = kanji_number[0] + res;
          last_zero = true;
        }
      } else {
        res = kanji_number[n] + kanji_units[i] + res;
        last_zero = false;
      }
      i += 1;
    }
  }
  if (is_neg) {
    res = kanji_neg + res;
  }
  return res;
}

class SearchingLaw {
  data: string;
  constructor(path: string = law_path) {
    this.data = Deno.readTextFileSync(path);
  }
  public get_pos(item: number): number[] {
    const key = "\n第" + to_kanji(item) + "条";
    const pos = [];
    let i = 0;
    while ((i = this.data.indexOf(key, i)) >= 0) {
      i += key.length;
      pos.push(i);
    }
    return pos;
  }
  public search(item: number, index: number): string {
    let pos = this.get_pos(item)[0];
    while (index > 0) {
      const c = this.data[pos];
      if (c === "\n") {
        pos++;
        if (this.data[pos] === "（") {
          let i = 2;
          while (kanji_number_str.includes(this.data[pos + i])) {
            i++;
          }
          if (this.data[pos + i] === "）") {
            pos += i + 1;
          }
        }
        continue;
      }
      if (chinese_marks.includes(c) || c === " " || c === "\n" || c === "\r") {
        pos++;
        continue;
      }

      // console.log(this.data[pos]);
      pos++;
      index--;
    }
    return this.data[pos - 1];
  }
}

Deno.test("test number to kanji", () => {
  console.log(to_kanji(1234));
  console.log(to_kanji(1204));
  console.log(to_kanji(1004));
  console.log(to_kanji(1030));
  console.log(to_kanji(1034));
  console.log(to_kanji(1000));
  console.log(to_kanji(1200));
  console.log(to_kanji(1230));
  console.log(to_kanji(10000));
  console.log(to_kanji(200));
  console.log(to_kanji(30));
  console.log(to_kanji(4));
  console.log(to_kanji(0));
  console.log(to_kanji(-0));
  console.log(to_kanji(-10));
  console.log(to_kanji(-12345));
  console.log(to_kanji(-123456));
});

import { assertEquals } from "jsr:@std/assert";
Deno.test("test SearchingLaw get_pos", () => {
  const engine = new SearchingLaw();
  for (let i = 1; i <= 1260; i++) {
    const pos = engine.get_pos(i);
    assertEquals(
      pos.length,
      1,
      `at index ${i} where pos is not unique: [${pos}]`,
    );
  }
  console.log("Search Pass!");
});

Deno.test("test SearchingLaw search", () => {
  const engine = new SearchingLaw();
  const search_list = [
    [1200, 12],
    [1198, 14],
    [181, 2],
    [35, 169],
    [5, 23],
    [36, 5],
    [247, 3],
    [603, 140],
  ];
  const res = search_list.map(([n, i]) => engine.search(n, i));
  res.splice(1, 0, "史");
  console.log(res.join(""));
});
