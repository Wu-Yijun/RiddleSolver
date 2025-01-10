import { ArrayDecoder } from "./array.ts";
import { NiziCode } from "./nizi-code.ts";

Deno.test("decode tips", () => {
  const decoder = new ArrayDecoder();
  decoder.read_words(1);
  const nizi = new NiziCode();

  // --- 01 ---
  console.log(
    "01:3",
    decoder.sentence(
      "ipsT(162) aer(52) efnot(177) eginv(181) in(37) fmors(237) fo(27) ddehin(163) hinst(243).",
    ),
  );
  // --- 02 ---
  console.log(
    "02:1",
    decoder.sentence("Tnru(172) bemnru(236) inot(157) abinry(306)."),
  );
  console.log(
    "02:2",
    decoder.sentence('"-" aemns(177) 0 adn(41) 1 is(47) deeerrsv(385).'),
  );
  console.log(
    "02:3:1",
    decoder.search_dict("{Taaghiilnorrssy: (139,4) (47,2) (112,4) (220,5)}."),
  );
  console.log(
    "02:3:2",
    decoder.search_dict("{Ycdddeehiioopsttu: (118,3) (161,7) (139,4) (86,3)}."),
  );
  // --- 15 ---
  console.log(
    "15:1",
    decoder.sentence("Cehimrsty(754)"),
  );
  console.log(
    "15:2",
    nizi.sentence("58242 2806814"),
  );
  console.log(
    "15:3",
    nizi.long("-19856524308934202591 "),
  );
  // --- 16 ---
  console.log(
    "16:1",
    decoder.sentence("Ccehk(101) eht(51) beeistw(315) for(90) ehlp(118)"),
  );
});
