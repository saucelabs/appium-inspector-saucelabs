import React, { useRef, useState } from 'react';
import { Spin } from 'antd';
import { ipcRenderer } from 'electron';
import { SCREENSHOT_INTERACTION_MODE } from '../shared';
import webSocketHandler from './WebSocketHandler';
import StreamScreen from './StreamScreen';
import Explanation from './Explanation';
import { SAUCE_IPC_TYPES } from '../../../../main/sauce';
import styles from './StreamScreenContainer.css';
import Menu from './Menu';

/**
 * The Streaming container
 *
 * @param {object} streamScreenContainerData
 * @param {function} streamScreenContainerData.applyAppiumMethod
 * @param {number} streamScreenContainerData.deviceScreenSize.height
 * @param {number} streamScreenContainerData.deviceScreenSize.width
 * @param {object} streamScreenContainerData.driverData
 * @param {object} streamScreenContainerData.driverData.client
 * @param {object} streamScreenContainerData.driverData.client.capabilities
 * @param {string} streamScreenContainerData.driverData.client.capabilities.platformName
 * @param {string} streamScreenContainerData.driverData.client.capabilities.testobject_device_session_id
 * @param {object} streamScreenContainerData.serverData
 * @param {string} streamScreenContainerData.serverData.accessKey
 * @param {string} streamScreenContainerData.serverData.dataCenter
 * @param {string} streamScreenContainerData.serverData.username
 * @param {object} translation
 * @returns
 */
