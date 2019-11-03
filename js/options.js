"use strict";

var mapAuthor = "D. Dubs";
var invalidLetterRegex = /[^A-Za-z0-9\.\-\_\söüäÖÜÄ\(\)]/g;
var width = null, height = null, first = null, second = null, third = null, fourth = null, reverse = null, extend = null, versioning = null, mapNameInput = null, rotate = null,
    active = "", imageFormat = null, jpegQuality = 1.0, recFileLinks = null, recFilesName = "", recFilesSize = 0, curRecFilesSize = 0, recFileObjects = [], openedFirst = true,
    changeSign = "Change";

//Only added through the standard open-method in options; this is on purpose, so you can add maps via drag and drop without leaving too apparent traces - incognito-mode light.
function RecentFile(filename, url)
{
  this.filename = filename;
  this.url = url;
}

function initOptions(recent)
{
  recFileLinks = document.getElementById("recFileLinks");
  var noRecFilesInfo = "No recent files have been saved yet.", linksFirstChild = recFileLinks.firstChild;
  if(linksFirstChild.textContent === noRecFilesInfo)
    recFileLinks.removeChild(linksFirstChild); 

  recFilesName = "recentFiles";
  recFilesSize = 3;
  recFileObjects = JSON.parse(store.getItem(recFilesName)) || [];

  curRecFilesSize = recFileObjects.length;
  if(curRecFilesSize > 0)
  {
    recFileLinks.innerHTML = ""; //Start fresh!

    for(var i = 0; i < curRecFilesSize; i++)
    {
      if(i >= recFilesSize) //Guarantee the correct amount of links.
        break;

      var openLink = document.createElement("a"), accKey = i + 1;
      openLink.setAttribute("href", "#");
      openLink.onclick = scopePreserver(recFileObjects[i].filename, recFileObjects[i].url);
      openLink.setAttribute("title", "Open this map (" + accKey + ").");
      openLink.setAttribute("accesskey", accKey);
      openLink.textContent = recFileObjects[i].filename; //https://blog.cloudboost.io/why-textcontent-is-better-than-innerhtml-and-innertext-9f8073eb9061
      recFileLinks.appendChild(openLink);
      recFileLinks.appendChild(document.createElement("br"));

      console.log(i + " - " + recFileObjects[i].filename + ": " + recFileObjects[i].url);
    }
  }
  else 
    recFileLinks.appendChild(document.createTextNode(noRecFilesInfo));

  if(!recent)
  {
    width = document.getElementById("width"),
    height = document.getElementById("height"),
    first = document.getElementById("first"),
    second = document.getElementById("second"),
    third = document.getElementById("third"),
    fourth = document.getElementById("fourth"),
    reverse = document.getElementById("reverse"),
    extend = document.getElementById("extend"),
    versioning = document.getElementById("versioning"),
    mapNameInput = document.getElementById("mapName");
    rotate = document.getElementById("rotate");
    imageFormat = document.getElementById("imageFormat");

    resetMirror();

    width.value = terrain.mapSizeX;
    height.value = terrain.mapSizeY;

    versioning.checked = store.getItem("versioning") || false;

    extend.onchange = resetPreview;
    reverse.onchange = resetPreview;
    rotate.onchange = resetPreview;

    first.onmouseover = mirrorTable;
    second.onmouseover = mirrorTable;
    third.onmouseover = mirrorTable;
    fourth.onmouseover = mirrorTable;

    first.onmouseout = resetPreview;
    second.onmouseout = resetPreview;
    third.onmouseout = resetPreview;
    fourth.onmouseout = resetPreview;

    first.onclick = setActive;
    second.onclick = setActive;
    third.onclick = setActive;
    fourth.onclick = setActive;
  }
}

function scopePreserver(filename, url)
{
  return function()
  {
    importMapFromLink(filename, url);
  };
}

function setActive()
{
  active = this.id;
}

function resetPreview()
{
  resetMirror();

  if(active)
    mirrorPreview(active);
}

function newMap(sizeX, sizeY)
{
  sizeX = parseInt(document.getElementById("width").value);
  sizeY = parseInt(document.getElementById("height").value);
  if(!isNaN(sizeX) && !isNaN(sizeY))
  {
    if(sizeX >= terrain.minSize && sizeY >= terrain.minSize && sizeX <= terrain.maxSize && sizeY <= terrain.maxSize)
    {
      var images = terrain.images;
      terrain = new Map(sizeX, sizeY);
      terrain.images = images;
      terrain.init();
      terrain.deleteDraft();

      toggleOptions(false);
    }
    else
    {
      alert("A valid map has to be at least " + terrain.minSize + " by " + terrain.minSize + " and " + terrain.maxSize + " by " + terrain.maxSize + " at most!");

      return;
    }
  }
  else
  {
    alert("Only numeric values are allowed!");

    return;
  }
}

