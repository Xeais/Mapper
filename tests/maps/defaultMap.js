var helper = require("../helper");

module.exports =
{
  "drawMap": function(test, external, makeShot) 
  {
    console.log(">> Draw default map".purple());

    if(!external)
      test.open("index.html");

    test.waitForElement("#core_p1")
        .click("#core_p1")
        .click("#col_3_3")
        .click("#claimed_earth_p1")
        .click("#col_6_1")
        .click("#col_6_2")
        .click("#col_6_3")
        .click("#col_6_4")
        .click("#col_6_5")
        .click("#col_6_6")
        .click("#col_5_6")
        .click("#col_4_6")
        .click("#col_3_6")
        .click("#col_2_6")
        .click("#col_1_6")
        .click("#impenetrable")
        .click("#col_5_14")
        .click("#col_4_14")
        .click("#col_3_14")
        .click("#col_2_14")
        .click("#goldshrine")
        .click("#col_11_3")
        .click("#archiveshrine")
        .click("#col_3_11")
        .click("#siegeshrine")
        .click("#col_5_17")
        .click("#manashrine")
        .click("#col_17_5")
        .click("#gold")
        .click("#col_2_17")
        .click("#col_2_18")
        .click("#col_2_19")
        .click("#col_10_9")
        .click("#col_9_9")
        .click("#col_9_10")
        .click("#col_8_10")
        .click("#col_7_11")
        .click("#brimstone")
        .click("#col_7_6")
        .click("#col_7_7")
        .click("#col_7_8")
        .click("#col_7_9")
        .click("#col_7_10")
        .click("#col_11_8")
        .click("#lava")
        .click("#col_14_5")
        .click("#col_14_6")
        .click("#col_15_6")
        .click("#sacred_earth")
        .click("#col_11_6")
        .click("#col_11_7")
        .click("#col_10_7")
        .click("#col_10_6")
        .click("#water")
        .click("#col_8_2")
        .click("#col_8_3")
        .click("#dirt")
        .click("#col_14_10")
        .click("#col_14_11")
        .click("#col_14_12")
        .click("#col_14_13")
        .click("#col_14_14")
        .click("#col_14_15")
        .click("#col_15_15")
        .click("#col_16_15");

    makeShot && test.screenshot("./tests/images/:browser/defaultMap.png");

    if(external)
      return test;
    else
      test.done();
  }
};