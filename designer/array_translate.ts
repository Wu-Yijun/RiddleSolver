import { ArrayDecoder } from "./array.ts";
import { NiseCode } from "./nise-code.ts";

Deno.test("decode tips", () => {
  const decoder = new ArrayDecoder();
  decoder.read_words(1);
  const nise = new NiseCode();

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
    nise.sentence("58242 2806814"),
  );
  console.log(
    "15:3",
    nise.long("-19856524308934202591 "),
  );
  // --- 16 ---
  console.log(
    "16:1",
    decoder.sentence("Ccehk(101) eht(51) beeistw(315) for(90) ehlp(118)"),
  );
  // --- 23 ---
  console.log(
    "23:2",
    decoder.sentence(
      "aceh(48) fo(27) eht(51) 64 Gua adnsst(252) for(90) a(1) isx(109) bety(132) 01 cdeo(65)",
    ),
  );
  console.log(
    "23:3",
    nise.sentence("377673303 86 -637335033 322889089943767"),
  );
  console.log(
    "23:4:1",
    nise.sentence("-10977 -86221 284 778 3423638 79069950"),
  );
  console.log(
    "23:4:2",
    nise.sentence("39071447 778 123580189 134 -818590 -10977"),
  );
  console.log(
    "23:4",
    nise.long("1442193488623282"),
  );
  console.log(
    "23:4:1",
    nise.long("-424677567179640188352414186753"),
  );
  // --- 35 ---
  console.log(
    "35:2",
    nise.sentence("1074 -39808241 -39808241 -140 -1209 806 -427094668"),
  );
  console.log(
    "35:3",
    nise.sentence("6183 1074 -997363624 -427094668 -72227496 "),
  );
  // --- 48 ---
  console.log(
    "48:1",
    decoder.sentence(
      "iSx(109) fnost(253) aer(52) isx(109) dikns(182) fo(27) eenQu(164).",
    ),
  );
  console.log(
    "48:2",
    nise.sentence("-14195020621 -51205 -724209 130617955 4836341342."),
  );
  console.log(
    "48:3",
    nise.sentence("-1052153301 -5248984 1465120 60385 778 -82586975 45798."),
  );
  console.log(
    "48:4",
    nise.long("6868582477394290694330"),
  );
  // --- 54 ---
  console.log(
    "54:I:1",
    decoder.sentence(
      "eht(51) dhirt(155) airst(188) is(47) ddehin(163) bdehin(166) a(1) ehitw(171) abdor(127)",
    ),
  );
  console.log(
    "54:I:2",
    nise.sentence(
      "70182 778 58242 265251616 -28425503967 7296 -157737 1465120",
    ),
  );
  console.log(
    "54:II:1",
    decoder.sentence("ehnorstu(500) fo(27) eht(51) foor(117)"),
  );
  console.log(
    "54:II:2",
    nise.sentence("-9029701 778 -59213 134 778 -1762703"),
  );
  // --- 65 ---
  console.log(
    "65:1",
    nise.sentence(
      "12972055218 778 -426039765 -17559 -749902030 229662 76638001.",
    ),
  );
  console.log(
    "65:2",
    decoder.sentence(
      "dfin(82) eht(51) aclmoorss(651) hitw(133) ahtt(119) moott(258) ghnu(120) pu(53) eht(51) allw(109).",
    ),
  );
  // --- 76 ---
  console.log(
    "76:1",
    decoder.sentence(
      "aestt(184) ehmt(103) abelrvy(401).",
    ),
  );
  console.log(
    "76:2",
    nise.long(
      "493129087967168330513006988986666",
    ),
  );
  // --- 87 ---
  console.log(
    "87:1",
    nise.sentence(
      "50333935494 -140 -19557 -108357 ",
    ),
  );
});

Deno.test("encode tips", () => {
  const nise = new NiseCode();
  const num = nise.encode_sentence_long("six");
  console.log(num);
  console.log(nise.long(num));
  console.log(nise.encode_sentence_long("translate"));
});