function importMap()
{
  if(window.FileReader)
  {
    var files = document.getElementById("mapFile").files;
    if(files.length === 1)
    {
      if(files[0].name.match(invalidLetterRegex))
      {
        alert("Filename is invalid!");

        return;
      }

      var reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = function()
      {
        //Map loaded:
        try
        {
          var filename = files[0].name, dataUrl = atob(this.result), alreadyInc = false, arrayChanged = false; //"atob()" decodes a base-64 encoded string.
          for(var i = 0; i < curRecFilesSize; i++)
          {
            if(recFileObjects[i].filename.toString() === filename) //"indexOf" does not search for objects' contents in an array - poor. 
            {
              alreadyInc = true;

              if(openedFirst) //Always place an already existing recent file which is opened again first. Visual Studio (amongst others) does this, but I am not a fan of it, so make it easily deactivatable.
              {
                recFileObjects.swapElements(0, i);
                if(recFileObjects[curRecFilesSize] === changeSign) //"curRecFilesSize" is the last element at the moment, because "swapElements()" added the "changeSign".
                  arrayChanged = true;
                recFileObjects.pop(); //Change-designator is no longer needed - remove it.
              }

              break; //Loop has fulfilled its task.
            }
          }

          if(!alreadyInc) //Prevent duplicates.
          {
            recFileObjects.unshift(new RecentFile(filename, dataUrl));

            if(recFileObjects.length > recFilesSize)
              recFileObjects.pop(); //Queue (first in, first out - FIFO): Limit is reached, so remove the last element. 
          }

          terrain.resetRedoHistory();

          terrain.setFilename(filename);
          terrain.importData(dataUrl);

          if(!alreadyInc || openedFirst && arrayChanged) //"!" has a high, "&&" a medium and "||" a low precedence.
          {
            store.setItem(recFilesName, JSON.stringify(recFileObjects));
            initOptions(true); //Display the recent files immediately.
          }
        }
        catch(e)
        {
          alert("Please select a valid map file.\n\nException message: " + e.message);

          return;
        }

        toggleOptions(false);
      };
    }
    else
    {
      alert("Please select a valid map file.");

      return;
    }
  }
  else
  {
    alert("Your browser is not supported!");
    toggleOptions(false);

    return;
  }
}

function importMapFromLink(filename, dataUrl)
{
  if(typeof filename === "undefined" || filename.match(invalidLetterRegex))
  {
    alert("Filename is invalid!");

    return;
  }

  try
  {
    terrain.resetRedoHistory();

    terrain.setFilename(filename);
    //User opened a map through recent files. It is very likely that he remembers the few recent files, thus don't change the order of the list as it could be confusing.
    terrain.importData(dataUrl);
  }
  catch(e)
  {
    alert("Please select a valid map file.\n\nException message: " + e.message);

    return;
  }

  toggleOptions(false);
}

function importCsv()
{
  var files = document.getElementById("csv").files;

  if(files.length === 1)
  {
    if(files[0].name.match(invalidLetterRegex))
    {
      alert("Filename is invalid!");

      return;
    }

    var reader = new FileReader();
    reader.readAsText(files[0]);

    reader.onload = function()
    {
      terrain.importCsvData(this.result);
      terrain.setFilename(files[0].name, true);
    };

    toggleOptions(false);
  }
  else
    alert("Please select a valid map file.");
}

function setVersioning(element)
{
  store.setItem(element.id, element.checked);
  var mapVersion = document.getElementById("mapVersion");
  mapVersion.textContent = terrain.version;

  mapVersion.parentNode.style.display = element.checked ? "block" : "none";
}

function exportMap(type)
{
  var data = "", extension = ".mpr";
  if(type === "file")
  {
    //mapAuthor = document.getElementById("mapAuthor").value;
    data = btoa(terrain.exportData(mapAuthor)); //Export as "base64".
  }
  else
  {
    data = exportCsv(type);
    extension = ".csv";
  }

  var mapName = mapNameInput.value;
  if(mapName.length < 1 || mapName.match(invalidLetterRegex))
  {
    alert("Filename is invalid!");

    return;
  }

  if(versioning.checked)
  {
    mapName += "_" + terrain.version;
    terrain.updateVersion();
  }
  mapName += extension;

  //Use the native blob-constructor:
  var blob = new Blob([data], {type: "application/octet-stream"});

  if(window.navigator.msSaveOrOpenBlob)
  {
    //IE:
    window.navigator.msSaveOrOpenBlob(blob, mapName);

    return;
  }

  //Chrome:
  var href = window.URL.createObjectURL(blob);

  var exportLink = document.getElementById("exportLink");
  exportLink.setAttribute("download", mapName);
  exportLink.setAttribute("href", href);
  exportLink.setAttribute("target", "_blank");
  exportLink.click();

  //terrain.deleteDraft();

  toggleOptions(false);
}

