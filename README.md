# How to Run and Deploy the Node MySQL Upload App #

## Overview of the app ##

This is a NodeJS app that uses the following cloud services:

-   MySQL Database

This app demonstrates how to connect to a MySQL database on BlueMix from a NodeJS app. 
Simply upload a line-separated file of text (e.g. tweets), and it will add each line to MySQL.

## License ##
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## Prerequisites ##

Before we begin, we first need to install the command line tool that will be used to upload and manage your application. Cloud Foundry uses a tool called [**cf**](https://github.com/cloudfoundry/cli).  Make sure you are using v6 of the cf cli by using

	cf -v
	
to see the version.

## Deploying the App and Binding the MySQL Service ##

In the terminal, go to the directory of the app, and follow these steps.

1. Login to Bluemix.

   | *usage:*   | `$ cf login [-a API_URL] [-o ORG] [-s SPACE]`|
   |------------|----------------------------------------------|
   | *example:* | `$ cf login -a https://api.ng.bluemix.net`   |

2. Create an instance of the postgreSQL service, giving it a unique name in the last arguement.

   | *usage:*   | `$ cf create-service SERVICE PLAN SERVICE_INSTANCE`|
   |------------|----------------------------------------------------|
   | *example:* | `$ cf create-service mysql 100 mysql_NMU`          |

3. From the directory that houses the *app.js* file, push the app a --no-start option so we can bind our required service before starting our app, as well as a -c flag used by CloudFoundry to run your node app.  Give your app a unique app name to be used as its host; for example, this one would be https://nmu.ng.bluemix.net.

   | *usage:*   | `$ cf push APP [--no-manifest] [--no-start] [-c COMMAND]`                |
   |------------|--------------------------------------------------------------------------|
   | *example:* | `$ cf push nmu --no-manifest --no-start -c "node app.js"`                |

4. Bind the MySQL service instance to the new app

   | *usage:*   | `$ cf bind-service APP SERVICE_INSTANCE`|
   |------------|-----------------------------------------|
   | *example:* | `$ cf bind-service nmu mysql_NMU`       |

5. Start the app

   | *usage:*   | `$ cf start APP`                 |
   |------------|----------------------------------|
   | *example:* | `$ cf start nmu`                 |

