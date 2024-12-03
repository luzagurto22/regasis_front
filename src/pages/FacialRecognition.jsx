import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import * as faceapi from 'face-api.js';
import "primeflex/primeflex.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";

const FaceRecognition = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Cargar modelos al montar el componente
    const loadModels = async () => {
      const MODEL_URL = "./models"; // Carpeta donde guardas los modelos
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setIsModelsLoaded(true);
    };

    loadModels();
  }, []);

  const startCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          setIsCameraOn(true);
        })
        .catch((err) => {
          console.error("Error accessing the camera: ", err);
        });
    }
  };

  const stopCamera = () => {
    if (videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  };

  const handleVideoPlay = async () => {
    if (!isModelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ajustar el canvas al tamaño del video
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    // Procesar detecciones continuamente
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
    }, 100);
  };

  console.log(WebGLRenderingContext)
  return (
    <div className="p-d-flex flex-column p-ai-center p-p-4 flex" style={{alignItems:"center"}}>
      <h1 className="p-text-center p-mb-4">Reconocimiento Facial</h1>
      <Card className="p-shadow-2 p-p-3" style={{ width: "520px" }}>
        <div
          className="p-d-flex p-jc-center p-ai-center"
          style={{ position: "relative", height: "400px" }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            onPlay={handleVideoPlay}
            className="p-m-0"
            style={{
              display: isCameraOn ? "block" : "none",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          ></video>
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></canvas>
        </div>
        {!isCameraOn && <p className="text-center">Haz clic en "Abrir cámara" para empezar.</p>}
      </Card>
      <div className="p-d-flex p-jc-center mt-3">

        <Button
          label="Desactivar cámara"
          className="p-button-rounded p-button-danger"
          onClick={stopCamera}
          disabled={!isCameraOn}
        />
        <Button
          label="Abrir cámara"
          className="p-button-rounded p-button-primary p-mr-2"
          onClick={startCamera}
          disabled={isCameraOn}
        />

      </div>
    </div>
  );
};

export default FaceRecognition;
