import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import * as faceapi from "face-api.js";
import "primeflex/primeflex.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "../style/faceRecognition.css";

const FaceRecognition = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // Imagen del rostro capturada
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

  const captureImage = async () => {
    if (!isModelsLoaded || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const displaySize = { width: video.videoWidth, height: video.videoHeight };

    // Configurar el canvas para igualar el tamaño del video
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Detectar caras en la imagen capturada
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detections.length > 0) {
      // Dibujar la cara detectada en el canvas
      const faceBox = detections[0].box;
      context.strokeStyle = "#00FF00";
      context.lineWidth = 2;
      context.strokeRect(faceBox.x, faceBox.y, faceBox.width, faceBox.height);

      // Extraer la región del rostro como base64
      const faceCanvas = document.createElement("canvas");
      faceCanvas.width = faceBox.width;
      faceCanvas.height = faceBox.height;
      faceCanvas
        .getContext("2d")
        .drawImage(
          canvas,
          faceBox.x,
          faceBox.y,
          faceBox.width,
          faceBox.height,
          0,
          0,
          faceBox.width,
          faceBox.height
        );

      const faceImage = faceCanvas.toDataURL("image/jpeg");
      setCapturedImage(faceImage); // Guardar la imagen capturada
    } else {
      console.warn("No se detectaron caras. No se capturará ninguna imagen.");
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

    // Capturar imagen automáticamente después de 3 segundos
    setTimeout(captureImage, 3000);
  };

  return (
    <div
      className="p-d-flex flex-column p-ai-center p-p-4 flex"
      style={{ alignItems: "center" }}
    >
      <h1 className="p-text-center p-mb-4">Reconocimiento Facial</h1>
      <Card className="p-shadow-2 p-3" style={{ width: "520px" }}>
        <div
          className="p-d-flex p-jc-center p-ai-center"
          style={{ position: "relative", height: "400px" }}
        >
          <video
            className="p-m-0 video"
            style={{ display: isCameraOn ? "block" : "none" }}
            ref={videoRef}
            autoPlay
            muted
            onPlay={handleVideoPlay}
          />

          <canvas ref={canvasRef} className="canvas" />
        </div>
        {!isCameraOn && (
          <p className="text-center">Haz clic en "Abrir cámara" para empezar.</p>
        )}
      </Card>

      <div className="p-d-flex p-jc-center mt-3 flex gap-4">
        <Button
          className="rounded-lg p-button-danger"
          label="Desactivar cámara"
          onClick={stopCamera}
          disabled={!isCameraOn}
        />
        <Button
          className="rounded-lg"
          style={{ background: "#183462", border: "none" }}
          label="Abrir cámara"
          onClick={startCamera}
          disabled={isCameraOn}
        />
      </div>

      {capturedImage && (
        <div className="p-mt-4">
          <h3>Imagen capturada:</h3>
          <img
            src={capturedImage}
            alt="Captured Face"
            style={{ width: "200px", borderRadius: "10px" }}
          />
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
