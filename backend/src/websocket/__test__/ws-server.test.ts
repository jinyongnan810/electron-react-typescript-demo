import WebSocket from "ws";
xit("connect server without authentication", async (done) => {
  const ws = new WebSocket("ws://localhost:5000");
  ws.onopen = () => {
    console.log("Connected");
    done();
  };
  ws.onerror = (error) => {
    console.log(`Connect Error:${error.message}`);
    fail();
  };
});