function exportCsv(type)
{
  var json = terrain.mapToCsvJson(type), content = "";
  for(var i = 0; i < json.length; i++)
    content += json[i].join(",") + "\r\n";

  return content;
}

function exportImage()
{
  var mapName = mapNameInput.value, image = {};

  switch(imageFormat.value)
  {
    case "jpeg":
      image =
      {
        type: "image/jpeg",
        extension: "jpg",
        option: jpegQuality
      };
      break;
    case "png":
    default:
      image =
      {
        type: "image/png",
        extension: "png",
        option: null
      };
      break;
  }

  if(mapName.length < 1 || mapName.match(invalidLetterRegex))
  {
    alert("Filename is invalid!");

    return;
  }

  if(versioning.checked)
  {
    mapName += "_" + terrain.version;
    //terrain.updateVersion();
  }
  mapName += "." + image.extension;
  var data = terrain.generateImageData(image.type, image.option);
  if(data !== null)
  {
    var byteString = atob(data.replace(/^data:.*,/, ""));
    //console.log(byteString);

    var buffer = new ArrayBuffer(byteString.length), intArray = new Uint8Array(buffer);
    for(var i = 0; i < byteString.length; i++)
      intArray[i] = byteString.charCodeAt(i);

    var blob = new Blob([buffer], {type: image.type});

    if(window.navigator.msSaveOrOpenBlob)
    {
      //IE:
      window.navigator.msSaveOrOpenBlob(blob, mapName);

      return;
    }

    //Chrome:
    var href = window.URL.createObjectURL(blob);

    var exportLink = document.getElementById("exportLink");
    exportLink.setAttribute("download", mapName);
    exportLink.setAttribute("href", href);
    exportLink.setAttribute("target", "_blank");
    exportLink.click();

    toggleOptions(false);
  }
}

function saveOptions()
{
  //Save terrain temporary:
  var map = terrain.exportData();

  for(var item in terrain.options)
  {
    var element = document.getElementById(item);
    switch(element.nodeName.toLowerCase())
    {
      case "select":
        var value = element[element.selectedIndex].value;
        break;
    }

    var option = terrain.options[item].option;
    store.setItem(option, value); //Save it to "localStorage":
    terrain[option] = value;
    /* Execute post action:
     * terrain[terrain.options[item].postSave](value); */
  }

  //Apply possible changes:
  terrain.generateTileCss();
  terrain.importData(map);

  toggleOptions(false);
}

function resetOptions()
{
  store.clear();
	/* for(var item in terrain.options) 
   * {
	 *   var option = terrain[terrain.options[item].option + "Default"];
	 *   //Execute post action:
	 *   terrain[terrain.options[item].postSave](option);
	 * } */

  var map = terrain.exportData();
  terrain.resetToDefault();
  terrain.importData(map);
  //terrain.saveDraft(map);
  toggleOptions(false);
}

function refreshOptions()
{
  var generalOptions = document.getElementById("generalOptions") || document.createElement("div");
  generalOptions.id = "generalOptions";
  var general = document.getElementById("general"), saveOptions = document.getElementById("saveOptions");
  generalOptions.innerHTML = "";

  for(var item in terrain.options)
  {
    var label = document.createElement("label");
    label.htmlFor = item;
    label.textContent = camelToNormal(terrain.options[item].option) + ":";
    generalOptions.appendChild(label);

    var type = terrain.options[item].type, optionvalue = terrain.options[item].option;

    switch(type)
    {
      case "select":
        var element = document.createElement("select");
        element.id = item;

        for(var i = 0; i < terrain[item].length; i++)
        {
          var option = document.createElement("option");
          option.textContent = terrain[item][i];
          option.value = terrain[item][i];

          //Add "default" to the label to mark the default value:
          if(terrain[item][i] === terrain[optionvalue + "Default"])
            option.textContent = option.textContent + " (default)";

          //Select the current value:
          if(terrain[item][i] === terrain[optionvalue])
            option.selected = "selected";

          element.appendChild(option);
        }
        break;
    }

    generalOptions.appendChild(element);
    generalOptions.appendChild(document.createElement("br"));
  }

  general.insertBefore(generalOptions, saveOptions);

  setVersioning(document.getElementById("versioning"));
}

function toggleOptions(show)
{
  var options = document.getElementById("options");
  options.style.display = show ? "block" : "none";

  if(show)
  {
    refreshOptions();
    document.getElementById("width").focus();
  }
}

function mirrorTable()
{
  var type = this.id;
  resetMirror();
  mirrorPreview(type);
}

