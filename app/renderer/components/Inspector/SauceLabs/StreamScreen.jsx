import React, { useCallback, useEffect } from 'react';
import { Spin } from 'antd';
import { ipcRenderer } from 'electron';
import { SCREENSHOT_INTERACTION_MODE } from '../shared';
import TouchDot from './TouchDot';
import styles from './StreamScreen.css';
import { SAUCE_IPC_TYPES } from '../../../../main/sauce';

/**
 * The video streaming screen
 *
 * @param {object} streamScreenData
 * @param {function} streamScreenData.applyAppiumMethod
 * @param {object} streamScreenData.canvasContainerRef
 * @param {object} streamScreenData.canvasElementRef
 * @param {function} streamScreenData.handleSwipeEnd
 * @param {function} streamScreenData.handleSwipeMove
 * @param {function} streamScreenData.handleSwipeStart
 * @param {object} streamScreenData.isMouseUsed
 * @param {object} streamScreenData.mouseCoordinates
 * @param {object} streamScreenData.mouseCoordinates.xCo
 * @param {object} streamScreenData.mouseCoordinates.yCo
 * @param {function} streamScreenData.onPointerEnter
 * @param {function} streamScreenData.onPointerLeave
 * @param {string} streamScreenData.platformName
 * @returns
 */
const StreamScreen = ({
  applyAppiumMethod,
  canvasContainerRef,
  canvasElementRef,
  canvasLoaded,
  handleSwipeEnd,
  handleSwipeMove,
  handleSwipeStart,
  isMouseUsed,
  mouseCoordinates: { xCo, yCo },
  onPointerEnter,
  onPointerLeave,
  platformName,
}) => {
  const isIOS = platformName.toLowerCase() == 'ios';
  /**
   * Handle the keyDown event
   * @param {*} event
   */
  const onKeyDown = useCallback(async (event) => {
    event.stopPropagation();
    const KEY_CODES = {
      arrowLeft: 'ArrowLeft',
      arrowRight: 'ArrowRight',
      backspace: 'Backspace',
      enter: 'Enter',
    };
    // Some special events need special codes
    if (
      event.key.length === 1 ||
      Object.values(KEY_CODES).includes(event.key)
    ) {
      let key;
      switch (event.key) {
        case KEY_CODES.arrowLeft:
          key = isIOS ? '\uE012' : event.key;
          break;
        case KEY_CODES.arrowRight:
          key = isIOS ? '\uE014' : event.key;
          break;
        case KEY_CODES.backspace:
          key = isIOS ? '\b' : event.key;
          break;
        case KEY_CODES.enter:
          key = isIOS ? '\n' : event.key;
          break;
        default:
          key = event.key;
          break;
      }
      if (isIOS) {
        return await applyAppiumMethod({
          methodName: SCREENSHOT_INTERACTION_MODE.TYPE,
          args: [key],
          skipRefresh: true,
        });
      }

      ipcRenderer.send(SAUCE_IPC_TYPES.WS_SEND_KEY, key);
    }
  }, []);
  /**
   * Add onKeydown event listener
   */
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <Spin size="large" spinning={!canvasLoaded}>
      <div className={styles.innerVideoStreamContainer}>
        <div
          ref={canvasContainerRef}
          className={styles.videoStreamBox}
          onPointerDown={handleSwipeStart}
          onPointerMove={handleSwipeMove}
          onPointerUp={handleSwipeEnd}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
        >
          {isMouseUsed && <TouchDot xPosition={xCo} yPosition={yCo} />}
          <canvas ref={canvasElementRef} />
        </div>
      </div>
    </Spin>
  );
};

export default StreamScreen;
