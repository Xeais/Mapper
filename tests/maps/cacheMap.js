var helper = require("../helper");

module.exports =
{
  "save": function(test, external) 
  {
      console.log(">> Save map data".purple());
    test.execute(function() 
    {
      this.data("mapData", window.terrain.exportData());
    });

    return test;
  },
  "load": function(test, external) 
  {
    console.log(">> Load map data".purple());
    test.execute(function() 
    {
      //Reset these checkoxes, since DalekJS doesn't do that (wether with a second click nor through a reload)!
      window.extend.checked = "";
      window.reverse.checked = "";
      window.rotate.checked = "";
      //Reimport map:
      window.terrain.importData(this.data("mapData"));
      this.data("mapSizeX", window.terrain.mapSizeX);
      this.data("mapSizeY", window.terrain.mapSizeY);
    });

    return test;
  }
};