function mirrorPreview(type)
{
  switch(type)
  {
    case "first":
      extend.disabled = "";
      reverse.disabled = "disabled";
      rotate.disabled = "";

      first.setAttribute("class", "active");
      second.textContent = third.textContent = fourth.textContent = "1";
      fourth.setAttribute("class", "mirrorBoth");

      if(!rotate.checked)
      {
        second.setAttribute("class", "mirrorHorizontal");
        third.setAttribute("class", "mirrorVertical");
      }
      else
      {
        second.setAttribute("class", "rotate90");
        third.setAttribute("class", "rotate270");
        /* Fourth does not change:
         * fourth.setAttribute("class", "rotate180"); */
      }

      //Both sides need to have the same size for this to work properly!
      if(extend.checked && terrain.mapSizeX !== terrain.mapSizeY || !extend.checked && (terrain.mapSizeX / 2 % 1 !== 0 || terrain.mapSizeX / 2 !== terrain.mapSizeY / 2))
        rotate.disabled = "disabled";

      if(terrain.mapSizeX * 2 > terrain.maxSize || terrain.mapSizeY * 2 > terrain.maxSize)
        extend.disabled = "disabled";
      break;
    case "second":
      extend.disabled = reverse.disabled = "";
      rotate.disabled = "disabled";

      first.setAttribute("class", "active");
      second.setAttribute("class", "active");

      if(store.localStorage)
      {
        third.textContent = "1";
        fourth.textContent = "2";
        if(reverse.checked)
          third.parentNode.setAttribute("class", "mirrorBoth");
        else
          third.parentNode.setAttribute("class", "mirrorVertical");
      }
      else
      {
        //IE-fallback:
        if(reverse.checked)
        {
          third.textContent = "2";
          third.setAttribute("class", "mirrorBoth");
          fourth.textContent = "1";
          fourth.setAttribute("class", "mirrorBoth");
        }
        else
        {
          third.textContent = "1";
          third.setAttribute("class", "mirrorVertical");
          fourth.textContent = "2";
          fourth.setAttribute("class", "mirrorVertical");
        }
      }
      if(terrain.mapSizeY * 2 > terrain.maxSize)
        extend.disabled = "disabled";
      break;
    case "third":
    default:
      extend.disabled = reverse.disabled = "";
      rotate.disabled = "disabled";

      first.setAttribute("class", "active");
      third.setAttribute("class", "active");

      if(reverse.checked)
      {
        second.textContent = "3";
        second.setAttribute("class", "mirrorBoth");
        fourth.textContent = "1";
        fourth.setAttribute("class", "mirrorBoth");
      }
      else
      {
        second.textContent = "1";
        second.setAttribute("class", "mirrorHorizontal");
        fourth.textContent = "3";
        fourth.setAttribute("class", "mirrorHorizontal");
      }

      if(terrain.mapSizeX * 2 > terrain.maxSize)
        extend.disabled = "disabled";
      break;
  }
}

function mirrorMap()
{
  if(!active)
  {
    alert("Please choose a mirror-type!");

    return;
  }

  var ok = confirm("This recalculates the whole map and may remove some of your changes. Are you sure you want to continue?");
  //Extend the map:
  if(!extend.disabled && extend.checked)
  {
    switch(active)
    {
      case "first":
        terrain.mapSizeX *= 2;
        terrain.mapSizeY *= 2;
        break;
      case "second":
        terrain.mapSizeY *= 2;
        break;
      case "third":
      default:
        terrain.mapSizeX *= 2;
        break;
    }
  }

  if(ok)
  {
    var rev = !reverse.disabled ? reverse.checked : false;
    var rot = !rotate.disabled ? rotate.checked : false;

    terrain.mirrorMap(active, rev, rot);
    toggleOptions(false);
  }
}

function resetMirror()
{
  extend.disabled = reverse.disabled = rotate.disabled = "";
  extend.disabled = reverse.disabled = rotate.disabled = "disabled";

  first.removeAttribute("class");
  second.textContent = "2";
  second.removeAttribute("class");
  third.textContent = "3";
  third.removeAttribute("class");
  fourth.textContent = "4";
  fourth.removeAttribute("class");

  third.parentNode.removeAttribute("class");
}

function camelToNormal(camel)
{
  return camel.replace(/([A-Z])/g, " $1").replace(/^./, function(str) {return str.toUpperCase();}); //Insert a space before all uppercase letters and then capitalize the first character.
}

Array.prototype.swapElements = function(x, y) 
{
  //Early-out if there is an argument-problem:
  if(this.length === 1 || x === y || x < 0 || y < 0 || (x > this.length - 1 || y > this.length - 1))
    return this.push("No change");

  this.splice(y, 1, this.splice(x, 1, this[y])[0]);

  return this.push(changeSign);
};