const StreamScreenContainer = ({
  applyAppiumMethod,
  deviceScreenSize,
  driverData: {
    client: {
      capabilities: { platformName, testobject_device_session_id = '' },
    },
  },
  serverData: { accessKey, dataCenter, username },
  translation,
}) => {
  //=======
  // States
  //=======
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const [clientOffsets, setClientOffsets] = useState(null);
  const [isMouseUsed, setIsMouseUsed] = useState(false);
  const [isTouchStarted, setIsTouchStarted] = useState(false);
  const [scaleRatio, setScaleRatio] = useState(1);
  const [touchEnd, setTouchEnd] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [wsRunning, setWsRunning] = useState(false);
  const [xCo, setXCo] = useState(null);
  const [yCo, setYCo] = useState(null);

  //=====
  // Refs
  //=====
  const canvasElement = useRef(null);
  const canvasContainer = useRef(null);

  //====================
  // Websocket constants
  //====================
  const isIOS = platformName.toLowerCase() == 'ios';
  const COORDINATES_SEPARATOR = ' ';
  const MOUSE_DOWN_CODE = 'd';
  const MOUSE_MOVE_CODE = 'm';
  const MOUSE_UP_CODE = 'u';

  //========
  // Methods
  //========
  /**
   * Create the touch message for the websocket
   * @param {string} actionCode
   * @param {object} event
   *
   * @returns {string}
   */
  const buildWsTouchMessage = (actionCode, event) => {
    // Touch Event 1 finger click
    //  Down:
    //    mt/d 325 707 0 1 0 252 439
    //  Up:
    //    mt/u 325 707 0 1 0 252 439
    //
    // Touch Event 1 finger swipe
    //  Down:
    //    mt/d 325 707 0 1 0 75 497
    //  Move:
    //    mt/m 325 707 0 1 0 178 498
    //    .....
    //  Up:
    //    mt/u 325 707 0 1 0 178 498
    //
    // Touch Events 2 fingers pinch
    //  Down:
    //    mt/d 325 707 0 2 0 175 376 1 150 331
    //  Move:
    //    mt/m 325 707 0 2 0 190 393 1 135 314
    //    ......
    //  Up:
    //    mt/u 325 707 0 2 0 190 393 1 135 314
    //
    // Touch Message should be
    //    mt/d-m-u 325 707 0 1 0 56 486 1 135 314
    //             |   |   | | | |  |   | |   |_touch_two_y
    //             |   |   | | | |  |   | |_touch_two_x
    //             |   |   | | | |  |   |_SECOND_TOUCH_INDEX = 1;
    //             |   |   | | | |  |_touch_one_y
    //             |   |   | | | |_touch_one_x
    //             |   |   | | |_firstTouch ? 0 : 1;
    //             |   |   | |_touchCount = multiTouch ? 2 : 1;
    //             |   |   |_orientationCode => portrait ? 0 : 1
    //             |   |_canvas_height
    //             |_canvas_width
    const orientationCode = 0;
    const touchCount = 1;
    const firstTouch = 0;
    const touchX = Math.floor(event.clientX - clientOffsets.left);
    const touchY = Math.floor(event.clientY - clientOffsets.top);

    return (
      actionCode +
      COORDINATES_SEPARATOR +
      Math.floor(deviceScreenSize.width * scaleRatio) +
      COORDINATES_SEPARATOR +
      Math.floor(deviceScreenSize.height * scaleRatio) +
      COORDINATES_SEPARATOR +
      orientationCode +
      COORDINATES_SEPARATOR +
      touchCount +
      COORDINATES_SEPARATOR +
      firstTouch +
      COORDINATES_SEPARATOR +
      touchX +
      COORDINATES_SEPARATOR +
      touchY
    );
  };
  /**
   * Handle the swipe start
   * @param {*} e
   */
  const handleSwipeStart = (e) => {
    setIsTouchStarted(true);

    if (isIOS) {
      return setTouchStart({
        x: Math.floor((e.clientX - clientOffsets.left) / scaleRatio),
        y: Math.floor((e.clientY - clientOffsets.top) / scaleRatio),
      });
    }
    ipcRenderer.send(
      SAUCE_IPC_TYPES.WS_SEND_TOUCH,
      buildWsTouchMessage(MOUSE_DOWN_CODE, e)
    );
  };
  /**
   * Handle the Swipe move
   * @param {*} e
   */
  const handleSwipeMove = (e) => {
    setXCo(e.clientX - clientOffsets.left);
    setYCo(e.clientY - clientOffsets.top);

    if (!isTouchStarted) {
      return;
    }
    if (isIOS) {
      return setTouchEnd({
        x: Math.floor((e.clientX - clientOffsets.left) / scaleRatio),
        y: Math.floor((e.clientY - clientOffsets.top) / scaleRatio),
      });
    }

    ipcRenderer.send(
      SAUCE_IPC_TYPES.WS_SEND_TOUCH,
      buildWsTouchMessage(MOUSE_MOVE_CODE, e)
    );
  };
  /**
   * Handle the swipe end
   */
  const handleSwipeEnd = async (e) => {
    // This is a swipe
    if (
      isIOS &&
      touchEnd &&
      JSON.stringify(touchStart) !== JSON.stringify(touchEnd)
    ) {
      await applyAppiumMethod({
        methodName: SCREENSHOT_INTERACTION_MODE.SWIPE,
        args: [touchStart.x, touchStart.y, touchEnd.x, touchEnd.y],
        skipRefresh: true,
      });
    } else if (isIOS) {
      // This is a single click
      await applyAppiumMethod({
        methodName: SCREENSHOT_INTERACTION_MODE.TAP,
        args: [touchStart.x, touchStart.y],
        skipRefresh: true,
      });
    } else {
      // For Android
      ipcRenderer.send(
        SAUCE_IPC_TYPES.WS_SEND_TOUCH,
        buildWsTouchMessage(MOUSE_UP_CODE, e)
      );
    }

    // Now reset
    setIsTouchStarted(false);
    setTouchStart(null);
    setTouchEnd(null);
  };
  /**
   * When to show the touch dot
   */
  const onPointerEnter = () => setIsMouseUsed(true);
  /**
   * Reset data when mouse is out of the canvas
   */
  const onPointerLeave = () => setIsMouseUsed(false);

  //========
  // Effects
  //========
  /**
   * Start and handle the websocket connection and create the video stream
   */
  webSocketHandler({
    canvasContainer,
    canvasElement,
    canvasLoaded,
    connectionData: {
      accessKey,
      dataCenter,
      sessionId: testobject_device_session_id,
      username,
    },
    clientOffsets,
    deviceScreenSize,
    setCanvasLoaded,
    setClientOffsets,
    setScaleRatio,
    setWsRunning,
  });

  return (
    <>
      {wsRunning ? (
        <div className={styles.streamScreenContainer}>
          <StreamScreen
            applyAppiumMethod={applyAppiumMethod}
            canvasContainerRef={canvasContainer}
            canvasElementRef={canvasElement}
            canvasLoaded={canvasLoaded}
            handleSwipeEnd={handleSwipeEnd}
            handleSwipeMove={handleSwipeMove}
            handleSwipeStart={handleSwipeStart}
            isMouseUsed={isMouseUsed}
            mouseCoordinates={{ xCo, yCo }}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            platformName={platformName}
          />
          <Menu
            applyAppiumMethod={applyAppiumMethod}
            platformName={platformName}
            translation={translation}
          />
          <Explanation translation={translation} />
        </div>
      ) : (
        <div className={styles.sauceSpinner}>
          <Spin size="large" />
        </div>
      )}
    </>
  );
};

export default StreamScreenContainer;
