import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const Scanner = ({ onDetected, onClose }) => {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [error, setError] = useState("");
  const [torchOn, setTorchOn] = useState(false);

  const beep = new Audio("/beep.mp3"); // place beep.mp3 in public folder

  useEffect(() => {
    startScanner();
  }, []);

  const startScanner = async () => {
  try {
    const devices = await BrowserMultiFormatReader.listVideoInputDevices();
    const device = devices[devices.length - 1];

    const constraints = {
      audio: false,
      video: {
        deviceId: device.deviceId,
        facingMode: "environment",
        focusMode: "continuous",
        advanced: [
          { focusMode: "continuous" },
          { focusMode: "auto" },
          { zoom: 2 },
        ]
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    videoRef.current.srcObject = stream;

    const codeReader = new BrowserMultiFormatReader();

    controlsRef.current = await codeReader.decodeFromVideoElement(
      videoRef.current,
      (result) => {
        if (result) {
          beep.play().catch(()=>{});
          onDetected(result.text);
        }
      }
    );

  } catch (err) {
    console.error(err);
    setError("Camera failed to start");
  }
};


  const toggleTorch = async () => {
    if (!controlsRef.current) return;
    try {
      await controlsRef.current.switchTorch(!torchOn);
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn("Torch not supported", err);
    }
  };

  return (
    <div style={styles.container}>
      <video ref={videoRef} style={styles.video} autoPlay playsInline muted />

      {/* Scan area */}
      <div style={styles.guideBox}></div>

      {/* Controls */}
      <div style={styles.controlPanel}>
        <button onClick={toggleTorch} style={styles.button}>
          {torchOn ? "💡 Off" : "💡 On"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

export default Scanner;

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "150px", // fixed area in your app
    overflow: "hidden",
    background: "black",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  guideBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "180px",
    height: "100px",
    border: "4px solid white",
    borderRadius: "10px",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 20px rgba(255,255,255,0.7)",
    pointerEvents: "none",
  },
  controlPanel: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "10px",
    zIndex: 3,
  },
  button: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: "8px",
  },
};
