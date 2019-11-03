"use strict";

function DataStorage()
{
  this.maxSpace = 5000000;
  this.remainingSpace = 0;

  this.hasStorageSupport = function()
  {
    try
    {
      if(!("localStorage" in window) || typeof window["localStorage"] === "undefined")
        return false;
      else
        return true;
    }
    catch(e)
    {
      return false;
    }
  };

  this.calculateSpace = function()
  {
    if(this.localStorage)
    {
      this.remainingSpace = this.maxSpace;
      for(var key in localStorage)
      {
        var item = localStorage.getItem(key);
        if(item)
          this.remainingSpace -= key.length + item.length;
      }
    }
  };

  this.setItem = function(name, value, days = 30)
  {
    if(this.localStorage)
    {
      localStorage.setItem(name, value);
      this.calculateSpace();

      //Logging:
      var output = "";
      for(var property in value)
        output += property + ": " + value[property] + "; ";
      if(output !== "")
        value = output;
      console.log("A \"localStorage\"-item \"" + name + "\" was set to \"" + value + "\".");

      return;
    }

    var expires = "";
    if(days !== -1)
    {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  };

  this.getItem = function(name)
  {
    var returnValue = null;
    if(this.localStorage)
    {
      returnValue = localStorage.getItem(name);
      console.log("A \"localStorage\"-item \"" + name + "\" was requested (" + returnValue + ").");
    }

    var nameEQ = name + "=", cookies = document.cookie.split(";");
    for(var i = 0; i < cookies.length; i++)
    {
      var cookie = cookies[i];
      while(cookie.charAt(0) === " ")
        cookie = cookie.substring(1, cookie.length);

      if(cookie.indexOf(nameEQ) === 0)
        returnValue = cookie.substring(nameEQ.length, cookie.length);
    }

    switch(returnValue)
    {
      case "null":
      case "undefined":
      case "false":
      case "true":
        returnValue = JSON.parse(returnValue);
        break;
    }

    return returnValue;
  };

  this.removeItem = function(name)
  {
    if(this.localStorage)
    {
      localStorage.removeItem(name);
      this.calculateSpace();

      return;
    }

    this.setItem(name, "", -1);
  };

  this.clear = function()
  {
    var ok = confirm("Do you really want to clear the whole \"localStorage\"?");

    if(ok)
    {
      if(this.localStorage)
      {
        localStorage.clear();
        this.calculateSpace();

        return;
      }

      var cookies = document.cookie.split(";");
      for(var i = 0; i < cookies.length; i++)
      {
        var cookie = cookies[i], eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

        this.setItem(name, "", -1);
      }

      console.log("\"localStorage\" has been cleared!");
    }
  };

  this.outputAll = function(verbose)
  {
    for(var i = 0; i < localStorage.length; i++)
      console.log(i + " - " + localStorage.key(i) + ": " + localStorage.getItem(localStorage.key(i)));
  };

  this.localStorage = this.hasStorageSupport();
  this.calculateSpace();
}