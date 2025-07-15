# Examples

Examples of the many ways Event-Station can be used.

### Using cross-emitter listening with a given context

```javascript
const student = EventStation.create();
const teacher = EventStation.create();

const book = "Harry Potter";

student.hear(
  teacher,
  "read",
  function (pageNumber) {
    console.log(`Today the class is reading ${this} on page ${pageNumber}.`);
  },
  book
);

// Logs: "Today the class is reading Harry Potter on page 42."
teacher.emit("read", 42);
```

### Using a listener map with the `addTo()` and `off()` modifiers

```javascript
class MyWorker extends EventStation {}

const firstWorker = new MyWorker();
const secondWorker = new MyWorker();

const listeners = firstWorker.on({
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
EventStation.create()
  // Create two listeners
  .on("boom pow")
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
const emitter = new EventStation();

// Attach a listener that writes a message to a file
emitter.on("message", async (message) => {
  await fsPromises.appendFile("log.txt", message);

  console.log("The message was successfully written to a file.");
});

// Attach a listener that logs a message to stdout
station.on("message", function (message) {
  console.log(message);
});

// Emit a message that will be logged to stdout and written to a file.
await station.emitAsync("message", "Hello World");

console.log(
  "This message will display after the message is written to the file."
);
```
