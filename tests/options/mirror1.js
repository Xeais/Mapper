module.exports =
{
  "mirror": function(test, external, makeShot) 
  {
    console.log("mirror1 - mirror");
    if(!external)
      test.open("index.html");

    test.click("#optionButton")
      .click("#first")
      .click("#mirrorButton")
      .assert.enabled("#rotate", "Rotate enabled")
      .assert.notSelected("#rotate", "Rotate unchecked")
      .assert.disabled("#reverse", "Reverse disabled")
      .assert.enabled("#extend", "Extend enabled")
      .assert.notSelected("#extend", "Extend unchecked")

      .execute(function()
      {
        this.assert.ok(window.active === "first", "\"window.active\" should be 'first', was " + window.active + ".");
        this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX"), "mapSizeX === " + this.data("mapSizeX"));
        this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY"), "mapSizeY === " + this.data("mapSizeY"));
      });

    makeShot && test.screenshot("./tests/images/:browser/mirror1.png");

    if(external)
      return test;
    else
      test.done();
  },
  "mirrorExtend": function(test, external, makeShot) 
  {
    console.log("mirror1 - mirrorExtend");
    if(!external)
      test.open("index.html");

    test.click("#optionButton")
      .click("#first")
      .click("#extend")
      .click("#mirrorButton")

      .assert.enabled("#rotate", "Rotate enabled")
      .assert.notSelected("#rotate", "Rotate unchecked")
      .assert.disabled("#reverse", "Reverse disabled")
      .assert.enabled("#extend", "Extend enabled")
      .assert.selected("#extend", "Extend checked")

      .execute(function()
      {
        this.assert.ok(window.active === "first", "\"window.active\" should be 'first', was " + window.active + ".");
        this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX") * 2, "mapSizeX === " + this.data("mapSizeX") * 2);
        this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY") * 2, "mapSizeY === " + this.data("mapSizeY") * 2);
      });

    makeShot && test.screenshot("./tests/images/:browser/mirror1Extend.png");

    if(external)
      return test;
    else
      test.done();
  },
  "mirrorRotate": function(test, external, makeShot) 
  {
    console.log("mirror1 - mirrorRotate");
    if(!external)
      test.open("index.html");

    test.click("#optionButton")
      .click("#first")
      .click("#rotate")
      .click("#mirrorButton")

      .assert.enabled("#rotate", "Rotate enabled")
      .assert.selected("#rotate", "Rotate checked")
      .assert.disabled("#reverse", "Reverse disabled")
      .assert.enabled("#extend", "Extend enabled")
      .assert.notSelected("#extend", "Extend unchecked")

      .execute(function()
      {
        this.assert.ok(window.active === "first", "\"window.active\" should be 'first', was " + window.active + ".");
        this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX"), "mapSizeX === " + this.data("mapSizeX"));
        this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY"), "mapSizeY === " + this.data("mapSizeY"));
      });

    makeShot && test.screenshot("./tests/images/:browser/mirror1Rotate.png");

    if(external)
      return test;
    else
      test.done();
  },
  "mirrorExtendRotate": function(test, external, makeShot) 
  {
    console.log("mirror1 - mirrorExtendRotate");
    if(!external)
      test.open("index.html");

    test.click("#optionButton")
      .click("#first")
      .click("#rotate")
      .click("#extend")

      .click("#mirrorButton")

      .assert.enabled("#rotate", "Rotate enabled")
      .assert.selected("#rotate", "Rotate checked")
      .assert.disabled("#reverse", "Reverse disabled")
      .assert.enabled("#extend", "Extend enabled")
      .assert.selected("#extend", "Extend checked")

      .execute(function()
      {
        this.assert.ok(window.active === "first", "\"window.active\" should be 'first', was " + window.active + ".");
        this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX") * 2, "mapSizeX === " + this.data("mapSizeX") * 2);
        _this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY") * 2, "mapSizeY === " + this.data("mapSizeY") * 2);
      });

    makeShot && test.screenshot("./tests/images/:browser/mirror1ExtendRotate.png");

    if(external)
      return test;
    else
      test.done();
  }
};