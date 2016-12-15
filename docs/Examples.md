# Examples

Examples of the many ways Event-Station can be used.

### Using cross-emitter listening with a given context

```javascript
var student = EventStation.make();
var teacher = EventStation.make();

var book = "Harry Potter";

student.hear(teacher, 'read', function (pageNumber) {
    console.log('Today the class is reading ' + this + ' on page ' + pageNumber + '.');
}, book);

// Logs: "Today the class is reading Harry Potter on page 42."
teacher.emit('read', 42);
```

### Using a listener map with the `addTo()` and `off()` modifiers

```javascript
class MyWorker extends EventStation {}

var firstWorker = new MyWorker();
var secondWorker = new MyWorker();

var listeners = firstWorker.on({
    start: () => console.log("Worker started!"),
    stop: () => console.log("Worker stopped!"),
});

// Add the same listeners to the second worker
listeners.addTo(secondWorker);

// Remove the listeners from both workers
listeners.off();
```

### Chaining listener modifiers

```javascript
EventStation.make()
    // Create two listeners
    .on('boom pow')
    // That can occur only twice
    .occur(2)
    // That use the given context
    .using(context)
    // That use the given callback
    .calling(function () {})
    // Make a `Promise` that resolves after one of the listeners is called
    .race()
    .then(function () {
        console.log('Either "boom" or "pow" was emitted.');
    });
```

### Asynchronous Listeners

```javascript
var emitter = new EventStation();

// Attach a listener that writes a message to a file
emitter.on('message', function (message) {
    return new Promise(function (resolve, reject) {
        fs.appendFile('log.txt', message, function (err) {
            if (err) return reject(err);
            console.log('The message was successfully written to a file.');
            resolve();
        });
    });
});

// Attach a listener that logs a message to stdout
station.on('message', function (message) {
    console.log(message);
});

// Emit a message that will be logged to stdout and written to a file.
station.emitAsync('message', 'Hello World').then(function () {
    console.log('This message will display after the message is written to the file.');
});
```
