# Postr #

Postr is an experimental posting system developed as a means to learn/explore AngularJS and single page apps. 

The idea was to see how much interaction between the browser and web server could be minimized while still providing a familiar experience.   

In addition to page rendering and UX logic, the front end has a custom routing system that allows the site to generate and read permalinks and browser history events to emulate standard browsing.

The server handles a JSON API built with Node.js + Express + MongoDB.

To Run Locally
-------

Note: You must have a MongoDB server running at 127.0.0.1:27017 for the app to connect to.

1. Clone the repository:

        git clone https://github.com/imjoeco/postr-node.git
        cd postr-node

2. Install npm dependencies:

        npm install

3. Start up the server:

        node bin/www

License
-------
Copyright 2014 Joseph Hernandez

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
