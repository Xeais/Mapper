module.exports =
{
  "generate": function(test, external, width, height) 
  {
    width = width || "20";
    height = height || "20";

    if(!external)
      test.open("index.html");

    test.click("#optionButton")
        .setValue("#width", width)
        .setValue("#height", height)
        .click('input[type="submit"]')
        .execute(function()
        {
          this.assert.ok(window.terrain.mapSizeX === width.value, "Mapwidth should be " + width.value + ", was " + window.terrain.mapSizeX + ".");
          this.assert.ok(window.terrain.mapSizeY === height.value, "Mapwidth should be " + height.value + ", was " + window.terrain.mapSizeY + ".");
          this.assert.ok(window.store.getItem("draft") === null, "No draft should be saved.");
        });

    if(external)
      return test;
    else
      test.done();
  }
};
