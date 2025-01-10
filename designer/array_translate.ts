import { ArrayDecoder } from "./array.ts";

Deno.test("decode tips", () => {
  const decoder = new ArrayDecoder();
  decoder.read_words(1);
  console.log(
    "01:4",
    decoder.sentence(
      "ipsT(162) aer(52) efnot(177) eginv(181) in(37) fmors(237) fo(27) ddehin(163) hinst(243).",
    ),
  );
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
});
