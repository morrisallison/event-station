const EventStation = require("event-station");

class Spaceship extends EventStation {
  launch(destination) {
    this.emit("launch", destination);
  }
}

let Normandy = new Spaceship();
let Tempest = new Spaceship();

// Add two listeners via a listener map
let listeners = Normandy.on({
  launch: (dest) => console.log(`Spaceship launched! En route to ${dest}.`),
  dock: () => console.log("Spaceship docking."),
});

// Attach the same listeners to Tempest that are on Normandy
listeners.addTo(Tempest);

// Launch Tempest when Normandy launches
Tempest.hear(Normandy, "launch").once((dest) => Tempest.launch(dest));

// Launch both ships to the Andromeda Galaxy
Normandy.launch("Messier 31");

// Stop listening to both ships
listeners.off();
