const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const DataStore = require("nedb");

const taskDataBase = new DataStore({ filename: "./Databases/taskDataBase.db", autoload: true });
taskDataBase.loadDatabase();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = 3000;

let clients = [];

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

app.get('/events', eventsHandler);

function eventsHandler(request, response) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  response.writeHead(200, headers);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response
  };
  clients.push(newClient);
  console.log("New client: " + clientId);

  // Immediately send the current task data to the new client
  taskDataBase.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      response.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
}
let lastSentData = null;

function sendEventsToAll() {
  taskDataBase.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else if (JSON.stringify(data) !== JSON.stringify(lastSentData)) {
      console.log(data);
      clients.forEach(client => client.response.write(`data: ${JSON.stringify(data)}\n\n`));
      lastSentData = data;
    }
  });
}

setInterval(sendEventsToAll, 1000); // sends events to all clients every 10 seconds


app.post('/Tasks/SendTask', (req, res) => {
  console.log("Got POST submitTask request", req.body);
  const data = req.body;
  taskDataBase.insert(data, (err, newTask) => {
    if (err) {
      res.status(500).send({ error: err });
    } 
    else {
      res.status(200).json({
        TaskName: newTask.TaskName,
      });
    }
  });
})

app.delete("/api/Task/", (req, res) => {
  console.log("Got request to delete task:" + req.body.TaskName);
  taskDataBase.remove({TaskName: req.body.TaskName, _id: req.body._id}, {}, function (err, numRemoved) {
    if (err) {
      res.status(500).send({ error: err });
    } else {
      res.status(200).send(req.body.TaskName + " Deleted");
    }
  });
});
