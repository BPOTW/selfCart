import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "./scanner.css";

const Scanner = ({ onDetected }) => {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [error, setError] = useState("");
  const [torchOn, setTorchOn] = useState(false);

  const beep = new Audio("/beep.mp3");

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
          ],
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;

      const codeReader = new BrowserMultiFormatReader();

      controlsRef.current = await codeReader.decodeFromVideoElement(
        videoRef.current,
        (result) => {
          if (result) {
            beep.play().catch(() => {});
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
    <div className="scanner-container">
      <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
      <div className="scanner-guideBox"></div>

      {/* Torch button (optional)
      <div className="scanner-controls">
        <button onClick={toggleTorch} className="scanner-button">
          {torchOn ? "Off" : "On"}
        </button>
      </div> */}
      
      {error && <p className="scanner-error">{error}</p>}
    </div>
  );
};

export default Scanner;
