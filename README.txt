Usage
--------

Just open "index.html".
This works smoothly because this app only uses HTML, CSS and JavaScript.
It is capable of running without a web server and especially with no dependencies (not even jQuery!).


Code Relations
--------------------

The main handler is "editor.js". It initializes and manages the whole user interaction in the editor area.
The options menu has also quite some functionality in store therefore a seperate file called "options.js"
handles it. "importHelper.js", not even 100 lines of code, should be quite self-explanatory. "tiles.js" is
similar - it is a JSON-file. Finally, "storage.js" is a wrapper for HTML Web Storage aka "localStorage".

                   tiles.js
                      |
storage.js --- editor.js --- importHelper.js
      |                |
      ---------- options.js

Unfortunately, it is absolutely not equally easy to generate UML or something similar as it is with C#.
I searched a bit for a tool but did not find a convincing solution.

Electron
-----------

It was a conscious decision to not use Electron. Access to a web application (and in many cases also
usage) is just as easy as it gets, and I could not think of a use case where Mapper would really profit
from being an Electron-application.
Don't get me wrong: Electron is a great open-source framework and I am far away from being a dispraiser.

Grunt and JSHint
------------------------

Both were just short, albeit nice, digressions out of curiosity.

DalekJS
----------

I was testing this also out of curiosity (I heard almost only positive things about it) but with DalekJS I spent a really good amount of time.
The experience was all right, however it was not able to convert me in an avid supporter of automated testing.
The cross browser aspect is unquestionably really helpful, though.

DalekJS is regrettably not maintained any longer. TestCafé (https://devexpress.github.io/testcafe/)
is recommended as an alternative. Selenium (https://www.seleniumhq.org/) could be named here as well.