const express = require('express');
const port = process.env.PORT || 3001;
const app = express();

app.get('/', (req, res) => {
 res.send("I am a backend server = POST"); 
});

app.listen(port, (err) => {
  if (err) {
    console.log(`Error: ${err.message}`);
  } else {
    console.log(`Listen on port ${port}`);
  }
});