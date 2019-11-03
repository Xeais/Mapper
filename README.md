# :hammer: Mapper
![Mapper running while the cursor is hovering over a tile.](https://user-images.githubusercontent.com/18394014/68084630-81c05500-fe38-11e9-8c08-e3cf20a1e9c1.png)
## Usage
Just open "index.html". 

This works smoothly, because this app only uses **HTML, CSS and JavaScript**, hence no web server is needed. Furthermore, there are no dependencies (**not even jQuery!**).
## Code Relations
The main handler is "editor.js". It initializes and manages the whole user interaction in the editor area. The *options menu* has also quite some functionality in store, therefore a seperate file called "options.js" handles it. "importHelper.js", not even 100 lines of code, should be quite self-explanatory. "tiles.js" is similar - it is a [JSON](https://www.w3schools.com/js/js_json_intro.asp)-file. Finally, "storage.js" is a wrapper for [**HTML Web Storage**](https://www.w3schools.com/html/html5_webstorage.asp) aka "localStorage".

```
                   tiles.js
                      |
storage.js --- editor.js --- importHelper.js
      |               |
      ---------- options.js
```

Unfortunately, it is absolutely not equally easy to generate UML or something similar as it is with C#. I searched a bit for a tool but did not find a convincing solution.
## Electron
It was a conscious decision to not use Electron. Access to a web application (and in many cases also usage) is just as easy as it gets, and I could not think of a use case where Mapper would really profit from being an Electron-application.

Don't get me wrong: Electron is a [great open-source framework](https://github.com/electron/electron) and I am far away from being a dispraiser.
## Grunt and JSHint
Both were just short, albeit nice, digressions out of curiosity.
## DalekJS
I was testing this also out of inquisitiveness (I heard almost only positive things about it) but with [DalekJS](http://dalekjs.com) I spent quite some time.

The experience was all right, however, it was not able to transform me in an avid supporter of automated testing. The cross browser aspect is unquestionably really helpful, though.

DalekJS is regrettably not maintained any longer. [TestCafé](https://devexpress.github.io/testcafe) is recommended as an alternative. [Selenium](https://www.seleniumhq.org) could be named here as well.
