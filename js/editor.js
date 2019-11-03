"use strict";

window.onload = function()
{
  //"localStorage"-wrapper:
  this.store = new DataStorage();
  /* Testing:
   * this.store.outputAll();
   * this.store.clear(); */

  this.terrain = new Map();
  terrain.phantomJs();
  terrain.getQueryOptions();
  initOptions();
  terrain.preloadTiles(function(images)
  {
    terrain.images = images;
    terrain.generateTileCss();

    var draft = store.getItem("draft");
    if(draft && !terrain.isPhantom) 
    {
      /* var restoreDraft = confirm("There is a map file saved as draft, do you want to restore it?");
       * if (restoreDraft) 
       * { */
      terrain.importData(draft);
      return;
      /* } 
       * else 
           terrain.deleteDraft(); */
    }
    terrain.init();
  });
};

function Map(sizeX, sizeY) 
{
  var map = this;
  this.zoom = 1.0;
  this.images = [];
  this.defaultTile = "earth";
  this.borderTile = "impenetrable";
  this.borderSize = 1;
  this.currentTile = "dirt";
  this.mapTableId = "map";
  this.minSize = 5;
  this.maxSize = 130;
  this.mapSizeX = sizeX || 20;
  this.mapSizeY = sizeY || 20;
  this.tileButtonsId = "tileButtons";
  this.tiles = {};
  this.tileSizeDefault = 64;
  this.tileSize = store.getItem("tileSize") || this.tileSizeDefault;
  this.tileSizes = [24, 32, 48, 64];
  this.dragEnabled = false;
  this.assetDir = "tiles";
  this.preloadImages = true;
  this.buttonColumns = 3;
  this.tileModeDefault = "normal";
  this.tileMode = store.getItem("tileMode") || this.tileModeDefault;
  this.tileModes = ["color", "lowres", "normal" /*, "highres", not really necessary - looks good enough. */];
  this.undoHistory = this.redoHistory = [];
  this.maxHistory = 30;
  this.dropTimeout = 0;
  this.version = "001";
  this.copiedFilenameRegex = /\s\([0-9]{1,}\)\./g;
  this.isPhantom = false;
  this.mapFileVersion = "1.3";
  this.mouseButtons =
  {
    left: 0,
    middle: 1,
    right: 2
  };
  this.options =
  {
    "tileModes":
    {
      type: "select",
      option: "tileMode",
      postSave: "setTileMode"
    },
    "tileSizes":
    {
      type: "select",
      option: "tileSize",
      postSave: "setTileSize"
    }
  };
  this.operation =
  {
    before: ["shift", "unshift"],
    after: ["pop", "push"]
  };

  var mapParent = document.getElementsByTagName("body")[0], dropMessage = document.getElementById("dropMessage");

  this.getQueryOptions = function() 
  {
    for(var item in map.options) 
    {
      var option = map.options[item].option, postSave = map.options[item].postSave;
      var match = location.search.match('(^\\?|&)' + option + '=([^\\?&=]+)');
      if(match)
        map[postSave](match[2]);
    }
  };

  this.setTileMode = function(tileMode) 
  {
    if(map.tileModes.indexOf(tileMode) === -1) 
    {
      console.error("The tile mode \"" + tileMode + "\" is not allowed!");

      return;
    }

    store.setItem("tileMode", tileMode);
    map.tileMode = tileMode;
    //map.generateTileCss();
  };

  this.setTileSize = function(tileSize) 
  {
    if(map.tileSizes.indexOf(parseInt(tileSize)) === -1) 
    {
      console.error("The tile size " + parseInt(tileSize) + " is not allowed!");

      return;
    }
    store.setItem("tileSize", tileSize);
    map.tileSize = tileSize;
  };

  this.resetToDefault = function() 
  {
    for(var item in map.options) 
    {
      var option = map.options[item].option;
      map[option] = map[option + "Default"];
    }

    map.generateTileCss();
  };

  this.generateTileCss = function() 
  {
    var style = document.getElementById("tileCss") || document.createElement("style");
    style.id = "tileCss";
    style.type = "text/css";
    var styleHtml = "";
    for(var item in tiles) 
    {
      var posX = tiles[item].sizeX, posY = tiles[item].sizeY, css = "";
      switch(map.tileMode) 
      {
        case "color":
          css = " {background-color: " + tiles[item].color + ";}\n";
          break;
        default:
          css = ' {background-image: url("img/' + map.assetDir + '/' + map.tileMode + '/' + item + '.png");}\n';
          break;
      }
      styleHtml += "/* " + posX + " x " + posY + " */\n";
      styleHtml += "." + item + css;
    }
    style.innerHTML = styleHtml;
    document.getElementsByTagName("head")[0].appendChild(style);
  };

  this.preloadTiles = function(callback) 
  {
    var images = Object.keys(tiles);
    var image = {}, loadedImages = 0;

    if(!images || !map.preloadImages || map.tileMode === "color") 
    {
      //Skip it, because of lacking browser support!
      callback.call(this, image);

      return;
    }

    var start = new Date();
    var preloadDiv = document.getElementById("preload"), preloadMessage = preloadDiv.getAttribute("data-message");

    function imageLoaded()
    {
      loadedImages++;
      var loaded = new Date();
      if(loadedImages === 1 && loaded - start > 100) //If the loading of one image takes longer than 100 ms, show the preloading message.
        preloadDiv.style.display = "block";

      preloadDiv.firstChild.textContent = preloadMessage.replace(/\$1/g, loadedImages).replace(/\$2/g, images.length);
      if(loadedImages === images.length)
      {
        preloadDiv.style.display = "none";
        callback.call(this, image);
      }
    }

    for(var i = 0; i < images.length; i++)
    {
      image[images[i]] = new Image();
      image[images[i]].src = "img/" + map.assetDir + "/" + map.tileMode + "/" + images[i] + ".png";
      image[images[i]].onload = function()
      {
        imageLoaded();
      };

      image[images[i]].onerror = function()
      {
        imageLoaded();
      };
    }
  };

  this.createButtons = function() 
  {
    var tileSize = map.tileSizeDefault;
    var toolBox = document.getElementById("toolBox");

    toolBox.onmousemove = map.hideInfoBox;
    toolBox.setAttribute("class", "toolBox" + tileSize);

    var info = document.getElementById("mapInfo"), tileButtons = document.createElement("div");

    tileButtons.id = map.tileButtonsId;
    tileButtons.style.width = parseInt(tileSize * 3 / 4 * map.buttonColumns) + "px";

    for(var item in tiles) 
    {
      var button = document.createElement("input");
      button.type = "button";
      button.id = item;
      button.onclick = function() 
      {
        map.setCurrentTile(this.id);
      };

      //button.value = item;
      button.setAttribute("class", item + " tileButton");
      var add = item === map.defaultTile ? " (default)" : "";
      button.setAttribute("title", "Tile Name: " + item + add + " (" + tiles[item].sizeX + " x " + tiles[item].sizeY + ")");
      button.setAttribute("style", "background-size: " + parseInt(tileSize * 3 / 4) + "px; width: " + parseInt(tileSize * 3 / 4) + "px; height: " + parseInt(tileSize * 3 / 4) + "px");
      tileButtons.appendChild(button);
    }

    toolBox.insertBefore(tileButtons, info);
    toolBox.style.display = "block";
  };

  this.init = function(mapObject) 
  {
    //Only one map at the same time is allowed!
    map.destroy();
    map.createButtons();
    map.version = "001";

    mapParent.ondrop = map.dropMap;
    mapParent.ondragover = map.dragOverMap;

    var table = document.createElement("table");
    table.setAttribute("id", map.mapTableId);
    table.style.width = (map.mapSizeX + (map.borderSize * 2)) * map.tileSize + "px";

    table.setAttribute("cellpadding", "0");
    table.setAttribute("cellspacing", "0");

    map.setHtml("mapSize", map.mapSizeX + " x " + map.mapSizeY);

    var importedRooms = {}; //Save the current column/row of a room.

    for(var row = 0; row < map.mapSizeY + (map.borderSize * 2); row++) 
    {
      var tr = document.createElement("tr");
      tr.setAttribute("id", "row_" + row);
      tr.setAttribute("style", "height: " + map.tileSize + "px;");

      for(var col = 0; col < map.mapSizeX + (map.borderSize * 2); col++) 
      {
        var tile = document.createElement("td");
        tile.innerHTML = "&nbsp;";
        tile.setAttribute("id", "col_" + row + "_" + col);
        var roomTile = map.defaultTile;
        var isBorder = map.borderSize > 0 && row <= map.borderSize - 1 || col <= map.borderSize - 1 || row >= map.mapSizeY + map.borderSize || col >= map.mapSizeX + map.borderSize;
        var id = null;

        if(!isBorder) //Do not listen to this events on the border.
        {
          tile.onmouseover = map.displayRoom;
          tile.onmouseout = map.resetRoom;
          tile.onmousedown = map.enableDrag;
          tile.onmouseup = map.disableDrag;
          tile.onmousemove = map.setRoomOnDrag;
					/* Disable it, because it gets overwritten with mousedown.
					 * tile.onclick = map.setRoom; */
        }

        if(isBorder) 
        {
          //Generate border:
          roomTile = map.borderTile;
          tile.onmousemove = map.hideInfoBox;
        }
        else if(mapObject && mapObject.map && mapObject.tileIds && mapObject.tiles)
        {
          //Import map:
          var cell = mapObject.map[row - map.borderSize][col - map.borderSize];
          roomTile = mapObject.tiles[cell["tile"]];
          id = !isNaN(cell["data-id"]) && mapObject.tileIds[cell["data-id"]] || null;
          if(id) 
          {
            tile.setAttribute("data-id", id);
            map.tiles[id] = map.tiles[id] || [];
            if(map.tiles[id].length === 0)
              importedRooms[id] = {col: col, row: row}; //Mark the start point of a new room.

            map.tiles[id].push("col_" + row + "_" + col);
            tile.setAttribute("data-pos-x", col - importedRooms[id].col);
            tile.setAttribute("data-pos-y", row - importedRooms[id].row);
          }
        }
        else if(mapObject && (!mapObject.map || !mapObject.tileIds || !mapObject.tiles))
          throw new Error("The map file is invalid!");

        map.setTile(tile, roomTile);
        tr.appendChild(tile);
      }

      table.appendChild(tr);
    }

    mapParent.appendChild(table);

    map.checkObsoleteRooms();
    map.setHistoryButtons();

    map.zoomMap(map.zoom);

    window.addEventListener("keydown", map.keydownListener, false);
    window.addEventListener("mousewheel", map.mouseWheelListener, {passive: true}); //https://developers.google.com/web/tools/lighthouse/audits/passive-event-listeners
    window.addEventListener("DOMMouseScroll", map.mouseWheelListener, false);
  };

  this.destroy = function() 
  {
    map.tiles = {};
    //Remove buttons:
    var buttons = document.getElementById(map.tileButtonsId);
    buttons && buttons.parentNode.removeChild(buttons);

    document.removeEventListener("mousewheel", map.mouseWheelListener);
    document.removeEventListener("DOMMouseScroll", map.mouseWheelListener);

    var table = document.getElementById(map.mapTableId);
    if(table) 
    {
      table.parentNode.removeChild(table);

      return true;
    }
    else
      return false;
  };

  this.importData = function(mapString) 
  {
    var mapObject = JSON.parse(mapString);
    if(!mapObject || !mapObject.map)
      throw new Error("This is not a valid map!");

    var rows = mapObject.map.length, cols = mapObject.map[0].length;
    if(rows > 0 && cols > 0) 
    {
      map.destroy();
      map.mapSizeX = cols;
      map.mapSizeY = rows;
      map.init(mapObject);
      map.saveDraft();
      //map.deleteDraft();
    }
    else
      throw new Error("This is not a valid map!");
  };

  this.exportData = function(author) 
  {
    var json = map.mapToJson(author);
    if(json) 
    {
      var str = JSON.stringify(json);

      return str;
    }
    else
      return null;
  };

  this.enableDrag = function(evt) 
  {
    map.dragEnabled = true;

    switch(evt.button)
    {
      case map.mouseButtons.left:
        map.insertTile(this, false, false);
        //console.log("Tile \"" + this + "\" inserted (temp = false and reset = false in \"enableDrag\").");
        break;
    }

    return false;
  };

  this.disableDrag = function() 
  {
    map.dragEnabled = false;
  };

  this.setRoomOnDrag = function(evt) 
  {
    var infoBox = document.getElementById("infoBox");
    var top = evt.pageY + 20, left = evt.pageX + 20;

    var height = infoBox.clientHeight, width = infoBox.clientWidth;
    var windowHeight = window.innerHeight, windowWidth = window.innerWidth;
    var pageOffsetX = window.pageXOffset, pageOffsetY = window.pageYOffset;

    if(top + height > windowHeight + pageOffsetY - 10)
      infoBox.style.top = top - height - 30 + "px"; //At the bottom edge
    else
      infoBox.style.top = top + "px";

    if(left + width > windowWidth + pageOffsetX - 10)
      infoBox.style.left = left - width - 30 + "px"; //At the right edge
    else
      infoBox.style.left = left + "px";

    infoBox.style.display = "block";

    map.setHtml("tile", this.getAttribute("data-temp") || this.className);
  };

  this.hideInfoBox = function() 
  {
    map.hideElement("infoBox");
  };

  this.resetRoom = function() 
  {
    map.insertTile(this, false, true);
  };

  this.displayRoom = function() 
  {
    map.insertTile(this, true, false);

    //Info box:
    map.setHtml("posX", this.cellIndex + 1 - map.borderSize);
    var posY = this.parentNode.rowIndex !== -1 ? this.parentNode.rowIndex : this.parentNode.sectionRowIndex;
    map.setHtml("posY", posY + 1 - map.borderSize);

    //Drag and drop:
    var roomTile = tiles[map.currentTile];
    if(map.dragEnabled && roomTile.sizeX * roomTile.sizeY === 1)
      map.insertTile(this, false, false);
  };

  this.setRoom = function(evt) 
  {
    /* Helper for selenium:
     * console.log("<tr>\n\t<td>Click</td>\n\t<td>id=" + this.id + "</td>\n\t<td></td>\n</tr>"); */
    switch(evt.button)
    {
      case map.mouseButtons.left:
        map.insertTile(this, false, false);
        //console.log("Tile \"" + this + "\" inserted (temp = false and reset = false in \"setRoom\").");
        break;
    }
  };

  this.destroyRoom = function(id) 
  {
    if(!id)
      return;

    var roomTileTiles = map.tiles[id] || [];
    delete map.tiles[id];

    for(var i = 0; i < roomTileTiles.length; i++) 
    {
      var tile = document.getElementById(roomTileTiles[i]);
      map.setTile(tile, map.defaultTile);
      tile.removeAttribute("data-id");
      tile.removeAttribute("data-pos-x");
      tile.removeAttribute("data-pos-y");
    }
  };

  this.insertTile = function(tile, temp, reset) 
  {
    var roomTile = tiles[map.currentTile];
    var tileY = parseInt(tile.id.split("_")[1]) + 1, tileX = parseInt(tile.id.split("_")[2]) + 1;

    if(!temp && !reset)
      map.resetRedoHistory();

    var startNoY = parseInt((tileY - roomTile.sizeY / 2));
    startNoY = startNoY > map.borderSize ? startNoY : map.borderSize;
    startNoY = startNoY < map.mapSizeY - roomTile.sizeY + map.borderSize ? startNoY : map.mapSizeY - roomTile.sizeY + map.borderSize;
    var startNoX = parseInt((tileX - roomTile.sizeX / 2));
    startNoX = startNoX > map.borderSize ? startNoX : map.borderSize;
    startNoX = startNoX < map.mapSizeX - roomTile.sizeX + map.borderSize ? startNoX : map.mapSizeX - roomTile.sizeX + map.borderSize;

    var roomTileTiles = [], id = new Date().getTime();

    for(var i = 0; i < roomTile.sizeY; i++) 
    {
      for(var k = 0; k < roomTile.sizeX; k++)
      {
        tile = document.getElementById("col_" + (startNoY + i) + "_" + (startNoX + k));

        if(!reset) 
        {
          //Only add the "roomTile" if it is really set!
          if(!temp)
          {
						/* Destroy the "roomTile" if one is already set.
						 * This is here because not only the middle tile is able to destroy a room. */
            map.destroyRoom(tile.getAttribute("data-id"));

            roomTileTiles.push(tile.id);
            //Only set the unique id if the room is bigger than 1 x 1!
            roomTile.sizeX * roomTile.sizeY !== 1 && tile.setAttribute("data-id", id);
          }

          map.generateRoom(tile, i, k /*(i * roomTile.sizeY) + k + 1*/, temp);
        }
        else
        {
          map.resetTile(tile);
          tile.style.opacity = "1";
          //tile.removeAttribute("data-id");
        }
      }
    }

    roomTileTiles.length > 0 ? map.tiles[id] = roomTileTiles : "";
  };

  this.resetTile = function(tile) 
  {
    var posX = tile.getAttribute("data-temp-pos-x"), posY = tile.getAttribute("data-temp-pos-y");
    if(posX && posY) 
    {
      map.setTilePosition(tile, parseInt(-posX * map.tileSize) + "px " + parseInt(-posY * map.tileSize) + "px");

      tile.setAttribute("data-pos-x", posX);
      tile.setAttribute("data-pos-y", posY);
    }

    tile.hasAttribute("data-temp") && map.setTile(tile, tile.getAttribute("data-temp"));
    tile.removeAttribute("data-temp");
    tile.removeAttribute("data-temp-pos-x");
    tile.removeAttribute("data-temp-pos-y");
  };

  this.mapToJson = function(author)
  {
    var table = document.getElementById(map.mapTableId);
    var mapData =
    {
      version: map.mapFileVersion,
      author: author || "Anonymous",
      border: map.borderSize,
      tiles: [],
      tileIds: [],
      map: []
    };

    if(table) 
    {
      for(var i = map.borderSize; i < map.mapSizeY + map.borderSize; i++) 
      {
        var tableRow = table.rows[i], colData = [];

        for(var j = map.borderSize; j < map.mapSizeX + map.borderSize; j++) 
        {
          var col = {}, tile = tableRow && tableRow.cells[j] || null;

          //If the counter exceeds the count, just add empty cells - handy for the extend feature.
          if(tile) 
          {
            map.resetTile(tile); //Ensure that a non-temporary-tile is currently set.

            var id = tile.getAttribute("data-id"), className = tile.getAttribute("class");
            var tileTypeId = map.getMapTileId(mapData, className);

            if(id) 
            {
              //Save unique room identifier and make a reference:
              var tileId = mapData.tileIds.indexOf(id);
              if(tileId === -1) 
              {
                mapData.tileIds.push(id);
                tileId = mapData.tileIds.length - 1;
              }

              col["data-id"] = tileId;
            }

            col["tile"] = tileTypeId;
          }

          colData.push(col);
        }

        mapData.map.push(colData);
      }

      return mapData;
    }
    else
      return null;
  };

  this.mapToCsvJson = function(type)
  {
    var table = document.getElementById(map.mapTableId), csv = [];

    if(table) 
    {
      for(var i = 0; i < map.mapSizeY + map.borderSize * 2; i++) 
      {
        var tableRow = table.rows[i], colData = [];

        for(var j = 0; j < map.mapSizeX + map.borderSize * 2; j++) 
        {
          var tileName = "", tile = tableRow && tableRow.cells[j] || null;

          //If the counter exceeds the count, just add empty cells - handy for the extend feature.
          if(tile) 
          {
            map.resetTile(tile); //Ensure that a non-temporary-tile is currently set.

            tileName = tileTable[type === "gcsv" ? "getGoogleCsvValue" : "getMapperCsvValue"](tile.getAttribute("class"));
          }

          colData.push(tileName);
        }

        csv.push(colData);
      }
      return csv;
    }
    else
      return null;
  };

  this.setTilePosition = function(tile, pos) 
  {
    tile.style.backgroundPosition = pos;
  };

  this.getTilePosition = function(tile) 
  {
    return tile.style.backgroundPosition;
  };

  this.setTile = function(tile, currentTile) 
  {
    var roomTile = tiles[currentTile];
    if(roomTile) 
    {
      tile.setAttribute("class", currentTile);
      tile.style.backgroundSize = parseInt(map.tileSize * roomTile.sizeX) + "px " + parseInt(map.tileSize * roomTile.sizeY) + "px ";

      if(roomTile.sizeX * roomTile.sizeY > 1) 
      {
        var col = parseInt(tile.getAttribute("data-pos-x")), row = parseInt(tile.getAttribute("data-pos-y"));
        if(!isNaN(col) && !isNaN(row))
          map.setTilePosition(tile, parseInt(-col * map.tileSize) + "px " + parseInt(-row * map.tileSize) + "px");
      }
      else
      {
        tile.removeAttribute("data-pos-x");
        tile.removeAttribute("data-pos-y");
      }
    }
    else
      console.error("No tile was found for \"" + currentTile + "\"!");
  };

  this.generateRoom = function(tile, row, col, temp) 
  {
    var roomTile = tiles[map.currentTile], maxSize = roomTile.sizeY * roomTile.sizeX;

    tile.removeAttribute("data-temp");
    tile.removeAttribute("data-temp-pos-x");
    tile.removeAttribute("data-temp-pos-y");

    if(temp) 
    {
      tile.setAttribute("data-temp", tile.getAttribute("class"));
      var posX = tile.getAttribute("data-pos-x"), posY = tile.getAttribute("data-pos-y");

      if(posX && posY) 
      {
        tile.setAttribute("data-temp-pos-x", posX);
        tile.setAttribute("data-temp-pos-y", posY);
      }

      tile.setAttribute("data-pos-x", col);
      tile.setAttribute("data-pos-y", row);

      tile.style.opacity = "0.7";
    }
    else
    {
      maxSize !== 1 && tile.setAttribute("data-pos-x", col);
      maxSize !== 1 && tile.setAttribute("data-pos-y", row);
      tile.style.opacity = "1";
    }

    map.setTile(tile, map.currentTile);
    !temp && map.saveDraft();
  };

  this.setCurrentTile = function(roomTile) 
  {
    /* Helper for selenium:
     * console.log("<tr>\n\t<td>Click</td>\n\t<td>id=" + roomTile + "</td>\n\t<td></td>\n</tr>"); */
    map.currentTile = roomTile;
  };

  this.setHtml = function(id, html) 
  {
    document.getElementById(id).innerHTML = html;
  };

  this.hideElement = function(id) 
  {
    document.getElementById(id).style.display = "none";
  };

  /* "mirrorType" determines how the map should be mirrored.
   * It's the sum of the cell-values in the option menu. */
  this.mirrorMap = function(mirrorType, reverse, rotate)
  {
    map.resetRedoHistory();

    var mapObject = map.mapToJson();
    var cols = mapObject.map[0].length, rows = mapObject.map.length;

    switch(mirrorType) 
    {
      case "first":
        //Mirror 1 & 3 to 2 & 4:
        map.mirrorPart(mapObject, cols, rows, rotate ? "rotate" : "vertical");
        //Mirror 1 & 2 to 3 & 4:
        map.mirrorPart(mapObject, cols, rows, "horizontal", rotate ? true : false);
        break;
      case "second":
        //1 & 2 to 3 & 4:
        map.mirrorPart(mapObject, cols, rows, "horizontal", reverse);
        break;
      case "third":
      default:
        //1 & 3 to 2 & 4:
        map.mirrorPart(mapObject, cols, rows, "vertical", reverse);
        break;
    }

    var mapData = JSON.stringify(mapObject);
    map.importData(mapData);
    //map.saveDraft(mapData);
  };

  this.mirrorPart = function(mapObject, cols, rows, type, reverse) 
  {
    var incompleteRooms = {}, copiedRooms = {}, mirrorPlayer = {};
    var players = [1, 2, 3, 4];
    var playerSearch = /_p[1-8]/g;
    var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    switch(type) 
    {
      case "vertical":
        x2 = parseInt(cols / 2);
        y2 = parseInt(rows);
        break;
      case "horizontal":
        x2 = parseInt(cols);
        y2 = parseInt(rows / 2);
        break;
      case "rotate":
        x2 = parseInt(cols / 2);
        y2 = parseInt(rows / 2);
        break;
    }

    //Find incomplete rooms (going through the mirror part):
    map.forEachCell(x1, x2, y1, y2, function(col, row) 
    {
      var cell = mapObject.map[row][col], tile = mapObject.tiles[cell["tile"]] || "", plTile = tile.search(playerSearch);

      if(plTile !== -1) //There are player-tiles, remove these from the potential list!
      {
        var plNum = tile.substr(plTile + 2), plIndex = players.indexOf(parseInt(plNum));
        plIndex !== -1 && players.splice(plIndex, 1);
      }

      var tileId = mapObject.tileIds[cell["data-id"]];
      if(!tileId)
        return;

      var room = incompleteRooms[tileId];
      if(!room) //It's not in the list.
      {
        var sizeX = tiles[tile].sizeX, sizeY = tiles[tile].sizeY;
        incompleteRooms[tileId] =
        {
          "size": sizeX * sizeY,
          "count": 1
        };
      }
      else
      {
        room.count++;
        if(room.count === room.size)
          delete incompleteRooms[tileId]; //The room is complete!
      }
    });

    //Mirror part:
    map.forEachCell(x1, x2, y1, y2, function(col, row) 
    {
      //Clone the map-object-cell:
      var mirrorPart = JSON.parse(JSON.stringify(mapObject.map[row][col]));

      switch(type) 
      {
        case "vertical":
          var newCol = map.mapSizeX - 1 - col;
          var newVRow = reverse ? (y2 - 1 - row) : row;
          var tileIdVert = mapObject.tileIds[mapObject.map[newVRow][newCol]["data-id"]];
          break;
        case "horizontal":
          var newHCol = reverse ? (x2 - 1 - col) : col;
          var newRow = map.mapSizeY - 1 - row;
          var tileIdHor = mapObject.tileIds[mapObject.map[newRow][newHCol]["data-id"]];
          break;
        case "rotate":
          var newRCol = y2 * 2 - 1 - row, newRRow = col;
          var tileIdRot = mapObject.tileIds[mapObject.map[newRRow][newRCol]["data-id"]];
          break;
      }

      var tileIdMir = mapObject.tileIds[mirrorPart["data-id"]], tileName = mapObject.tiles[mirrorPart["tile"]] || "";

      if(tileIdHor && tileIdHor in incompleteRooms)
        return; //An incomplete room should not get mirrored, but keep the tiles.
      else if(tileIdVert && tileIdVert in incompleteRooms)
        return; //The same as above in vertical mirror
      else if(tileIdRot && tileIdRot in incompleteRooms)
        return; //Same as above in rotation
      else if(tileIdMir && tileIdMir in incompleteRooms)
        return; // ... and again
      else 
      {
        if(tileIdMir)
        {
          //Room is mirrored, create a new id:
          var newId = copiedRooms[tileIdMir];
          if(!newId) 
          {
						/* As most of it happens nearly instantly, add a custom number to it,
						 * otherwise the room ids aren't unique anymore! */
            newId = copiedRooms[tileIdMir] = new Date().getTime() - parseInt(Math.random() * 3000000);
            mapObject.tileIds.push(newId.toString());
          }

          var dataId = mapObject.tileIds.indexOf(newId.toString());
          mirrorPart["data-id"] = dataId;
        }

        //Is it a player-tile?
        if(tileName.search(playerSearch) !== -1) 
        {
          //Replace all player-tiles:
          var plNumber = tileName.substr(tileName.search(playerSearch) + 2), player = mirrorPlayer[plNumber];
          if(!player) 
          {
            player = mirrorPlayer[plNumber] = players[0];
            players.splice(0, 1); //Remove first entry.
          }

          if(player) 
          {
            tileName = tileName.replace(playerSearch, "_p" + player);
            var tileId = map.getMapTileId(mapObject, tileName);
            mirrorPart["tile"] = tileId;
          }
          //If the player maximum is reached, just copy them. The user has to fix it by himself.
        }
      }

      switch(type) 
      {
        case "vertical":
          mapObject.map[newVRow][newCol] = mirrorPart;
          break;
        case "horizontal":
          mapObject.map[newRow][newHCol] = mirrorPart;
          break;
        case "rotate":
          mapObject.map[newRRow][newRCol] = mirrorPart;
          break;
      }
    });
  };

  this.forEachCell = function(x1, x2, y1, y2, callback) 
  {
    for(var row = y1; row < y2; row++)
    {
      for(var col = x1; col < x2; col++)
        callback.call(this, col, row);
    }
  };

  this.cancelDrop = function() 
  {
    dropMessage.style.display = "none";
    clearTimeout(map.dropTimeout);
  };

  this.dragOverMap = function(evt) 
  {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy";

    clearTimeout(map.dropTimeout);
    map.dropTimeout = setTimeout(function() {map.cancelDrop();}, 200);

    dropMessage.style.display = "block";
  };

  this.dropMap = function(evt) 
  {
    dropMessage.style.display = "none";

    evt.preventDefault();

    var dt = evt.dataTransfer, files = dt.files;
    if(files && files.length !== 0) 
    {
      var reader = new FileReader();
      var file = files[0];
      reader.readAsText(file);

      reader.onload = function() 
      {
        try 
        {
          map.importData(atob(this.result));
          map.setFilename(file.name, false);
        }
        catch(e)
        {
          try 
          {
            map.importCsvData(this.result);
            map.setFilename(file.name, true);
          }
          catch(exception)
          {
            alert("Could not load map!\n\nException message: " + exception.message);
          }
        }
      };
    }
  };

  this.checkObsoleteRooms = function() 
  {
    var tileIds = map.tiles;
    for(var tileId in tileIds) 
    {
      var firstId = tileIds[tileId][0];
      var tile = document.getElementById(firstId), tileName = tile.getAttribute("class");
      var size = tiles[tileName].sizeX * tiles[tileName].sizeY;

      if(tileIds[tileId].length !== size)
        map.destroyRoom(tileId); //Room is not complete, destroy it!
    }
  };

  this.getMapTileId = function(mapData, tileName) 
  {
    var tileTypeId = mapData.tiles.indexOf(tileName);
    if(tileTypeId === -1) 
    {
      mapData.tiles.push(tileName); //Save tilename only once and make a reference.
      tileTypeId = mapData.tiles.length - 1;
    }

    return tileTypeId;
  };

  this.changeColumn = function(mapData, position, add) 
  {
    var mapArray = mapData.map;
    var operation = map.operation[position][add ? 1 : 0];
    var tileId = map.getMapTileId(mapData, map.defaultTile);

    //Map size must not exceed the defined minimum/maximum size!
    if(mapArray[0].length === map.minSize && !add || mapArray[0].length === map.maxSize && add)
      return;

    for(var i = 0; i < mapArray.length; i++)
      mapArray[i][operation]({tile: tileId});
  };

  this.changeLine = function(mapData, position, add) 
  {
    var mapArray = mapData.map;
    var operation = map.operation[position][add ? 1 : 0];
    var tileId = map.getMapTileId(mapData, map.defaultTile);

    //Map size must not exceed the defined minimmm/maximum size!
    if(mapArray.length === map.minSize && !add || mapArray.length === map.maxSize && add)
      return;

    var cols = [];
    for(var i = 0; i < mapArray[0].length; i++)
      cols.push({ tile: tileId });

    mapArray[operation](cols);
  };

  this.changeMap = function(dir, add) 
  {
    var mapObject = map.mapToJson(), position = "after";

    map.resetRedoHistory();
    map.saveUndoHistory();

    switch(dir) 
    {
      case "top":
        position = "before";
        //Falls through ...
      case "bottom":
        map.changeLine(mapObject, position, add);
        break;
      case "left":
        position = "before";
        //Falls through ...
      case "right":
        map.changeColumn(mapObject, position, add);
        break;
    }

    var mapData = JSON.stringify(mapObject);
    map.importData(mapData);
    //map.saveDraft(mapData);

    return false;
  };

  this.saveUndoHistory = function() 
  {
    var mapData = map.exportData(), history = map.undoHistory;
    if(history.length === 0 || mapData !== history[history.length - 1])
      history.push(mapData);

    if(history.length > map.maxHistory)
      history.shift();

    map.setHistoryButtons();
  };

  this.saveRedoHistory = function() 
  {
    var mapData = map.exportData(), history = map.redoHistory;
    if(history.length === 0 || mapData !== [0])
      history.unshift(mapData);

    if(history.length > map.maxHistory)
      history.pop();

    map.setHistoryButtons();
  };

  this.resetRedoHistory = function() 
  {
    map.redoHistory = [];
    map.saveUndoHistory();
    map.setHistoryButtons();
  };

  this.undo = function() 
  {
    if(map.undoHistory.length > 0)
    {
      map.saveRedoHistory();

      var mapData = map.undoHistory.pop();
      map.importData(mapData);
      //map.saveDraft(mapData);

      return true;
    }
    else
      return false;
  };

  this.redo = function() 
  {
    if(map.redoHistory.length > 0) 
    {
      map.saveUndoHistory();

      var mapData = map.redoHistory.shift();
      map.importData(mapData);
      //map.saveDraft(mapData);

      return true;
    }
    else
      return false;
  };

  this.setHistoryButtons = function() 
  {
    var undo = document.getElementById("undo"), redo = document.getElementById("redo");

    undo.disabled = map.undoHistory.length > 0 ? "" : "disabled";
    redo.disabled = map.redoHistory.length > 0 ? "" : "disabled";
  };

  this.importCsvData = function(csvdata) 
  {
    var bordersize = parseInt(document.getElementById("csvBorder").value) || 3;
    var calcRooms = [], usedCores = [];
    var mapData =
    {
      version: map.mapFileVersion,
      author: "",
      border: 1,
      tiles: [],
      tileIds: [],
      map: []
    };

    var rows = csvdata.split("\n");
    if(rows.length > bordersize * bordersize) 
    {
      for(var i = bordersize; i < rows.length - bordersize; i++) 
      {
        var rowData = [], cells = rows[i].split(",");

        for(var j = bordersize; j < cells.length - bordersize; j++) 
        {
          var cell = {};
          var tileName = tileTable.getEditorTileName(cells[j].substring(0, 2)), tileConfig = tiles[tileName];

          if(tileConfig && tileConfig.sizeX * tileConfig.sizeY > 1)
            calcRooms.push([i - bordersize, j - bordersize]);

          var tileTypeId = map.getMapTileId(mapData, tileName);
          cell["tile"] = tileTypeId;
          rowData.push(cell);
        }

        mapData.map.push(rowData);
      }

      for(var k = 0; k < calcRooms.length; k++) 
      {
        var y = calcRooms[k][0], x = calcRooms[k][1];
        var tileId = mapData.map[y][x]["tile"], tile = mapData.tiles[tileId];

        //There is no tile left or above, so lets create a new room:
        if(isNaN(parseInt(mapData.map[y][x]["data-id"])))
        {
          //New room:
          var id = new Date().getTime() - parseInt(Math.random() * 3000000).toString();
          mapData.tileIds.push(id);
          var roomTile = tiles[tile];
          //var coreTile = "";

          var match = tile.match(/core_p([1-8])/);
          if(match) 
          {
            var player = parseInt(match[1]);
            if(usedCores.indexOf(player) !== -1 && player < 5) 
            {
              player = usedCores.length + 1;
              tile = tile.replace(/_p([1-8])/, "_p" + player);
              mapData.tiles.push(tile);
              tileId = mapData.tiles.length - 1;
            }

            usedCores.push(player);
          }

          for(var posY = 0; posY < roomTile.sizeY; posY++) 
          {
            for(var posX = 0; posX < roomTile.sizeX; posX++) 
            {
              mapData.map[y + posY][x + posX]["tile"] = tileId;
              mapData.map[y + posY][x + posX]["data-id"] = mapData.tileIds.length - 1;
            }
          }
        }
      }

      map.resetRedoHistory();
      map.importData(JSON.stringify(mapData));
    }
    else
    {
      alert("Please select a valid map file.");

      return;
    }
  };

  this.fixFilename = function(filename) 
  {
    filename = filename.replace(map.copiedFilenameRegex, ".");

    return filename;
  };

  this.setFilename = function(filename, noVersion) 
  {
    var mapName = map.fixFilename(filename);
    mapName = mapName.substr(0, mapName.lastIndexOf("."));

    var versioning = document.getElementById("versioning"), mapNameInput = document.getElementById("mapName");

    if(!noVersion) 
    {
      var versionIndex = mapName.lastIndexOf("_"), version = parseInt(mapName.substr(-3));

      if(versionIndex !== -1 && !isNaN(version))
      {
        versioning.checked = true;
        map.updateVersion(version);
        mapName = mapName.substr(0, versionIndex);
      }
      else
        versioning.checked = false;
    }

    mapNameInput.value = mapName;
  };

  this.saveDraft = function(mapData) 
  {
    mapData = mapData || map.exportData();

    if(store.localStorage && mapData && mapData.length < store.remainingSpace / 2) 
    {
      store.removeItem("draft");
      store.setItem("draft", mapData);
    }
  };

  this.deleteDraft = function() 
  {
    store.removeItem("draft");
  };

  this.phantomJs = function() 
  {
    if(window.navigator.userAgent.indexOf("PhantomJS") !== -1) //Workarround for PhantomJS (http://phantomjs.org/), otherwise confirm/alert messages break tests 
    {
      window.confirm = function()
      {
        return true; //"This recalculates the whole map and may remove some of your changes. Are you sure you want to continue?"
      };

      window.alert = function()
      {
        return true; //"This recalculates the whole map and may remove some of your changes. Are you sure you want to continue?"
      };

      map.isPhantom = true;
    }
  };

  this.updateVersion = function(version) 
  {
    var oldVersion = version || map.version, newVersion = "00" + (parseInt(oldVersion) + 1);
    newVersion = newVersion.substring(-3);
    map.version = newVersion;

    return newVersion;
  };

  this.generateImageData = function(imagetype, imageoption) 
  {
    try 
    {
      var canvas = document.createElement("canvas");
      var completeWidth = map.mapSizeX + map.borderSize * 2, completeHeight = map.mapSizeY + map.borderSize * 2;
      var tileSize = map.tileSize;

      canvas.width = tileSize * completeWidth;
      canvas.height = tileSize * completeHeight;

      var context = canvas.getContext("2d");
      var noPreload = Object.keys(map.images).length === 0;

      for(var rows = 0; rows < completeHeight; rows++) 
      {
        for(var cols = 0; cols < completeWidth; cols++) 
        {
          var tile = document.getElementById("col_" + rows + "_" + cols), tileName = tile.getAttribute("class"), tileConfig = tiles[tileName];
          var image = null;

          if(noPreload) 
          {
            context.fillStyle = tileConfig.color;
            context.fillRect(cols * tileSize, rows * tileSize, tileSize, tileSize);
          }
          else
          {
            image = map.images[tileName];
            var tileSizeImageX = image.width / tileConfig.sizeX, tileSizeImageY = image.height / tileConfig.sizeY;
            //setTimeout(function(tile, tileSize, image, cols, rows) {
            context.drawImage(image, tile.getAttribute("data-pos-x") * tileSizeImageX, tile.getAttribute("data-pos-y") * tileSizeImageY, tileSizeImageX, tileSizeImageY, cols * tileSize, rows * tileSize, tileSize, tileSize);
            //}, 300, tile, map.tileSize, image, cols, rows);
          }
        }
      }

      return canvas.toDataURL(imagetype, imageoption);
    }
    catch(e)
    {
      alert("Image could not be generated.\n\nException message: " + e.message);
      console.error(e.stack);

      return null;
    }
  };

  this.generateSVG = function()
  {
    /*var canvas = document.getElementById("previewCanvas");
    var context = canvas.getContext("2d");*/
    var width = map.tileSize * map.mapSizeX + map.tileSize * (map.borderSize * 2),
        height = map.tileSize * map.mapSizeY + map.tileSize * (map.borderSize * 2);

    var data = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 " + width + " " + height + "' width='250' height='250'>" +
               "<style>" + document.getElementById("tileCss").innerHTML + "</style>" +
               "<foreignObject width='100%' height='100%'>" +
               "<div xmlns='http://www.w3.org/1999/xhtml' style='font-size:40px'>" +
               document.getElementById(map.mapTableId).outerHTML.replace(/&nbsp;/g, "31").replace(/id=\"([^\"]+)\"/g, "id=\"svg$1\"") +
               "</div>" +
               "</foreignObject>" +
               "</svg>";
    document.getElementById("preview").innerHTML = data;
  };

  this.mouseWheelListener = function(evt) 
  {
    if(evt.ctrlKey) 
    {
      var zoomIndicator = -evt.detail || evt.wheelDeltaY;
      map.calculateZoom(zoomIndicator > 0, evt.shiftKey);

      evt.preventDefault();
    }
  };

  this.keydownListener = function(evt)
  {
    if(evt.ctrlKey && evt.keyCode === 187 || evt.keyCode === 189) //187 = equal sign and 189 = dash
    {
      map.calculateZoom(evt.keyCode === 187, evt.shiftKey);

      evt.preventDefault();
    }
  };

  this.calculateZoom = function(zoomIndicator, turbo) 
  {
    var level = 0.2;
    if(turbo)
      level *= 2;

    var zoom = map.zoom;
    zoom += zoomIndicator ? level : -level;
    zoom = Math.max(0.2, Math.min(zoom, 4.0));

    map.zoomMap(zoom);
  };

  this.zoomMap = function(zoom) 
  {
    map.zoom = zoom;
    var mapTable = document.getElementById(map.mapTableId);
    mapTable.style.transform = "scale(" + zoom + ")";
  };
}

//Short helper-functions:
function overlayOn()
{
  document.getElementById("overlay").style.display = "block";
}

function overlayOff()
{
  document.getElementById("overlay").style.display = "none";
}

function infoBoxOff()
{
  document.getElementById("infoBox").style.display = "none";
}