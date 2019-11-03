module.exports =
{
  "top_add": function(test, external, makeShot)
  {
    if(!external)
      test.open("index.html");

    test.click("#topPlus")

        .execute(function()
        {
          this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX"), "Mapwidth should be " + this.data("mapSizeX") + ", was " + window.terrain.mapSizeX + ".");
          this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY") + 1, "Mapheight should be " + (this.data("mapSizeY") + 1) + ", was " + window.terrain.mapSizeY + ".");
          this.assert.ok(window.store.getItem("draft") === window.terrain.exportData(), "Draft should be saved.");
          this.data("mapSizeX", window.terrain.mapSizeX);
          this.data("mapSizeY", window.terrain.mapSizeY);
        });

    makeShot && test.screenshot("./tests/images/:browser/topPlus.png");

    if(external)
      return test;
    else
      test.done();
  },
  "top_remove": function(test, external, makeShot)
  {
    if(!external)
      test.open("index.html");

    test.click("#topMinus")

        .execute(function()
        {
          this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX"), "Mapwidth should be " + this.data("mapSizeX") + ", was " + window.terrain.mapSizeX + ".");
          this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY") - 1, "Mapheight should be " + (this.data("mapSizeY") - 1) + ", was " + window.terrain.mapSizeY + ".");
          this.assert.ok(window.store.getItem("draft") === window.terrain.exportData(), "Draft should be saved.");
          this.data("mapSizeX", window.terrain.mapSizeX);
          this.data("mapSizeY", window.terrain.mapSizeY);
        });

    makeShot && test.screenshot("./tests/images/:browser/topMinus.png");

    if(external)
      return test;
    else
      test.done();
  },
  "left_add": function(test, external, makeShot)
  {
    if(!external)
      test.open("index.html");

    test.click("#leftPlus")

        .execute(function()
        {
          this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX") + 1, "Mapwidth should be " + (this.data("mapSizeX") + 1) + ", was " + window.terrain.mapSizeX + ".");
          this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY"), "Mapheight should be " + this.data("mapSizeY") + ", was " + window.terrain.mapSizeY + ".");
          this.assert.ok(window.store.getItem("draft") === window.terrain.exportData(), "Draft should be saved.");
          this.data("mapSizeX", window.terrain.mapSizeX);
          this.data("mapSizeY", window.terrain.mapSizeY);
        });

    makeShot && test.screenshot("./tests/images/:browser/leftPlus.png");

    if(external)
      return test;
    else
      test.done();
  },
  "left_remove": function(test, external, makeShot)
  {
    if(!external)
      test.open("index.html");

    test.click("#leftMinus")

        .execute(function()
        {
          this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX") - 1, "Mapwidth should be " + (this.data("mapSizeX") - 1) + ", was " + window.terrain.mapSizeX + ".");
          this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY"), "Mapheight should be " + this.data("mapSizeY") + ", was " + window.terrain.mapSizeY + ".");
          this.assert.ok(window.store.getItem("draft") === window.terrain.exportData(), "Draft should be saved.");
          this.data("mapSizeX", window.terrain.mapSizeX);
          this.data("mapSizeY", window.terrain.mapSizeY);
        });

    makeShot && test.screenshot("./tests/images/:browser/leftMinus.png");

    if(external)
      return test;
    else
      test.done();
  },
  "right_add": function(test, external, makeShot)
  {
    if(!external)
      test.open("index.html");

    test.click("#rightPlus")

        .execute(function()
        {
          this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX") + 1, "Mapwidth should be " + (this.data("mapSizeX") + 1) + ", was " + window.terrain.mapSizeX + ".");
          this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY"), "Mapheight should be " + this.data("mapSizeY") + ", was " + window.terrain.mapSizeY + ".");
          this.assert.ok(window.store.getItem("draft") === window.terrain.exportData(), "Draft should be saved.");
          this.data("mapSizeX", window.terrain.mapSizeX);
          this.data("mapSizeY", window.terrain.mapSizeY);
        });

    makeShot && test.screenshot("./tests/images/:browser/rightPlus.png");

    if(external)
      return test;
    else
      test.done();
  },
  "right_remove": function(test, external, makeShot)
  {
    if(!external)
      test.open("index.html");

    test.click("#rightMinus")

        .execute(function()
        {
          this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX") - 1, "Mapwidth should be " + (this.data("mapSizeX") - 1) + ", was " + window.terrain.mapSizeX + ".");
          this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY"), "Mapheight should be " + this.data("mapSizeY") + ", was " + window.terrain.mapSizeY + ".");
          this.assert.ok(window.store.getItem("draft") === window.terrain.exportData(), "Draft should be saved.");
          this.data("mapSizeX", window.terrain.mapSizeX);
          this.data("mapSizeY", window.terrain.mapSizeY);
        });

    makeShot && test.screenshot("./tests/images/:browser/rightMinus.png");

    if(external)
      return test;
    else
      test.done();
  },
  "bottom_add": function(test, external, makeShot)
  {
    if(!external)
      test.open("index.html");

    test.click("#bottomPlus")

        .execute(function()
        {
          this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX"), "Mapwidth should be " + this.data("mapSizeX") + ", was " + window.terrain.mapSizeX + ".");
          this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY") + 1, "Mapheight should be " + (this.data("mapSizeY") + 1) + ", was " + window.terrain.mapSizeY + ".");
          this.assert.ok(window.store.getItem("draft") === window.terrain.exportData(), "Draft should be saved.");
          this.data("mapSizeX", window.terrain.mapSizeX);
          this.data("mapSizeY", window.terrain.mapSizeY);
        });

    makeShot && test.screenshot("./tests/images/:browser/bottomPlus.png");

    if(external)
      return test;
    else
      test.done();
  },
  "bottom_remove": function(test, external, makeShot)
  {
    if(!external)
      test.open("index.html");

    test.click("#bottomMinus")

        .execute(function()
        {
          this.assert.ok(window.terrain.mapSizeX === this.data("mapSizeX"), "Mapwidth should be " + this.data("mapSizeX") + ", was " + window.terrain.mapSizeX + ".");
          this.assert.ok(window.terrain.mapSizeY === this.data("mapSizeY") - 1, "Mapheight should be " + (this.data("mapSizeY") - 1) + ", was " + window.terrain.mapSizeY + ".");
          this.assert.ok(window.store.getItem("draft") === window.terrain.exportData(), "Draft should be saved.");
          this.data("mapSizeX", window.terrain.mapSizeX);
          this.data("mapSizeY", window.terrain.mapSizeY);
        });

    makeShot && test.screenshot("./tests/images/:browser/bottomMinus.png");

    if(external)
      return test;
    else
      test.done();
  }
};