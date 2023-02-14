import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const App = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  }, []);
  return <div className="App">hej</div>;
};

export default App;
