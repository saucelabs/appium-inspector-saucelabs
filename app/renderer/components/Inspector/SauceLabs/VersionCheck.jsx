import React, { useEffect, useState } from 'react';
import { shell } from 'electron';
import { CloseOutlined } from '@ant-design/icons';
import { version } from '../../../../../package.json';
import styles from './VersionCheck.css';

const VersionCheck = () => {
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const result = await fetch(
          'https://raw.githubusercontent.com/saucelabs/appium-inspector-saucelabs/feat/add-saucestreaming/package.json'
        );
        const { version: latestVersion } = await result.json();

        setShowUpdateMessage(latestVersion !== version);
      } catch (error) {
        setShowUpdateMessage(false);
      }
    };
    fetchVersion();
  }, []);

  return (
    showUpdateMessage && (
      <div className={styles.background}>
        <div
          className={`${styles.notification} ${styles.floatingCenter} ${styles.centerText}`}
        >
          <button
            type="button"
            className={styles.close}
            onClick={() => setShowUpdateMessage(false)}
          >
            <CloseOutlined className={`${styles.icon} ${styles.hover}`} />
          </button>
          <div className={`${styles.contentContainer} ${styles.info}`}>
            <p>
              A new version is available and can be downloaded{' '}
              <button
                className={styles.link}
                onClick={() =>
                  shell.openExternal(
                    'https://github.com/saucelabs/appium-inspector-saucelabs/releases'
                  )
                }
                type="button"
              >
                here
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    )
  );
};

export default VersionCheck;
