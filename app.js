// Get the first video element
const video = document.getElementsByTagName("video")[0];
let button = document.createElement("button");
button.textContent = "Click Me"; // Set the button text

// Define click event handler
button.addEventListener("click", async () => {
  // Check if the browser supports the Web Serial API
  if ("serial" in navigator) {
    try {
      // Request a port and open a connection.
      const port = await navigator.serial.requestPort();

      // Open the port.
      await port.open({ baudRate: 9600 });

      // Create a TextDecoder to handle the stream
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      let previousData = 0;
      let receivedData = "";

      // Listen for data from the port
      while (true) {
        try {
          const { value, done } = await reader.read();
          if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
          }
          // value is a string with the received data.
          receivedData += value;
          if (value === "\n") {
            try {
              let nubmerReceived = parseInt(receivedData.split(":")[1].trim());
              if (receivedData) {
                if (Math.abs(nubmerReceived != previousData)) {
                  previousData = nubmerReceived;
                  if(nubmerReceived == 1234) {
                    video.paused ? video.play() : video.pause();
                  }
                  else{
                  video.volume = Math.max(0, Math.min(1, nubmerReceived / 100));
                  }
                }
              }
            } catch (error) {
              console.log(error);
            }
            console.log(receivedData);
            receivedData = "";
          }
        } catch (err) {
          console.error(
            "There was an error reading from the serial port:",
            err
          );
          break;
        }
      }

      console.log("Successfully connected to the serial port");
    } catch (err) {
      // Handle any errors that occur during connection
      console.error("There was an error opening the serial port:", err);
    }
  } else {
    console.error("Web Serial API not supported in this browser");
  }
});

// let xpath = "/html/body/section/section/main/devsite-content/article/div[2]/google-codelab/div[2]/div[1]/google-codelab-step[1]/google-codelab-about/div[2]/h2";
let xpath = "/html/body/ytmusic-app/ytmusic-app-layout/ytmusic-player-bar";
let result = document.evaluate(
  xpath,
  document,
  null,
  XPathResult.FIRST_ORDERED_NODE_TYPE,
  null
);

if (result.singleNodeValue) {
  result.singleNodeValue.appendChild(button);
} else {
  console.error("Could not find element with provided XPath");
}
