import React, { useEffect, useRef } from 'react';

/**
 * Handle the websocket connection with Sauce Labs
 *
 * @param {object} param0
 * @param {object} param0.canvasElement
 * @param {object} param0.clientOffsets
 * @param {number} param0.clientOffsets.left
 * @param {number} param0.clientOffsets.top
 * @param {string} param0.dataCenter
 * @param {function} param0.getCanvasData
 * @param {boolean} param0.isCookieRetrieved
 * @param {function} param0.setClientOffsets
 * @param {number} param0.scaleRatio
 * @param {function} param0.setScaleRatio
 * @param {boolean} param0.setWsRunning
 * @param {string} param0.sessionId
 * @param {object} param0.windowSize
 * @param {number} param0.windowSize.height
 * @param {number} param0.windowSize.width
 */
const webSocketHandler = ({
  canvasElement,
  clientOffsets,
  dataCenter,
  getCanvasData,
  isCookieRetrieved,
  setClientOffsets,
  scaleRatio,
  setScaleRatio,
  setWsRunning,
  sessionId,
  windowSize,
}) => {
  const wsUrl = `wss://api.${dataCenter}.saucelabs.com/v1/rdc/socket/alternativeIo/${sessionId}`;
  const ws = useRef(null);

  /**
   * Render the canvas
   * @param {*} image
   */
  const renderCanvas = (image) => {
    const { left, ratio, top } = getCanvasData();
    setScaleRatio(ratio);
    if (!clientOffsets) {
      setClientOffsets({ left, top });
    }
    const canvas = canvasElement.current;
    const context = canvas.getContext('2d');
    const isImageLandspace = image.width > image.height;
    const canvasWidth = windowSize.width * ratio;
    const canvasHeight = windowSize.height * ratio;
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    if (isImageLandspace) {
      context.save();
      context.translate(centerX, centerY);
      context.rotate((90 * Math.PI) / 180);
      context.drawImage(image, -centerY, -centerX, canvasHeight, canvasWidth);
      context.restore();
    } else {
      context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    }
  };
  /**
   * Create the image
   * @param {*} data
   */
  const renderImage = (data) => {
    const blob = new Blob([data], { type: 'image/jpeg' });
    let image = new Image();

    image.onload = function () {
      image.onload = null;
      image.onerror = null;
      renderCanvas(image);
      // @TODO: check what this one does
      // framebufferStats.update();
      window.URL.revokeObjectURL(image.src);
      image = null;
    };

    image.onerror = function (error) {
      image.onload = null;
      image.onerror = null;
      console.error('Could not load image', error);
    };

    image.src = window.URL.createObjectURL(blob);
    ws.current.send('n/');
  };
  /**
   * Handle the WS message
   * @param {*} event
   */
  const handleMessage = (event) => {
    const message = event.data;

    if (message instanceof Blob) {
      renderImage(message);
    }
  };

  /**
   * Handle starting the WS
   */
  useEffect(() => {
    if (isCookieRetrieved) {
      ws.current = new WebSocket(wsUrl);
      ws.current.binaryType = 'blob';
      ws.current.onopen = () => {
        console.log('Connected to the server');
        setWsRunning(true);
      };

      ws.current.onclose = (e) => {
        console.log('ws.onclose e = ', e);
        console.log('Disconnected. Check internet or server.');
        setWsRunning(false);
      };
      ws.current.onerror = (e) => {
        // @TODO: handle error for WS
        console.log('onerror error = ', e);
        setWsRunning(false);
      };

      const wsCurrent = ws.current;

      return () => {
        wsCurrent.close();
      };
    }
  }, [isCookieRetrieved]);

  /**
   * Handle the WS messages
   */
  useEffect(() => {
    if (isCookieRetrieved) {
      if (!ws.current) {
        return;
      }
      // Ran when teh app receives a message from the server
      ws.current.onmessage = (e) => handleMessage(e);
    }
  }, [isCookieRetrieved]);
};

export default webSocketHandler;
