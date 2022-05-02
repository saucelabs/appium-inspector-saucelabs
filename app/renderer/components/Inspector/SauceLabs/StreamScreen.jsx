import React, { useCallback, useEffect } from 'react';
import { SCREENSHOT_INTERACTION_MODE } from '../shared';
import TouchDot from './TouchDot';
import styles from './StreamScreen.css';

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
          key = '\uE012';
          break;
        case KEY_CODES.arrowRight:
          key = '\uE014';
          break;
        case KEY_CODES.backspace:
          key = isIOS ? '\b' : '\uE003';
          break;
        case KEY_CODES.enter:
          key = isIOS ? '\n' : '\uE007';
          break;
        default:
          key = event.key;
          break;
      }
      await applyAppiumMethod({
        methodName: SCREENSHOT_INTERACTION_MODE.TYPE,
        args: [key],
        skipRefresh: true,
      });
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
        {isMouseUsed && canvasLoaded && (
          <TouchDot xPosition={xCo} yPosition={yCo} />
        )}
        <canvas ref={canvasElementRef} />
        {!canvasLoaded && (
          <div className={styles.emptyBackground}>
            <div className={styles.sauceLogo}>
              <svg
                className={styles.sauceLogoSvg}
                width="32"
                height="32"
                viewBox="0 0 32 32"
              >
                <path d="M3.894 20.567c-.92-2.336-.85-4.602-.85-4.602C3.044 8.815 8.849 3.009 16 3.009c.637 0 1.204.071 1.841.142l-1.416 1.487H16c-6.23 0-11.327 5.097-11.327 11.327 0 0 0 1.558.425 3.115h9.912l-4.177 7.858 10.053-10.124H7.222L22.585 1.451C20.603.531 18.337.035 16.001.035c-8.85-.071-16 7.08-16 15.929 0 5.734 3.044 10.832 7.646 13.664l4.743-8.991-8.496-.071z"></path>
                <path d="M24.354 2.301l-4.743 8.991h8.496s.85 1.982.85 4.602c0 7.15-5.805 12.956-12.956 12.956-.637 0-1.274-.071-1.912-.142l1.416-1.487h.425c6.23 0 11.327-5.097 11.327-11.327 0 0 0-1.628-.425-3.115h-9.841l4.177-7.858-10.265 10.265h13.735L9.417 30.549c1.982.92 4.248 1.416 6.584 1.416 8.779 0 16-7.15 16-16 0-5.735-3.115-10.832-7.646-13.664z"></path>
              </svg>
            </div>
            <div className={styles.loadingText}>
              Loading device video stream...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamScreen;
