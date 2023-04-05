# LoggerLite
# Usage
For use in Nodejs to create daily logs with time stamps for your application.<br>

# To use:

## Install the NPM package:
`npm i loggerlite`

## Create a new LoggerLite object:
```javascript
const logger = new LoggerLight("Test Dir", "Test Logs");
//The first argument is the name of the directory. It will be created if it does not exist
//The second argument is the name attached to the .log files
```

This logger object would create a directory and files that look like this:<br>
![image](https://user-images.githubusercontent.com/88867180/230150170-d23fb4f0-bd71-4d8a-a07d-6384df589618.png)

## Call the log() method:
```javascript
logger.log({ test: "test" }, "ERROR");
logger.log("test");
//The first argument is the message you want to log.
//The second argument is a string value that defines the message type. If not provided it will be of type INFO
```

Here is the expected output from the above code:<br>
![image](https://user-images.githubusercontent.com/88867180/230150852-75ee3694-fd1e-4b4e-834e-6adc403d668e.png)

If the log() function is called on a day for which no log file exists, a new file will be created to store all messages received on that day. If log() is called on a day that already has an associated file, the message will be appended to that file.

